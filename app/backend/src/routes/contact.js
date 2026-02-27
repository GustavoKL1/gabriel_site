/**
 * CONTACT ROUTES
 * ==============
 * 
 * Handles contact form submissions with full security measures.
 */

import express from 'express';
import { contactValidationRules, handleValidationErrors, checkEmailRateLimit, attackPatternCheck } from '../utils/validators.js';
import { sendContactEmail, sendConfirmationEmail } from '../services/emailService.js';
import { contactLimiter } from '../../config/security.js';
import logger, { logSecurityEvent } from '../utils/logger.js';

const router = express.Router();

// ============================================
// POST /api/contact - Submit contact form
// ============================================

/**
 * Security layers applied:
 * 1. Rate limiting (contactLimiter) - Max 5 per hour per IP
 * 2. Attack pattern detection
 * 3. Input validation and sanitization
 * 4. Email-based rate limiting
 * 5. Email sending with error handling
 */
router.post(
  '/',
  contactLimiter,           // Layer 1: IP-based rate limiting
  attackPatternCheck,       // Layer 2: Attack pattern detection
  contactValidationRules,   // Layer 3: Input validation
  handleValidationErrors,   // Layer 4: Validation error handling
  async (req, res) => {
    try {
      const { name, email, phone, message } = req.body;
      
      // Get client info
      const ip = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];
      
      // ============================================
      // LAYER 5: Email-based rate limiting
      // ============================================
      const emailLimit = checkEmailRateLimit(email, 5, 3600000); // 5 per hour
      
      if (!emailLimit.allowed) {
        logSecurityEvent('Email rate limit exceeded', {
          email: email.toLowerCase(),
          ip,
          remaining: emailLimit.remaining,
        });
        
        return res.status(429).json({
          success: false,
          message: 'Limite de envios atingido para este e-mail. Tente novamente mais tarde.',
          retryAfter: Math.ceil((emailLimit.resetTime - Date.now()) / 1000),
        });
      }
      
      // ============================================
      // LAYER 6: Send emails
      // ============================================
      
      // Send notification to company
      const result = await sendContactEmail({
        name,
        email,
        phone,
        message,
        ip,
        userAgent,
      });
      
      // Send confirmation to user (non-blocking)
      sendConfirmationEmail({ name, email }).catch(err => {
        logger.error('Failed to send confirmation email', { error: err.message });
      });
      
      // Log successful submission
      logger.info('Contact form submitted successfully', {
        email: email.toLowerCase(),
        ip,
        messageId: result.messageId,
      });
      
      // Return success response
      res.status(200).json({
        success: true,
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.',
        data: {
          messageId: result.messageId,
        },
      });
      
    } catch (error) {
      logger.error('Contact form submission failed', {
        error: error.message,
        ip: req.ip,
        body: req.body,
      });
      
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao enviar mensagem. Tente novamente mais tarde.',
      });
    }
  }
);

// ============================================
// GET /api/contact/health - Health check
// ============================================

router.get('/health', async (req, res) => {
  try {
    const { verifyEmailService } = await import('../services/emailService.js');
    const status = await verifyEmailService();
    
    res.status(status.success ? 200 : 503).json({
      success: status.success,
      service: 'contact',
      message: status.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      service: 'contact',
      message: 'Service unavailable',
      error: error.message,
    });
  }
});

export default router;
