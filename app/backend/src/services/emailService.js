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
// EMAIL TEMPLATES
// ============================================

/**
 * Generate HTML email template for contact form
 */
const generateContactEmailTemplate = (data) => {
  const { name, email, phone, message, ip, timestamp } = data;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Mensagem de Contato - GKL Engenharia</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0160F8;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #0160F8;
    }
    .content {
      margin-bottom: 30px;
    }
    .field {
      margin-bottom: 20px;
    }
    .field-label {
      font-weight: bold;
      color: #555;
      margin-bottom: 5px;
    }
    .field-value {
      background-color: #f9f9f9;
      padding: 12px;
      border-radius: 4px;
      border-left: 3px solid #0160F8;
    }
    .message-box {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      border-left: 3px solid #FC8E44;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
    }
    .meta-info {
      background-color: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">GKL Engenharia</div>
      <p style="margin: 10px 0 0 0; color: #666;">Nova Mensagem de Contato</p>
    </div>
    
    <div class="content">
      <div class="field">
        <div class="field-label">Nome:</div>
        <div class="field-value">${escapeHtml(name)}</div>
      </div>
      
      <div class="field">
        <div class="field-label">E-mail:</div>
        <div class="field-value">${escapeHtml(email)}</div>
      </div>
      
      ${phone ? `
      <div class="field">
        <div class="field-label">Telefone:</div>
        <div class="field-value">${escapeHtml(phone)}</div>
      </div>
      ` : ''}
      
      <div class="field">
        <div class="field-label">Mensagem:</div>
        <div class="message-box">${escapeHtml(message)}</div>
      </div>
    </div>
    
    <div class="meta-info">
      <strong>Informações Técnicas:</strong><br>
      IP: ${ip || 'N/A'}<br>
      Data/Hora: ${timestamp}<br>
      User-Agent: ${data.userAgent || 'N/A'}
    </div>
    
    <div class="footer">
      Esta mensagem foi enviada através do formulário de contato do site GKL Engenharia.<br>
      Não responda diretamente a este e-mail. Use o e-mail do remetente para contato.
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate plain text version for email clients that don't support HTML
 */
const generatePlainTextTemplate = (data) => {
  const { name, email, phone, message, ip, timestamp, userAgent } = data;
  
  return `
GKL ENGENHARIA - NOVA MENSAGEM DE CONTATO
==========================================

NOME: ${name}
E-MAIL: ${email}
${phone ? `TELEFONE: ${phone}\n` : ''}

MENSAGEM:
---------
${message}

-----------------------------------------
INFORMAÇÕES TÉCNICAS:
IP: ${ip || 'N/A'}
Data/Hora: ${timestamp}
User-Agent: ${userAgent || 'N/A'}
-----------------------------------------

Esta mensagem foi enviada através do formulário de contato do site GKL Engenharia.
  `.trim();
};

/**
 * Escape HTML to prevent XSS in emails
 */
function escapeHtml(text) {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0160F8; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GKL Engenharia</h1>
    </div>
    <div class="content">
      <h2>Olá, ${escapeHtml(name)}!</h2>
      <p>Recebemos sua mensagem e agradecemos o contato.</p>
      <p>Nossa equipe analisará sua solicitação e retornaremos em breve.</p>
      <p><strong>Tempo médio de resposta:</strong> 24 horas úteis</p>
    </div>
    <div class="footer">
      <p>Este é um e-mail automático. Por favor, não responda.</p>
      <p>© ${new Date().getFullYear()} GKL Engenharia. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `
GKL ENGENHARIA

Olá, ${name}!

Recebemos sua mensagem e agradecemos o contato.
Nossa equipe analisará sua solicitação e retornaremos em breve.

Tempo médio de resposta: 24 horas úteis

---
Este é um e-mail automático. Por favor, não responda.
© ${new Date().getFullYear()} GKL Engenharia.
    `.trim(),
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
