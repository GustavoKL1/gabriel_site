/**
 * SECURITY CONFIGURATION
 * ======================
 * 
 * This file contains all security-related configurations.
 * Each setting is documented with its purpose and potential risks.
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

// ============================================
// CORS CONFIGURATION
// ============================================
/**
 * DANGER: Misconfigured CORS is a CRITICAL security vulnerability!
 * 
 * RISKS:
 * - Allowing all origins (*): ANY website can make requests to your API
 * - Missing credentials handling: Session hijacking, CSRF attacks
 * - Wrong methods allowed: Unauthorized data modification
 * 
 * BEST PRACTICES:
 * 1. NEVER use origin: '*' in production
 * 2. Always specify exact domains
 * 3. Use credentials: true only when needed
 * 4. Limit allowed methods to minimum required
 */
export const corsOptions = {
  // Origin validation - CRITICAL for security
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
      : ['http://localhost:5173']; // Default for development
    
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  // Allow cookies and authorization headers
  credentials: true,
  
  // Allowed HTTP methods
  methods: ['GET', 'POST', 'OPTIONS'],
  
  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  
  // Exposed headers
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  
  // Max age for preflight cache (seconds)
  maxAge: 86400, // 24 hours
};

// ============================================
// HELMET CONFIGURATION (Security Headers)
// ============================================
/**
 * Helmet sets security-related HTTP headers.
 * These headers protect against various attacks.
 */
export const helmetConfig = {
  // Content Security Policy - Prevents XSS and data injection
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline needed for some UI libs
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"], // Prevents Flash/Java applets
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"], // Prevents clickjacking
      upgradeInsecureRequests: [],
    },
  },
  
  // Strict Transport Security - Forces HTTPS
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  
  // X-Frame-Options - Prevents clickjacking
  frameguard: {
    action: 'deny', // 'deny' or 'sameorigin'
  },
  
  // X-Content-Type-Options - Prevents MIME sniffing
  noSniff: true,
  
  // X-XSS-Protection - Legacy XSS protection
  xssFilter: true,
  
  // Referrer Policy - Controls referrer information
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  
  // Permissions Policy - Controls browser features
  permissionsPolicy: {
    features: {
      geolocation: ["'none'"],
      microphone: ["'none'"],
      camera: ["'none'"],
      payment: ["'none'"],
    },
  },
  
  // DNS Prefetch Control
  dnsPrefetchControl: {
    allow: false,
  },
  
  // IE No Open - Prevents IE from executing downloads
  ieNoOpen: true,
  
  // Hide X-Powered-By header
  hidePoweredBy: true,
};

// ============================================
// RATE LIMITING CONFIGURATION
// ============================================
/**
 * DANGER: Without rate limiting, your API is vulnerable to:
 * - DDoS attacks
 * - Brute force attacks
 * - Resource exhaustion
 * - Data scraping
 */

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // requests per window
  
  // Response when limit exceeded
  message: {
    success: false,
    message: 'Muitas requisições. Por favor, tente novamente mais tarde.',
    retryAfter: '15 minutes',
  },
  
  // Standard headers
  standardHeaders: true,
  legacyHeaders: false,
  
  // Skip successful requests from counting
  skipSuccessfulRequests: false,
  
  // Key generator (by IP)
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  
  // Handler when limit exceeded
  handler: (req, res, next, options) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// Strict rate limiter for contact form
export const contactLimiter = rateLimit({
  windowMs: (parseInt(process.env.CONTACT_RATE_LIMIT_WINDOW) || 60) * 60 * 1000, // 1 hour
  max: parseInt(process.env.CONTACT_RATE_LIMIT_MAX) || 5, // 5 submissions per hour
  
  message: {
    success: false,
    message: 'Limite de envios atingido. Você pode enviar até 5 mensagens por hora.',
    retryAfter: '1 hour',
  },
  
  standardHeaders: true,
  legacyHeaders: false,
  
  keyGenerator: (req) => {
    // Use IP + email combination for better tracking
    const email = req.body?.email || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `${ip}:${email}`;
  },
  
  handler: (req, res, next, options) => {
    console.warn(`Contact rate limit exceeded for: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

// ============================================
// HPP (HTTP Parameter Pollution) Protection
// ============================================
/**
 * Prevents attackers from polluting query parameters
 * to bypass validation or cause unexpected behavior.
 */
export const hppConfig = {
  // Whitelist parameters that CAN have multiple values
  whitelist: [],
};

// ============================================
// SECURITY MIDDLEWARE CHAIN
// ============================================
/**
 * Order matters! Apply in this sequence:
 * 1. Helmet (headers)
 * 2. CORS
 * 3. Rate limiting
 * 4. HPP
 * 5. Body parsing
 * 6. Route handlers
 */
export const applySecurityMiddleware = (app) => {
  // 1. Security headers FIRST
  app.use(helmet(helmetConfig));
  
  // 2. HPP protection
  app.use(hpp(hppConfig));
  
  // 3. General rate limiting
  app.use(generalLimiter);
  
  console.log('✅ Security middleware applied');
};
