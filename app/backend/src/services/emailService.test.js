import { jest } from '@jest/globals';

// Mock the environment variables used during module initialization
process.env.SMTP_HOST = 'smtp.example.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_USER = 'test@example.com';
process.env.SMTP_PASS = 'secretpass';
process.env.RECIPIENT_EMAIL = 'recipient@example.com';
process.env.CC_EMAILS = 'cc1@example.com,cc2@example.com';

// Setup mock transporter functions
const mockVerify = jest.fn().mockResolvedValue(true);
const mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });

// Mock nodemailer
jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: jest.fn(() => ({
      verify: mockVerify,
      sendMail: mockSendMail,
    })),
  },
  createTransport: jest.fn(() => ({
    verify: mockVerify,
    sendMail: mockSendMail,
  })),
}));

// Mock logger
jest.unstable_mockModule('../utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
  logError: jest.fn(),
  logSecurityEvent: jest.fn(),
}));

// Mock templates
jest.unstable_mockModule('../templates/emailTemplates.js', () => ({
  generateContactEmailTemplate: jest.fn().mockReturnValue('<p>Contact Template</p>'),
  generatePlainTextTemplate: jest.fn().mockReturnValue('Plain text template'),
  generateConfirmationHtmlTemplate: jest.fn().mockReturnValue('<p>Confirmation</p>'),
  generateConfirmationTextTemplate: jest.fn().mockReturnValue('Confirmation plain'),
}));

// We must import the module AFTER setting up the mocks
const emailService = await import('./emailService.js');
const { sendContactEmail, sendConfirmationEmail, verifyEmailService } = emailService;
const nodemailer = (await import('nodemailer')).default;
const logger = await import('../utils/logger.js');

describe('emailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', () => {
      expect(typeof emailService.sendContactEmail).toBe('function');
    });
  });

  describe('sendContactEmail', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      message: 'Test message',
      ip: '127.0.0.1',
      userAgent: 'Jest Test',
    };

    it('should send contact email successfully', async () => {
      mockVerify.mockResolvedValueOnce(true);
      mockSendMail.mockResolvedValueOnce({ messageId: 'test-id-123' });

      const result = await sendContactEmail(validData);

      expect(result).toEqual({
        success: true,
        messageId: 'test-id-123',
        message: 'E-mail enviado com sucesso',
      });
      expect(mockVerify).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledTimes(1);

      // Verify arguments passed to sendMail
      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe('recipient@example.com');
      expect(mailOptions.replyTo).toBe(validData.email);
      expect(mailOptions.subject).toBe(`Nova mensagem de ${validData.name} - GKL Engenharia`);
      expect(mailOptions.cc).toEqual(['cc1@example.com', 'cc2@example.com']);
      expect(mailOptions.html).toContain('Contact Template');
    });

    it('should throw error when missing required fields', async () => {
      await expect(sendContactEmail({ email: 'test@test.com', message: 'Hi' }))
        .rejects
        .toThrow('Campos obrigatórios ausentes');

      await expect(sendContactEmail({ name: 'Test', message: 'Hi' }))
        .rejects
        .toThrow('Campos obrigatórios ausentes');

      await expect(sendContactEmail({ name: 'Test', email: 'test@test.com' }))
        .rejects
        .toThrow('Campos obrigatórios ausentes');
    });

    it('should throw error when email format is invalid', async () => {
      await expect(sendContactEmail({ ...validData, email: 'invalid-email' }))
        .rejects
        .toThrow('E-mail inválido');
    });

    it('should throw error when transporter verification fails', async () => {
      mockVerify.mockRejectedValueOnce(new Error('Verification failed'));

      await expect(sendContactEmail(validData))
        .rejects
        .toThrow('Falha ao enviar e-mail. Tente novamente mais tarde.');
    });

    it('should throw error when sending email fails', async () => {
      mockVerify.mockResolvedValueOnce(true);
      mockSendMail.mockRejectedValueOnce(new Error('Send failed'));

      await expect(sendContactEmail(validData))
        .rejects
        .toThrow('Falha ao enviar e-mail. Tente novamente mais tarde.');
    });
  });

  describe('sendConfirmationEmail', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    it('should send confirmation email successfully', async () => {
      mockSendMail.mockResolvedValueOnce({ messageId: 'test-confirm-123' });

      await sendConfirmationEmail(validData);

      expect(mockSendMail).toHaveBeenCalledTimes(1);

      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe(validData.email);
      expect(mailOptions.subject).toBe('Recebemos sua mensagem - GKL Engenharia');
      expect(mailOptions.html).toContain('Confirmation');
    });

    it('should catch error without throwing when sending fails', async () => {
      mockSendMail.mockRejectedValueOnce(new Error('Send failed'));

      // This should not throw an exception according to service logic
      await expect(sendConfirmationEmail(validData)).resolves.not.toThrow();
      expect(mockSendMail).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyEmailService', () => {
    it('should return success when verification passes', async () => {
      mockVerify.mockResolvedValueOnce(true);

      const result = await verifyEmailService();

      expect(result).toEqual({ success: true, message: 'Email service is ready' });
      expect(mockVerify).toHaveBeenCalledTimes(1);
    });

    it('should return failure when verification fails', async () => {
      mockVerify.mockRejectedValueOnce(new Error('Connection timeout'));

      const result = await verifyEmailService();

      expect(result).toEqual({ success: false, message: 'Connection timeout' });
      expect(mockVerify).toHaveBeenCalledTimes(1);
    });
  });
});
