import request from 'supertest';
import express from 'express';
import { jest } from '@jest/globals';

// Setup mocked services before importing the router that depends on them
jest.unstable_mockModule('../services/emailService.js', () => ({
  sendContactEmail: jest.fn(),
  sendConfirmationEmail: jest.fn(),
}));

// Setup mock for logger
jest.unstable_mockModule('../utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  logSecurityEvent: jest.fn(),
}));

const emailService = await import('../services/emailService.js');
const logger = await import('../utils/logger.js');
const contactRoutes = (await import('./contact.js')).default;

// Create an Express app for testing
const app = express();
app.set('trust proxy', 1); // Important for rate limiting
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/contact', contactRoutes);

describe('POST /api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const validPayload = {
    name: 'John Doe',
    email: 'johndoe@example.com',
    phone: '11999999999',
    message: 'Hello, this is a valid test message that meets the length requirements.',
  };

  it('should successfully submit a valid contact form', async () => {
    emailService.sendContactEmail.mockResolvedValue({ messageId: 'test-message-id' });
    emailService.sendConfirmationEmail.mockResolvedValue();

    const response = await request(app)
      .post('/api/contact')
      .send(validPayload);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Mensagem enviada com sucesso! Entraremos em contato em breve.');

    // Check if emails were sent
    expect(emailService.sendContactEmail).toHaveBeenCalledWith(expect.objectContaining({
      name: validPayload.name,
      email: validPayload.email,
      phone: validPayload.phone,
      message: validPayload.message,
    }));
    expect(emailService.sendConfirmationEmail).toHaveBeenCalledWith({
      name: validPayload.name,
      email: validPayload.email,
    });
  });

  it('should reject requests with missing required fields', async () => {
    const invalidPayload = {
      // Missing name, email, and message
    };

    const response = await request(app)
      .post('/api/contact')
      .send(invalidPayload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  it('should detect and block attack patterns', async () => {
    const maliciousPayload = {
      ...validPayload,
      message: '<script>alert("XSS")</script>',
    };

    const response = await request(app)
      .post('/api/contact')
      .send(maliciousPayload);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Requisição bloqueada por segurança');

    expect(emailService.sendContactEmail).not.toHaveBeenCalled();
  });

  it('should handle email service failures gracefully', async () => {
    emailService.sendContactEmail.mockRejectedValue(new Error('SMTP connection failed'));

    const response = await request(app)
      .post('/api/contact')
      .send(validPayload);

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('SMTP connection failed');
  });

  it('should enforce email-based rate limiting', async () => {
    emailService.sendContactEmail.mockResolvedValue({ messageId: 'test-message-id' });
    emailService.sendConfirmationEmail.mockResolvedValue();

    const rateLimitEmail = 'ratelimit@example.com';
    const payload = { ...validPayload, email: rateLimitEmail };

    // The limit is 5 per hour. We make 5 successful requests.
    // We must pass a unique IP to bypass the IP-based rate limiting which has already counted the previous requests
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/contact')
        .set('X-Forwarded-For', `192.168.1.10${i}`)
        .send(payload);

      expect(res.status).toBe(200);
    }

    // The 6th request should fail with a 429
    const response = await request(app)
      .post('/api/contact')
      .set('X-Forwarded-For', `192.168.1.106`)
      .send(payload);

    expect(response.status).toBe(429);
    expect(response.body.success).toBe(false);
    // There are two limits: IP-based and email-based. We will match the general rate limit failure.
    // Both return a 429 error code but message can vary.
    // The IP-based `contactLimiter` kicks in first in the route definitions.
    expect(['Limite de envios atingido. Você pode enviar até 5 mensagens por hora.', 'Limite de envios atingido para este e-mail. Tente novamente mais tarde.'])
      .toContain(response.body.message);
  });
});
