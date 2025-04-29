import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

// Async versions of crypto functions
const scryptAsync = promisify(scrypt);

/**
 * Hash a password using scrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  const hashedStr = `${buf.toString('hex')}.${salt}`;
  console.log('Generated password hash (last 10 chars):', hashedStr.slice(-10));
  return hashedStr;
}

/**
 * Compare a supplied password with a stored hash
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    console.log('Comparing password');
    
    // Handle case when stored password doesn't have the expected format
    if (!stored || !stored.includes('.')) {
      console.error('Invalid stored password format');
      return false;
    }
    
    const [hashed, salt] = stored.split('.');
    const hashedBuf = Buffer.from(hashed, 'hex');
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    // Ensure both buffers are of the same length before comparison
    if (hashedBuf.length !== suppliedBuf.length) {
      console.error('Buffer length mismatch in password comparison');
      return false;
    }
    
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
}

/**
 * Creates a random API key string
 */
export function createApiKeyString(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'mcp_';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}