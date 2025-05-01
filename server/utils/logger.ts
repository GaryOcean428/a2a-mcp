/**
 * MCP Integration Platform - Server Logger
 * 
 * This module provides a structured logging system for the server,
 * with support for different log levels and structured data.
 */

import { createLogger, format, transports, Logger } from 'winston';
import { Request, Response, NextFunction } from 'express';

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

type LogLevel = keyof typeof logLevels;

const logColors = {
  error: '\x1b[31m', // Red
  warn: '\x1b[33m',  // Yellow
  info: '\x1b[36m',  // Cyan
  http: '\x1b[35m',  // Magenta
  debug: '\x1b[32m', // Green
};

// Reset color code
const resetColor = '\x1b[0m';

// Custom format for console output
const consoleFormat = format.printf(info => {
  // Cast to any to handle the Winston TransformableInfo format
  const { level, message, timestamp, tags, data, error } = info as any;
  const color = (level && logColors[level as LogLevel]) ? logColors[level as LogLevel] : '';
  const timestampStr = timestamp ? `${timestamp} ` : '';
  const tagsStr = tags && Array.isArray(tags) ? `[${tags.join(':')}] ` : '';
  
  // Format the message with color
  let formattedMessage = `${color}${timestampStr}[${level.toUpperCase()}]${resetColor} ${tagsStr}${message}`;
  
  // Add data if available
  if (data) {
    formattedMessage += '\n' + JSON.stringify(data, null, 2);
  }
  
  // Add error if available
  if (error) {
    const errorMessage = error instanceof Error 
      ? `${error.name}: ${error.message}\n${error.stack}`
      : JSON.stringify(error);
    formattedMessage += `\n${color}ERROR:${resetColor} ${errorMessage}`;
  }
  
  return formattedMessage;
});

// Create the logger
export const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels: logLevels,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    consoleFormat,
  ),
  transports: [
    new transports.Console(),
  ],
});

// Add HTTP logging middleware for Express
export const httpLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // Log the request
  logger.http(`${req.method} ${req.url}`, {
    tags: ['http', 'request'],
    data: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });
  
  // Log the response when finished
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    
    const logMethod = res.statusCode >= 400 ? logger.warn : logger.http;
    
    logMethod(`${req.method} ${req.url} ${res.statusCode} in ${responseTime}ms`, {
      tags: ['http', 'response'],
      data: {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime,
      },
    });
  });
  
  next();
};

// Export default logger
export default logger;
