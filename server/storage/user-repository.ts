import { db } from '../db';
import { users, type User, type InsertUser } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

// Async versions of crypto functions
const scryptAsync = promisify(scrypt);

/**
 * Repository for user-related operations
 */
export class UserRepository {
  /**
   * Hash a password using scrypt
   */
  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    const hashedStr = `${buf.toString('hex')}.${salt}`;
    console.log('Generated password hash (last 10 chars):', hashedStr.slice(-10));
    return hashedStr;
  }

  /**
   * Compare a supplied password with a stored hash
   */
  async comparePasswords(supplied: string, stored: string): Promise<boolean> {
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

  // Creates a random API key string
  private createApiKeyString(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'mcp_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Get a user by ID
   */
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  /**
   * Get a user by email
   */
  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return undefined;
    }
  }

  /**
   * Get a user by API key
   */
  async getUserByApiKey(apiKey: string): Promise<User | undefined> {
    try {
      const [user] = await db.select()
        .from(users)
        .where(and(eq(users.apiKey, apiKey), eq(users.active, true)));
      return user;
    } catch (error) {
      console.error('Error getting user by API key:', error);
      return undefined;
    }
  }

  /**
   * Create a new user
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Hash the password before storing
      const hashedPassword = await this.hashPassword(insertUser.password);
      
      const [user] = await db.insert(users)
        .values({
          ...insertUser,
          password: hashedPassword,
          apiKey: this.createApiKeyString(),
          role: 'user',
          active: true,
          createdAt: new Date()
        })
        .returning();
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Update a user's API key
   */
  async updateUserApiKey(userId: number, apiKey: string | null): Promise<void> {
    try {
      await db.update(users)
        .set({ apiKey })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating user API key:', error);
      throw new Error('Failed to update API key');
    }
  }

  /**
   * Validate a user's credentials
   */
  async validateUserCredentials(usernameOrEmail: string, password: string): Promise<User | undefined> {
    try {
      // Check if the input is an email (contains @)
      const isEmail = usernameOrEmail.includes('@');
      
      // Find the user by username or email
      let user: User | undefined;
      
      if (isEmail) {
        console.log('Authenticating with email:', usernameOrEmail);
        user = await this.getUserByEmail(usernameOrEmail);
      } else {
        console.log('Authenticating with username:', usernameOrEmail);
        user = await this.getUserByUsername(usernameOrEmail);
      }
      
      if (!user || !user.active) {
        console.log('User not found or inactive');
        return undefined;
      }
      
      const isPasswordValid = await this.comparePasswords(password, user.password);
      
      if (!isPasswordValid) {
        console.log('Password invalid for user:', user.username);
        return undefined;
      }
      
      console.log('Authentication successful for user:', user.username);
      return user;
    } catch (error) {
      console.error('Error validating user credentials:', error);
      return undefined;
    }
  }

  /**
   * Generate a new API key for a user
   */
  async generateApiKey(userId: number): Promise<string> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const apiKey = this.createApiKeyString();
      await this.updateUserApiKey(userId, apiKey);
      return apiKey;
    } catch (error) {
      console.error('Error generating API key:', error);
      throw new Error('Failed to generate API key');
    }
  }

  /**
   * Revoke a user's API key
   */
  async revokeApiKey(userId: number): Promise<void> {
    try {
      await this.updateUserApiKey(userId, null);
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw new Error('Failed to revoke API key');
    }
  }

  /**
   * Update a user's last login timestamp
   */
  async updateUserLastLogin(userId: number): Promise<void> {
    try {
      await db.update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating user last login:', error);
    }
  }

  /**
   * Update a user's role
   */
  async updateUserRole(userId: number, role: string): Promise<void> {
    try {
      await db.update(users)
        .set({ role })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Failed to update user role');
    }
  }

  /**
   * Update a user's active status
   */
  async updateUserActiveStatus(userId: number, active: boolean): Promise<void> {
    try {
      await db.update(users)
        .set({ active })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating user active status:', error);
      throw new Error('Failed to update user active status');
    }
  }
}