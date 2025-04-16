import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * Simple in-memory rate limiter implementation
 */
export class RateLimiter {
  private options: RateLimitOptions;
  private store: Map<string, RateLimitEntry>;
  
  constructor(options: RateLimitOptions) {
    this.options = {
      windowMs: options.windowMs || 60 * 1000, // default: 1 minute
      maxRequests: options.maxRequests || 60    // default: 60 requests per minute
    };
    this.store = new Map();
    
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), this.options.windowMs);
  }
  
  /**
   * Middleware function to limit request rate
   */
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // Get identifier (API key or IP address)
      const identifier = this.getIdentifier(req);
      
      // Get entry from store or create new one
      const entry = this.store.get(identifier) || {
        count: 0,
        resetTime: Date.now() + this.options.windowMs
      };
      
      // Reset count if window has passed
      if (Date.now() > entry.resetTime) {
        entry.count = 0;
        entry.resetTime = Date.now() + this.options.windowMs;
      }
      
      // Increment count and check if over limit
      entry.count++;
      this.store.set(identifier, entry);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', this.options.maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.options.maxRequests - entry.count).toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());
      
      // If over limit, return 429 Too Many Requests
      if (entry.count > this.options.maxRequests) {
        return res.status(429).json({
          message: 'Too many requests, please try again later',
          retryAfter: Math.ceil((entry.resetTime - Date.now()) / 1000)
        });
      }
      
      next();
    };
  }
  
  /**
   * Get identifier from request (API key or IP address)
   */
  private getIdentifier(req: Request): string {
    // Prefer API key if available
    const apiKey = req.headers['x-api-key'] || req.query.api_key;
    if (apiKey) {
      return `key:${apiKey}`;
    }
    
    // Fall back to IP address
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `ip:${ip}`;
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Create default rate limiters
export const globalRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,        // 1 minute
  maxRequests: 120            // 120 requests per minute
});

export const toolRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,        // 1 minute
  maxRequests: 60             // 60 requests per minute
});
