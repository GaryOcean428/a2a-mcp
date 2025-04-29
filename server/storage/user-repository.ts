import { db } from '../db';
import { users, type User, type InsertUser } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword, comparePasswords, createApiKeyString } from './password-utils';

/**
 * Repository for user-related database operations
 */
export class UserRepository {
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
   * Get a user by email address
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
      const hashedPassword = await hashPassword(insertUser.password);
      
      const [user] = await db.insert(users)
        .values({
          ...insertUser,
          password: hashedPassword,
          apiKey: createApiKeyString(),
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
   * Validate user credentials for authentication
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
      
      const isPasswordValid = await comparePasswords(password, user.password);
      
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
      
      const apiKey = createApiKeyString();
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
   * Update user's last login timestamp
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
   * Update user's role
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
   * Update user's active status
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