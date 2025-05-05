/**
 * MCP Integration Platform - Authentication System
 * 
 * This module implements a session-based authentication system using Passport.js
 * with secure password handling via scrypt and PostgreSQL database storage.
 */

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import crypto from 'crypto';
import logger from './utils/logger';
import { storage } from './storage';
import { type User } from '@shared/schema';
import { ZodError } from 'zod';

// Create a specialized logger for auth operations
const authLogger = logger.child('Auth');

import { User as DbUser } from '@shared/schema';

// Type assertion to handle null to undefined conversion
type UserWithOptionals = {
  id: number;
  username: string;
  email: string;
  password: string;
  name?: string;
  role?: string;
  apiKey?: string;
  active?: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

// Convert from database user type to Express user type
function convertUser(dbUser: DbUser): UserWithOptionals {
  return {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    password: dbUser.password,
    name: dbUser.name ?? undefined,
    role: dbUser.role ?? undefined,
    apiKey: dbUser.apiKey ?? undefined,
    active: dbUser.active ?? undefined,
    lastLogin: dbUser.lastLogin ?? undefined,
    createdAt: dbUser.createdAt ?? undefined,
    updatedAt: dbUser.updatedAt ?? undefined
  };
}

declare global {
  namespace Express {
    // Extend Express User with our User type
    interface User extends UserWithOptionals {}
  }
}

/**
 * Configure Express app with authentication middleware
 */
export function setupAuth(app: Express): void {
  authLogger.info('Setting up authentication system');
  
  // Generate a new secret on server start if not provided in environment
  const sessionSecret = process.env.SESSION_SECRET || crypto.randomUUID();
  
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    }
  };
  
  app.set('trust proxy', 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Log the cookie settings for debugging
  authLogger.debug('Session cookie settings:', sessionSettings.cookie);
  
  // Configure passport to use local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      async (username, password, done) => {
        try {
          // Use storage service to validate credentials
          const user = await storage.validateUserCredentials(username, password);
          
          if (!user) {
            authLogger.warn(`Authentication failed for username: ${username}`);
            return done(null, false, { message: 'Invalid username or password' });
          }
          
          // Track last login time
          await storage.updateUserLastLogin(user.id);
          
          // Authentication successful
          authLogger.info(`User authenticated successfully: ${user.username} (${user.id})`);
          return done(null, convertUser(user));
        } catch (error) {
          authLogger.error('Authentication error:', error);
          return done(error);
        }
      }
    )
  );
  
  // Serialize user to the session
  passport.serializeUser((user: Express.User, done) => {
    authLogger.debug(`Serializing user to session: ${user.id}`);
    done(null, user.id);
  });
  
  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      
      if (!user) {
        authLogger.warn(`Failed to deserialize user: ${id} (not found)`);
        return done(null, false);
      }
      
      if (!user.active) {
        authLogger.warn(`Failed to deserialize user: ${id} (inactive account)`);
        return done(null, false);
      }
      
      authLogger.debug(`Deserialized user: ${user.username} (${user.id})`);
      done(null, convertUser(user));
    } catch (error) {
      authLogger.error(`Error deserializing user ${id}:`, error);
      done(error);
    }
  });
  
  // Debug middleware to log session and auth info
  if (process.env.NODE_ENV !== 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      authLogger.debug(`Session ID: ${req.sessionID}`);
      authLogger.debug(`Is Authenticated: ${req.isAuthenticated()}`);
      
      if (req.isAuthenticated()) {
        authLogger.debug(`User: ${(req.user as User).username} (${(req.user as User).id})`);
      }
      
      next();
    });
  }
  
  // Registration endpoint
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      // Parse and validate the registration data
      const validatedData = req.body;
      
      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        authLogger.warn(`Registration attempted with existing username: ${validatedData.username}`);
        return res.status(409).json({ error: 'Username already exists' });
      }
      
      // Check if email is already taken
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        authLogger.warn(`Registration attempted with existing email: ${validatedData.email}`);
        return res.status(409).json({ error: 'Email already exists' });
      }
      
      // Create the new user
      const userData = {
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password,
        name: validatedData.name
      };
      
      const newUser = await storage.createUser(userData);
      
      // Log the user in automatically
      req.login(convertUser(newUser), (err) => {
        if (err) {
          authLogger.error('Error logging in after registration:', err);
          return res.status(500).json({ error: 'Error logging in after registration' });
        }
        
        // Return user without sensitive fields
        const safeUser = {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          createdAt: newUser.createdAt
        };
        
        authLogger.info(`User registered successfully: ${newUser.username} (${newUser.id})`);
        return res.status(201).json(safeUser);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        authLogger.warn('Registration validation error:', error.errors);
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      
      authLogger.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error during registration' });
    }
  });
  
  // Login endpoint
  app.post('/api/login', 
    (req, res, next) => {
      try {
        // Login data is validated by Passport
        authLogger.debug(`Login attempt: ${req.body.username}`);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({
            error: 'Validation failed',
            details: error.errors
          });
        }
        next(error);
      }
    },
    passport.authenticate('local'),
    (req: Request, res: Response) => {
      // Authentication successful
      const user = req.user as User;
      
      // Return user without sensitive fields
      const safeUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      };
      
      authLogger.info(`User logged in successfully: ${user.username} (${user.id})`);
      res.status(200).json(safeUser);
    }
  );
  
  // Logout endpoint
  app.post('/api/logout', (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      const user = req.user as User;
      authLogger.info(`Logout initiated for user: ${user.username} (${user.id})`);
      
      req.logout((err) => {
        if (err) {
          authLogger.error('Logout error:', err);
          return next(err);
        }
        
        authLogger.info(`User logged out successfully: ${user.username} (${user.id})`);
        res.status(200).json({ success: true });
      });
    } else {
      authLogger.debug('Logout attempted while not authenticated');
      res.status(200).json({ success: true });
    }
  });
  
  // User info endpoint
  app.get('/api/user', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      authLogger.debug('User info requested while not authenticated');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = req.user as User;
    
    // Return user without sensitive fields
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    };
    
    authLogger.debug(`User info returned: ${user.username} (${user.id})`);
    res.status(200).json(safeUser);
  });
  
  // API key generation endpoint
  app.post('/api/user/apikey', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      const apiKey = await storage.generateApiKey(user.id);
      
      authLogger.info(`API key generated for user: ${user.username} (${user.id})`);
      res.status(200).json({ apiKey });
    } catch (error) {
      authLogger.error('API key generation error:', error);
      res.status(500).json({ error: 'Failed to generate API key' });
    }
  });
  
  // API key revocation endpoint
  app.delete('/api/user/apikey', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      await storage.revokeApiKey(user.id);
      
      authLogger.info(`API key revoked for user: ${user.username} (${user.id})`);
      res.status(200).json({ success: true });
    } catch (error) {
      authLogger.error('API key revocation error:', error);
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  });
  
  authLogger.info('Authentication system setup complete');
}

/**
 * Middleware to require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    next();
  } else {
    logger.warn('Unauthorized access attempt', {
      tags: ['auth', 'access', 'unauthorized'],
      data: { path: req.path, method: req.method }
    });
    res.status(401).json({ error: 'Authentication required' });
  }
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated() && (req.user as User).role === 'admin') {
    next();
  } else {
    logger.warn('Unauthorized admin access attempt', {
      tags: ['auth', 'access', 'unauthorized', 'admin'],
      data: { 
        path: req.path, 
        method: req.method,
        isAuthenticated: req.isAuthenticated(),
        role: req.isAuthenticated() ? (req.user as User).role : null
      }
    });
    res.status(403).json({ error: 'Admin access required' });
  }
}
