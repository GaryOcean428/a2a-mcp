/**
 * MCP Integration Platform - Authentication System
 * 
 * This module implements a session-based authentication system using Passport.js
 * with secure password handling via scrypt.
 */

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import MemoryStore from 'memorystore';
// Import directly from default export
import logger from './utils/logger';

// Create memory store for sessions
const MemoryStoreSession = MemoryStore(session);

// Use promisify to convert callback-based scrypt to Promise-based
const scryptAsync = promisify(scrypt);

// User type for authentication
export interface User {
  id: number;
  username: string;
  password: string; // Stored as hash.salt
  email?: string;
  name?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

// In-memory user storage for development
// Replace with database integration in production
const users: User[] = [
  {
    id: 1,
    username: 'admin',
    // Password is "admin" - this is a secure hash using scrypt
    password: '746c68c1cfae22bfda3f4ecdebacbc4bcc6dcaaa9d9fa27e04c9958d8595a067.fc7c45a10a972ef356ba4336a427e8d2',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    username: 'user',
    // Password is "user" - this is a secure hash using scrypt
    password: '54ff94371e2639cd18eeedd091d0dbefd28e4e1be5d4d54a7431984a4fbe5649.32df63d7f9321fd232892dbf8bff0423',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Hash a password using scrypt
 */
async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = randomBytes(16).toString('hex');
  // Hash the password with the salt
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  // Return the hash and salt together
  return `${derivedKey.toString('hex')}.${salt}`;
}

/**
 * Compare a password with a stored hash
 */
async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    // Split the stored string to get the hash and salt
    const [hashedPassword, salt] = stored.split('.');
    
    // Hash the supplied password with the same salt
    const derivedKey = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    // Compare the hashes in constant time to prevent timing attacks
    return timingSafeEqual(
      Buffer.from(hashedPassword, 'hex'),
      derivedKey
    );
  } catch (error) {
    logger.error('Password comparison error', {
      tags: ['auth', 'password', 'error'],
      error
    });
    return false;
  }
}

/**
 * Find a user by ID
 */
async function getUserById(id: number): Promise<User | undefined> {
  return users.find(user => user.id === id);
}

/**
 * Find a user by username
 */
async function getUserByUsername(username: string): Promise<User | undefined> {
  return users.find(user => user.username === username);
}

/**
 * Create a new user
 */
async function createUser(data: Omit<User, 'id' | 'password'> & { password: string }): Promise<User> {
  // Hash the password before storing
  const hashedPassword = await hashPassword(data.password);
  
  // Create a new user with the next available ID
  const newUser: User = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    username: data.username,
    password: hashedPassword,
    email: data.email,
    name: data.name,
    role: data.role || 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Add the user to our in-memory storage
  users.push(newUser);
  
  // Return the user (without the password)
  const { password, ...userWithoutPassword } = newUser;
  return { ...userWithoutPassword, password: '[REDACTED]' } as User;
}

/**
 * Check if a username is already taken
 */
async function isUsernameTaken(username: string): Promise<boolean> {
  return users.some(user => user.username === username);
}

/**
 * Configure Express app with authentication middleware
 */
