/**
 * GKL ENGENHARIA - BACKEND SERVER
 * ================================
 * 
 * Express server with comprehensive security measures.
 * 
 * SECURITY CHECKLIST:
 * ✅ CORS properly configured
 * ✅ Helmet security headers
 * ✅ Rate limiting
 * ✅ Input validation & sanitization
 * ✅ XSS protection
 * ✅ HPP protection
 * ✅ Secure logging (no sensitive data)
 * ✅ Environment variables for secrets
 * ✅ HTTPS enforcement (production)
 * ✅ Request logging
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import security configurations
import { corsOptions, applySecurityMiddleware } from '../config/security.js';
import { requestLogger } from './utils/logger.js';

// Import routes
import contactRoutes from './routes/contact.js';

// ============================================
// INITIALIZE EXPRESS APP
// ============================================

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECURITY MIDDLEWARE (ORDER MATTERS!)
// ============================================

/**
 * CRITICAL: Middleware must be applied in this order:
 * 1. Security headers (Helmet)
 * 2. CORS
 * 3. Rate limiting
 * 4. Body parsing
 * 5. Request logging
 * 6. Route handlers
 */

// 1. Apply security middleware (Helmet, HPP, general rate limiting)
applySecurityMiddleware(app);

// 2. CORS configuration
app.use(cors(corsOptions));

// 3. Body parsing middleware
app.use(express.json({ 
  limit: '10kb', // Prevent large payload attacks
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10kb',
}));

// 4. Request logging
app.use(requestLogger);

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Contact form routes
app.use('/api/contact', contactRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(isDevelopment && { stack: err.stack }),
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║           GKL ENGENHARIA - API SERVER                    ║
╠══════════════════════════════════════════════════════════╣
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(20)}              ║
║  Port:        ${PORT.toString().padEnd(20)}              ║
║  CORS:        ${(process.env.CORS_ORIGIN || 'http://localhost:5173').padEnd(20)}  ║
╚══════════════════════════════════════════════════════════╝
  `);
  
  // Security warnings
  if (!process.env.SMTP_HOST) {
    console.warn('⚠️  WARNING: SMTP_HOST not configured. Email service will fail.');
  }
  if (!process.env.SMTP_PASS) {
    console.warn('⚠️  WARNING: SMTP_PASS not configured. Email service will fail.');
  }
  if (!process.env.RECIPIENT_EMAIL) {
    console.warn('⚠️  WARNING: RECIPIENT_EMAIL not configured.');
  }
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  WARNING: Running in development mode. Set NODE_ENV=production for production.');
  }
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
