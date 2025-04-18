import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

/**
 * Middleware to authenticate API requests using API key
 */
export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: bypassing API key authentication');
      // Create a mock user for development
      (req as any).user = {
        id: 1,
        username: 'devuser',
        role: 'admin',
        apiKey: 'dev-api-key',
        lastLogin: new Date().toISOString()
      };
      return next();
    }

    // Extract API key from header or query parameter
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    
    if (!apiKey) {
      return res.status(401).json({ 
        message: 'Unauthorized: API key is required' 
      });
    }
    
    // Look up user by API key
    const user = await storage.getUserByApiKey(String(apiKey));
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Unauthorized: Invalid API key' 
      });
    }
    
    // Add user to request object for use in route handlers
    (req as any).user = user;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ 
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Middleware to authenticate session-based requests
 */
export const sessionAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).session?.userId) {
    return res.status(401).json({
      message: 'Unauthorized: Please log in to access this resource'
    });
  }
  
  next();
};
