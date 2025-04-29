/**
 * Logger utility for standardized logging across the application
 */
export class Logger {
  private context: string;
  private showTimestamp: boolean;
  
  /**
   * Create a new logger instance
   * @param context The context this logger is used in (e.g., 'WebServer', 'Database')
   * @param showTimestamp Whether to show timestamps in log messages
   */
  constructor(context: string, showTimestamp: boolean = true) {
    this.context = context;
    this.showTimestamp = showTimestamp;
  }
  
  /**
   * Format a log message
   */
  private formatMessage(level: string, message: string): string {
    const timestamp = this.showTimestamp ? `[${new Date().toISOString()}]` : '';
    return `${timestamp} [${level}] [${this.context}] ${message}`;
  }
  
  /**
   * Log an info message
   */
  info(message: string, ...args: any[]): void {
    console.log(this.formatMessage('INFO', message), ...args);
  }
  
  /**
   * Log a debug message (only in development environment)
   */
  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }
  
  /**
   * Log a warning message
   */
  warn(message: string, ...args: any[]): void {
    console.warn(this.formatMessage('WARN', message), ...args);
  }
  
  /**
   * Log an error message
   */
  error(message: string, ...args: any[]): void {
    console.error(this.formatMessage('ERROR', message), ...args);
  }
  
  /**
   * Create a child logger with a sub-context
   */
  child(subContext: string): Logger {
    return new Logger(`${this.context}:${subContext}`, this.showTimestamp);
  }
}

// Create and export default application logger
const logger = new Logger('MCP');
export default logger;
