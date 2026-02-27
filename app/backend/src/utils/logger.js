/**
 * LOGGER UTILITY
 * ==============
 * 
 * Secure logging implementation:
 * - Prevents sensitive data leakage in logs
 * - Structured logging for better analysis
 * - Separate error and access logs
 */

import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sensitive fields that should NEVER be logged
const SENSITIVE_FIELDS = [
  'password',
  'pass',
  'token',
  'secret',
  'authorization',
  'cookie',
  'credit_card',
  'cvv',
  'ssn',
  'smtp_pass',
  'api_key',
];

/**
 * Sanitize object by removing sensitive fields
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    // Check if key contains any sensitive field name
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Custom format for sanitizing log messages
 */
const sanitizeFormat = winston.format((info) => {
  // Sanitize metadata
  if (info.metadata) {
    info.metadata = sanitizeObject(info.metadata);
  }
  
  // Sanitize any object properties
  for (const key of Object.keys(info)) {
    if (typeof info[key] === 'object' && info[key] !== null) {
      info[key] = sanitizeObject(info[key]);
    }
  }
  
  return info;
});

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Winston logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'gkl-engenharia-api' },
  
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    sanitizeFormat(),
    winston.format.json()
  ),
  
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  
  // Don't exit on uncaught errors
  exitOnError: false,
});

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      // Sanitized body (no sensitive data)
      body: req.body ? sanitizeObject(req.body) : undefined,
    });
  });
  
  next();
};

/**
 * Error logging helper
 */
export const logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...sanitizeObject(context),
  });
};

/**
 * Security event logging
 */
export const logSecurityEvent = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...sanitizeObject(details),
  });
};

export default logger;
