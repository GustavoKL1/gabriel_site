/**
 * EMAIL SERVICE
 * =============
 * 
 * DANGER: Email services are critical attack vectors!
 * 
 * SECURITY RISKS:
 * - SMTP credentials exposed = Full email access
 * - No rate limiting = Email spamming
 * - No validation = Email header injection
 * - No sanitization = XSS via email content
 * 
 * PROTECTION MEASURES:
 * 1. Use App Passwords (never main password)
 * 2. Enable 2FA on email account
 * 3. Use TLS/SSL encryption
 * 4. Validate all inputs
 * 5. Rate limit submissions
 * 6. Sanitize email content
 */

import nodemailer from 'nodemailer';
import logger, { logError, logSecurityEvent } from '../utils/logger.js';
import {
  generateContactEmailTemplate,
  generatePlainTextTemplate,
  generateConfirmationHtmlTemplate,
  generateConfirmationTextTemplate,
} from '../templates/emailTemplates.js';

// ============================================
// SMTP TRANSPORT CONFIGURATION
// ============================================

/**
 * Create SMTP transporter
 * 
 * SECURITY NOTES:
 * - Always use TLS/SSL (SMTP_SECURE=true for port 465)
 * - Never hardcode credentials
 * - Use environment variables
 * - Enable app-specific passwords
 */
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    
    // Authentication
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    
    // TLS options for security
    tls: {
      // Reject unauthorized certificates
      rejectUnauthorized: true,
      // Minimum TLS version
      minVersion: 'TLSv1.2',
    },
    
    // Connection settings
    pool: true, // Use pooled connections
    maxConnections: 5,
    maxMessages: 100,
    
    // Timeouts
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
  };
  
  return nodemailer.createTransport(config);
};

// Initialize transporter
let transporter;

try {
  transporter = createTransporter();
  logger.info('Email transporter initialized');
} catch (error) {
  logError(error, { context: 'Email transporter initialization' });
  throw new Error('Failed to initialize email service');
}

// ============================================
// EMAIL SENDING FUNCTIONS
// ============================================

/**
 * Send contact form email
 * 
 * @param {Object} data - Contact form data
 * @returns {Promise<Object>} - Result of email sending
 */
export const sendContactEmail = async (data) => {
  const { name, email, phone, message, ip, userAgent } = data;
  
  // Validate required fields
  if (!name || !email || !message) {
    throw new Error('Campos obrigatórios ausentes');
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('E-mail inválido');
  }
  
  // Prepare email data
  const timestamp = new Date().toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  });
  
  const emailData = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : null,
    message: message.trim(),
    ip,
    timestamp,
    userAgent,
  };
  
  // Build email options
  const mailOptions = {
    from: {
      name: 'GKL Engenharia - Contato',
      address: process.env.SMTP_USER,
    },
    to: process.env.RECIPIENT_EMAIL,
    replyTo: email, // Allow direct reply to sender
    subject: `Nova mensagem de ${name} - GKL Engenharia`,
    text: generatePlainTextTemplate(emailData),
    html: generateContactEmailTemplate(emailData),
    
    // Additional headers for security
    headers: {
      'X-Mailer': 'GKL-Engenharia-API/1.0',
      'X-Contact-Form': 'true',
      'X-Sender-IP': ip || 'unknown',
    },
  };
  
  // Add CC if configured
  if (process.env.CC_EMAILS) {
    mailOptions.cc = process.env.CC_EMAILS.split(',').map(e => e.trim());
  }
  
  try {
    // Verify transporter connection
    await transporter.verify();
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    logger.info('Contact email sent successfully', {
      messageId: info.messageId,
      to: mailOptions.to,
      from: email,
    });
    
    return {
      success: true,
      messageId: info.messageId,
      message: 'E-mail enviado com sucesso',
    };
    
  } catch (error) {
    logError(error, {
      context: 'Send contact email',
      to: mailOptions.to,
      from: email,
    });
    
    throw new Error('Falha ao enviar e-mail. Tente novamente mais tarde.');
  }
};

/**
 * Send confirmation email to the user
 */
export const sendConfirmationEmail = async (data) => {
  const { name, email } = data;
  
  const mailOptions = {
    from: {
      name: 'GKL Engenharia',
      address: process.env.SMTP_USER,
    },
    to: email,
    subject: 'Recebemos sua mensagem - GKL Engenharia',
    html: generateConfirmationHtmlTemplate(data),
    text: generateConfirmationTextTemplate(data),
  };
  
  try {
    await transporter.sendMail(mailOptions);
    logger.info('Confirmation email sent', { to: email });
  } catch (error) {
    // Don't throw - confirmation email is not critical
    logError(error, { context: 'Send confirmation email', to: email });
  }
};

// ============================================
// HEALTH CHECK
// ============================================

/**
 * Verify email service is working
 */
export const verifyEmailService = async () => {
  try {
    await transporter.verify();
    return { success: true, message: 'Email service is ready' };
  } catch (error) {
    logError(error, { context: 'Email service verification' });
    return { success: false, message: error.message };
  }
};

export default {
  sendContactEmail,
  sendConfirmationEmail,
  verifyEmailService,
};