export function setupAuth(app: Express): void {
  logger.info('Setting up authentication system', {
    tags: ['auth', 'setup']
  });
  
  // Generate a new secret on server start
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
  
  // Session configuration
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
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
  logger.debug('Session cookie settings:', {
    tags: ['auth', 'session'],
    data: sessionSettings.cookie
  });
  
  // Configure passport to use local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      async (username, password, done) => {
        try {
          // Look up the user by username
          const user = await getUserByUsername(username);
          
          // If no user found or password doesn't match, authentication fails
          if (!user || !(await comparePasswords(password, user.password))) {
            logger.warn('Authentication failed', {
              tags: ['auth', 'login', 'fail'],
              data: { username, reason: !user ? 'user_not_found' : 'password_mismatch' }
            });
            return done(null, false, { message: 'Invalid username or password' });
          }
          
          // Authentication successful
          logger.info('Authentication successful', {
            tags: ['auth', 'login', 'success'],
            data: { userId: user.id, username: user.username }
          });
          return done(null, user);
        } catch (error) {
          logger.error('Authentication error', {
            tags: ['auth', 'login', 'error'],
            error
          });
          return done(error);
        }
      }
    )
  );
  
  // Serialize user to the session
  passport.serializeUser((user: Express.User, done) => {
    logger.debug('Serializing user to session', {
      tags: ['auth', 'session'],
      data: { userId: (user as User).id }
    });
    done(null, (user as User).id);
  });
  
  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await getUserById(id);
      
      if (!user) {
        logger.warn('Failed to deserialize user', {
          tags: ['auth', 'session'],
          data: { userId: id, reason: 'user_not_found' }
        });
        return done(null, false);
      }
      
      logger.debug('Deserialized user from session', {
        tags: ['auth', 'session'],
        data: { userId: user.id, username: user.username }
      });
      done(null, user);
    } catch (error) {
      logger.error('Error deserializing user', {
        tags: ['auth', 'session', 'error'],
        error,
        data: { userId: id }
      });
      done(error);
    }
  });
  
  // Debug middleware to log session and auth info
  if (process.env.NODE_ENV !== 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      logger.debug('=== GET USER INFO ===', {
        tags: ['auth', 'debug']
      });
      logger.debug(`Session ID: ${req.sessionID}`, {
        tags: ['auth', 'session']
      });
      logger.debug(`Is Authenticated: ${req.isAuthenticated()}`, {
        tags: ['auth']
      });
      logger.debug(`Session: ${JSON.stringify(req.session)}`, {
        tags: ['auth', 'session']
      });
      logger.debug(`Cookie settings: ${JSON.stringify(req.session.cookie)}`, {
        tags: ['auth', 'cookie']
      });
      logger.debug(`Environment: ${process.env.NODE_ENV || 'development'}`, {
        tags: ['auth', 'environment']
      });
      
      next();
    });
  }
  
  // Registration endpoint
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      const { username, password, email, name } = req.body;
      
      // Validate required fields
      if (!username || !password) {
        logger.warn('Registration missing required fields', {
          tags: ['auth', 'register', 'validation']
        });
        return res.status(400).json({ error: 'Username and password are required' });
      }
      
      // Check if username is already taken
      if (await isUsernameTaken(username)) {
        logger.warn('Registration attempted with existing username', {
          tags: ['auth', 'register', 'conflict'],
          data: { username }
        });
        return res.status(409).json({ error: 'Username already exists' });
      }
      
      // Create the new user
      const user = await createUser({ username, password, email, name });
      
      // Log the user in automatically
      req.login(user, (err) => {
        if (err) {
          logger.error('Error logging in after registration', {
            tags: ['auth', 'register', 'login', 'error'],
            error: err
          });
          return res.status(500).json({ error: 'Error logging in after registration' });
        }
        
        // Successful registration and login
        logger.info('User registered successfully', {
          tags: ['auth', 'register', 'success'],
          data: { userId: user.id, username: user.username }
        });
        
        // Return the user without the password
        const { password, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      logger.error('Registration error', {
        tags: ['auth', 'register', 'error'],
        error
      });
      res.status(500).json({ error: 'Internal server error during registration' });
    }
  });
  
  // Login endpoint
  app.post('/api/login', 
    (req, res, next) => {
      logger.debug('Login attempt', {
        tags: ['auth', 'login'],
        data: { username: req.body.username }
      });
      next();
    },
    passport.authenticate('local'),
    (req: Request, res: Response) => {
      // Authentication successful
      const user = req.user as User;
      
      logger.info('User logged in successfully', {
        tags: ['auth', 'login', 'success'],
        data: { userId: user.id, username: user.username }
      });
      
      // Return the user without the password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    }
  );
  
  // Logout endpoint
  app.post('/api/logout', (req: Request, res: Response, next: NextFunction) => {
    const wasAuthenticated = req.isAuthenticated();
    const userId = wasAuthenticated ? (req.user as User).id : null;
    
    logger.info('Logout initiated', {
      tags: ['auth', 'logout'],
      data: { wasAuthenticated, userId }
    });
    
    req.logout((err) => {
      if (err) {
        logger.error('Logout error', {
          tags: ['auth', 'logout', 'error'],
          error: err
        });
        return next(err);
      }
      
      logger.info('User logged out successfully', {
        tags: ['auth', 'logout', 'success'],
        data: { wasAuthenticated, userId }
      });
      
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    });
  });
  
  // User info endpoint
  app.get('/api/user', (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      logger.debug('User not authenticated, returning 401', {
        tags: ['auth', 'user']
      });
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // User is authenticated, return user info
    const user = req.user as User;
    
    logger.debug('Returning authenticated user info', {
      tags: ['auth', 'user'],
      data: { userId: user.id, username: user.username }
    });
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  });
  
  // Auth status endpoint
  app.get('/api/auth/status', (req: Request, res: Response) => {
    const isAuthenticated = req.isAuthenticated();
    const userId = isAuthenticated ? (req.user as User).id : null;
    
    logger.debug('Auth status check', {
      tags: ['auth', 'status'],
      data: { isAuthenticated, userId }
    });
    
    res.status(200).json({
      authenticated: isAuthenticated,
      userId
    });
  });
  
  logger.info('Authentication system setup complete', {
    tags: ['auth', 'setup', 'complete']
  });
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
