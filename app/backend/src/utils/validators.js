/**
 * INPUT VALIDATION UTILITIES
 * ==========================
 * 
 * DANGER: Without proper validation, your API is vulnerable to:
 * - SQL Injection (if using SQL databases)
 * - NoSQL Injection (if using MongoDB)
 * - XSS (Cross-Site Scripting)
 * - Command Injection
 * - Path Traversal
 * - Buffer Overflow
 */

import { body, validationResult } from 'express-validator';

// ============================================
// VALIDATION RULES
// ============================================

/**
 * Contact form validation rules
 * These rules protect against malicious input
 */
export const contactValidationRules = [
  // Name validation
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Nome contém caracteres inválidos')
    .escape(), // Sanitizes HTML entities
  
  // Email validation
  body('email')
    .trim()
    .notEmpty()
    .withMessage('E-mail é obrigatório')
    .isEmail()
    .withMessage('E-mail inválido')
    .normalizeEmail({ // Prevents email-based attacks
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false,
    })
    .isLength({ max: 254 })
    .withMessage('E-mail muito longo'),
  
  // Phone validation (optional)
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[\d\s\+\-\(\)\.]+$/)
    .withMessage('Telefone contém caracteres inválidos')
    .isLength({ min: 8, max: 20 })
    .withMessage('Telefone deve ter entre 8 e 20 caracteres')
    .escape(),
  
  // Message validation
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Mensagem é obrigatória')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Mensagem deve ter entre 10 e 5000 caracteres')
    // Custom sanitizer to remove potentially dangerous content
    .customSanitizer((value) => {
      return sanitizeMessage(value);
    }),
];

// ============================================
// CUSTOM SANITIZERS
// ============================================

/**
 * Sanitize message content
 * Removes potentially dangerous HTML, scripts, and patterns
 */
function sanitizeMessage(text) {
  if (!text || typeof text !== 'string') return '';
  
  let sanitized = text;
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  
  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove javascript: and data: protocols
  sanitized = sanitized.replace(/(javascript|data):/gi, '');
  
  // Remove iframe and object tags
  sanitized = sanitized.replace(/<(iframe|object|embed|form)[^>]*>[\s\S]*?<\/\1>/gi, '');
  
  // Remove style tags
  sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Remove potentially dangerous HTML tags
  const dangerousTags = /<(script|iframe|object|embed|form|input|textarea|button|link|meta)[^>]*>/gi;
  sanitized = sanitized.replace(dangerousTags, '');
  
  // Escape remaining HTML tags
  sanitized = sanitized
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\x00/g, '');
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();
  
  return sanitized;
}

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation failures for security monitoring
    console.warn('Validation failed:', {
      ip: req.ip,
      path: req.path,
      errors: errors.array().map(e => ({
        field: e.path,
        message: e.msg,
      })),
    });
    
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }
  
  next();
};

// ============================================
// ADDITIONAL SECURITY VALIDATORS
// ============================================

/**
 * Check for common attack patterns
 */
export const detectAttackPatterns = (text) => {
  const patterns = {
    sqlInjection: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|SCRIPT)\b)|(--|#|\/\*|\*\/)/i,
    xss: /<script|javascript:|on\w+\s*=|alert\s*\(|eval\s*\(/i,
    pathTraversal: /\.\.[\/\\]|%2e%2e|\.%00/,
    commandInjection: /[;&|`$(){}[\]\\]|\|\||&&/,
    noSqlInjection: /\$\{|\$where|\$gt|\$lt|\$ne|\$regex|\$eq/i,
  };
  
  const detected = [];
  
  for (const [attack, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) {
      detected.push(attack);
    }
  }
  
  return detected;
};

/**
 * Middleware to check for attack patterns
 */
export const attackPatternCheck = (req, res, next) => {
  const checkValue = (value, path) => {
    if (typeof value === 'string') {
      const attacks = detectAttackPatterns(value);
      if (attacks.length > 0) {
        console.error('Attack pattern detected:', {
          ip: req.ip,
          path: req.path,
          field: path,
          attacks,
          value: value.substring(0, 100), // Log only first 100 chars
        });
        
        return true;
      }
    }
    return false;
  };
  
  const checkObject = (obj, prefix = '') => {
    for (const [key, value] of Object.entries(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        if (checkValue(value, path)) {
          return true;
        }
      } else if (typeof value === 'object' && value !== null) {
        if (checkObject(value, path)) {
          return true;
        }
      }
    }
    return false;
  };
  
  // Check query params
  if (checkObject(req.query)) {
    return res.status(403).json({
      success: false,
      message: 'Requisição bloqueada por segurança',
    });
  }
  
  // Check body
  if (checkObject(req.body)) {
    return res.status(403).json({
      success: false,
      message: 'Requisição bloqueada por segurança',
    });
  }
  
  next();
};

// ============================================
// EMAIL VALIDATION
// ============================================

/**
 * Validate email format and check for disposable emails
 */
export const isValidEmail = (email) => {
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }
  
  // Check for disposable email domains (common list)
  const disposableDomains = [
    'tempmail.com',
    'throwaway.com',
    'mailinator.com',
    'guerrillamail.com',
    'yopmail.com',
    'fakeemail.com',
    'sharklasers.com',
    'getairmail.com',
  ];
  
  const domain = email.split('@')[1].toLowerCase();
  if (disposableDomains.includes(domain)) {
    return false;
  }
  
  return true;
};

// ============================================
// RATE LIMIT BY EMAIL
// ============================================

/**
 * Simple in-memory store for email-based rate limiting
 * In production, use Redis!
 */
const emailSubmissions = new Map();

export const checkEmailRateLimit = (email, maxSubmissions = 5, windowMs = 3600000) => {
  const now = Date.now();
  const key = email.toLowerCase();
  
  if (!emailSubmissions.has(key)) {
    emailSubmissions.set(key, []);
  }
  
  const submissions = emailSubmissions.get(key);
  
  // Remove old submissions outside the window
  const validSubmissions = submissions.filter(
    time => now - time < windowMs
  );
  
  if (validSubmissions.length >= maxSubmissions) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: validSubmissions[0] + windowMs,
    };
  }
  
  // Add current submission
  validSubmissions.push(now);
  emailSubmissions.set(key, validSubmissions);
  
  return {
    allowed: true,
    remaining: maxSubmissions - validSubmissions.length,
    resetTime: null,
  };
};
