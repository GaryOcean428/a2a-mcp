/**
 * MCP Integration Platform - Logger Utility
 * 
 * This utility provides a unified logging interface with support for
 * multiple log levels, module-specific logging, and production safeguards.
 */

import { isDevelopment, isProduction } from './environment';

// Log levels
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Optional extra information for logs
export interface LogOptions {
  tags?: string[];
  data?: Record<string, any>;
  error?: Error | unknown;
}

interface LoggerOptions {
  module: string;
  minLevel?: LogLevel;
  enabled?: boolean;
  colorized?: boolean;
  includeTimestamps?: boolean;
}

const LOG_LEVEL_MAP: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '#8b8b8b', // gray
  info: '#2196f3',  // blue
  warn: '#ff9800',  // orange
  error: '#f44336', // red
};

/**
 * Format a log message with the appropriate styles
 */
function formatLogMessage(
  level: LogLevel,
  module: string,
  message: string,
  options: LoggerOptions
): string[] {
  const { colorized, includeTimestamps } = options;
  
  const timestamp = includeTimestamps ? new Date().toISOString() : '';
  const prefix = `[${module}]${timestamp ? ` ${timestamp}` : ''}`;
  
  const formattedPrefix = colorized
    ? `%c${prefix}%c`
    : prefix;
  
  const styles = colorized
    ? [
        `color: ${LOG_COLORS[level]}; font-weight: bold;`,
        'color: inherit;',
      ]
    : [];
  
  return [formattedPrefix + ` ${message}`, ...styles];
}

/**
 * Create a logger instance for a specific module
 */
export function createLogger(options: LoggerOptions) {
  const {
    module,
    minLevel = 'info',
    enabled = true,
    colorized = true,
    includeTimestamps = false,
  } = options;
  
  const minLevelValue = LOG_LEVEL_MAP[minLevel];
  
  // Utility to check if a log level should be shown
  const shouldLog = (level: LogLevel): boolean => {
    // Don't log if logger is disabled
    if (!enabled) return false;
    
    // In production, never show debug logs
    if (isProduction() && level === 'debug') return false;
    
    // Check minimum level
    return LOG_LEVEL_MAP[level] >= minLevelValue;
  };
  
  // Create a log method for the specified level
  const logWithLevel = (level: LogLevel, message: string, options?: LogOptions) => {
    if (!shouldLog(level)) return;
    
    const { tags, data, error } = options || {};
    
    const formattedMessage = formatLogMessage(
      level,
      module,
      message + (tags && tags.length ? ` (${tags.join(', ')})` : ''),
      { module, colorized, includeTimestamps }
    );
    
    // Log to console with the appropriate level
    switch (level) {
      case 'debug':
        console.debug(...formattedMessage, data || '', error || '');
        break;
      case 'info':
        console.info(...formattedMessage, data || '', error || '');
        break;
      case 'warn':
        console.warn(...formattedMessage, data || '', error || '');
        break;
      case 'error':
        console.error(...formattedMessage, data || '', error || '');
        break;
    }
  };
  
  return {
    debug: (message: string, options?: LogOptions) => logWithLevel('debug', message, options),
    info: (message: string, options?: LogOptions) => logWithLevel('info', message, options),
    warn: (message: string, options?: LogOptions) => logWithLevel('warn', message, options),
    error: (message: string, options?: LogOptions) => logWithLevel('error', message, options),
    // Create a child logger with a submodule name
    child: (submodule: string) =>
      createLogger({
        ...options,
        module: `${module}:${submodule}`,
      }),
  };
}

// Create a default logger for general use
export const logger = createLogger({
  module: 'MCP',
  minLevel: isDevelopment() ? 'debug' : 'info',
  colorized: true,
  includeTimestamps: false,
});

// Create loggers for specific subsystems
export const apiLogger = logger.child('API');
export const wsLogger = logger.child('WebSocket');
export const uiLogger = logger.child('UI');
