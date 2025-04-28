import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { storage } from './storage';
import { type User } from '@shared/schema';

// Define express-compatible user type
interface ExpressUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

// Add user type to Express namespace
declare global {
  namespace Express {
    // Use the interface we defined above
    interface User extends ExpressUser {}
  }
}

/**
 * Set up authentication for the application
 */
export function setupAuth(app: Express) {
  // Create session settings
  const sessionSettings: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "mcp-integration-platform-secure-secret",
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
  };

  // Set up session middleware
  app.set('trust proxy', 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport to use local strategy
  passport.use(
    new LocalStrategy({
      usernameField: 'username', // This can be email too now with our updated validation
      passwordField: 'password'
    }, async (usernameOrEmail: string, password: string, done: any) => {
      try {
        console.log('Passport authenticate with:', usernameOrEmail);
        const user = await storage.validateUserCredentials(usernameOrEmail, password);
        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        return done(null, user);
      } catch (error) {
        console.error('Passport authentication error:', error);
        return done(error);
      }
    })
  );

  // Configure serialization/deserialization
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register authentication routes
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(req.body.email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      // Create the user
      const user = await storage.createUser(req.body);

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to login after registration' });
        }
        // Return user without sensitive data
        const { password, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  });

  app.post('/api/login', (req: Request, res: Response, next: NextFunction) => {
    // Log incoming login request for debugging
    console.log('=== LOGIN ATTEMPT ===');
    console.log('Login credentials received:', { 
      username: req.body.username, 
      passwordLength: req.body.password ? req.body.password.length : 0,
      hasPassword: !!req.body.password
    });
    console.log('Session ID:', req.sessionID);
    console.log('Headers:', req.headers);
    console.log('Environment:', process.env.NODE_ENV);
    
    if (!req.body.username || !req.body.password) {
      console.log('Login rejected: Missing username or password');
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    passport.authenticate('local', (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        console.error('Login authentication error:', err);
        return next(err);
      }
      
      if (!user) {
        console.log('Login failed for:', req.body.username);
        console.log('Auth info:', info);
        
        // Check if the user exists but password is incorrect
        storage.getUserByUsername(req.body.username).then(userRecord => {
          if (userRecord) {
            console.log('User exists but password is incorrect');
            // For security, don't reveal which part of the credentials is incorrect
            return res.status(401).json({ error: 'Invalid username or password' });
          } else {
            storage.getUserByEmail(req.body.username).then(emailRecord => {
              if (emailRecord) {
                console.log('Email exists but password is incorrect');
                return res.status(401).json({ error: 'Invalid username or password' });
              } else {
                console.log('No matching user found for:', req.body.username);
                return res.status(401).json({ error: 'Invalid username or password' });
              }
            });
          }
        }).catch(lookupErr => {
          console.error('User lookup error:', lookupErr);
          return res.status(401).json({ error: 'Authentication failed' });
        });
        
        return;
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error('Session login error:', loginErr);
          return next(loginErr);
        }
        
        // Update last login time
        storage.updateUserLastLogin((user as any).id);
        
        // Return user without sensitive data
        const userObj = user as any;
        const { password, ...userWithoutPassword } = userObj;
        console.log('Login successful for user:', userObj.username);
        return res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/user', (req: Request, res: Response) => {
    console.log('=== GET USER INFO ===');
    console.log('Session ID:', req.sessionID);
    console.log('Is Authenticated:', req.isAuthenticated());
    console.log('Session:', req.session);
    console.log('Cookie settings:', req.session.cookie);
    console.log('Environment:', process.env.NODE_ENV);
    
    if (!req.isAuthenticated()) {
      console.log('User not authenticated, returning 401');
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    // Return user without sensitive data
    const userObj = req.user as any;
    console.log('User authenticated:', userObj.username);
    const { password, ...userWithoutPassword } = userObj;
    res.json(userWithoutPassword);
  });

  // Middleware to check if the user is authenticated
  app.use('/api/protected', (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: 'Authentication required' });
  });
}

/**
 * Middleware to ensure a user is authenticated for certain routes
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

/**
 * Middleware to ensure a user has admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user && (req.user as any).role === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Admin access required' });
}