/**
 * MCP Integration Platform - Client Logger
 * 
 * This module provides a structured logging system for the client,
 * with support for different log levels and log storage for debug purposes.
 */

// Log levels and their numeric values (for filtering)
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

type LogLevel = keyof typeof LOG_LEVELS;

// Log entry structure
interface LogEntry {
  timestamp: number;
  level: LogLevel;
  message: string;
  tags?: string[];
  data?: Record<string, any>;
  error?: any;
}

// Configure log level based on environment
// Higher log level = more verbose logs
const DEFAULT_LOG_LEVEL: LogLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';

// Maximum number of logs to store in memory
const MAX_LOG_HISTORY = 1000;

// Optional log options when calling log functions
export interface LogOptions {
  tags?: string[];
  data?: Record<string, any>;
  error?: any;
}

/**
 * Client Logger Class
 */
class ClientLogger {
  private logLevel: LogLevel;
  private logHistory: LogEntry[] = [];
  
  constructor(initialLogLevel: LogLevel = DEFAULT_LOG_LEVEL) {
    this.logLevel = initialLogLevel;
    this.setupConsoleOverrides();
  }
  
  /**
   * Set the current log level
   */
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    console.info(`Log level set to ${level}`);
  }
  
  /**
   * Get all stored logs
   */
  getLogs(): LogEntry[] {
    return [...this.logHistory];
  }
  
  /**
   * Clear stored logs
   */
  clearLogs(): void {
    this.logHistory = [];
  }
  
  /**
   * Filter logs by criteria
   */
  filterLogs({ level, tags }: { level?: LogLevel; tags?: string[] } = {}): LogEntry[] {
    return this.logHistory.filter((log) => {
      if (level && LOG_LEVELS[log.level] > LOG_LEVELS[level]) {
        return false;
      }
      
      if (tags && tags.length > 0 && (!log.tags || !tags.some(tag => log.tags?.includes(tag)))) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Log a message at the error level
   */
  error(message: string, options?: LogOptions): void {
    this.log('error', message, options);
  }
  
  /**
   * Log a message at the warn level
   */
  warn(message: string, options?: LogOptions): void {
    this.log('warn', message, options);
  }
  
  /**
   * Log a message at the info level
   */
  info(message: string, options?: LogOptions): void {
    this.log('info', message, options);
  }
  
  /**
   * Log a message at the debug level
   */
  debug(message: string, options?: LogOptions): void {
    this.log('debug', message, options);
  }
  
  /**
   * Internal log method used by all log level methods
   */
  private log(level: LogLevel, message: string, options?: LogOptions): void {
    // Check if this log level should be processed
    if (LOG_LEVELS[level] > LOG_LEVELS[this.logLevel]) {
      return;
    }
    
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      tags: options?.tags,
      data: options?.data,
      error: options?.error,
    };
    
    // Add to history, removing old entries if needed
    this.logHistory.push(entry);
    if (this.logHistory.length > MAX_LOG_HISTORY) {
      this.logHistory.shift();
    }
    
    // Output to console with appropriate styling
    this.consoleOutput(entry);
  }
  
  /**
   * Format and output log entry to console
   */
  private consoleOutput(entry: LogEntry): void {
    const { level, message, tags, data, error } = entry;
    
    // Determine console method to use
    const consoleMethod = level === 'debug' ? 'debug' : 
                         level === 'info' ? 'info' : 
                         level === 'warn' ? 'warn' : 'error';
    
    // Format tags if present
    const tagsStr = tags && tags.length > 0 ? `[${tags.join(':')}] ` : '';
    
    // Log the message with tags
    console[consoleMethod](`${tagsStr}${message}`);
    
    // Log additional data if present
    if (data) {
      console[consoleMethod]('Data:', data);
    }
    
    // Log error details if present
    if (error) {
      if (error instanceof Error) {
        console[consoleMethod]('Error:', error.message);
        console[consoleMethod]('Stack:', error.stack);
      } else {
        console[consoleMethod]('Error:', error);
      }
    }
  }
  
  /**
   * Override console methods to capture logs
   */
  private setupConsoleOverrides(): void {
    // Implementation can be added here to override console methods
    // if desired to capture all console logs
  }
}

// Create singleton instance
export const logger = new ClientLogger();

// Export default logger
export default logger;
