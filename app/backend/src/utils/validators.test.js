import { jest } from '@jest/globals';
import { isValidEmail, checkEmailRateLimit } from './validators.js';
import logger from './logger.js';

describe('Validators - isValidEmail', () => {
  describe('Valid email addresses', () => {
    it('should accept standard email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('first-last@company.net')).toBe(true);
      expect(isValidEmail('first_last@company.net')).toBe(true);
    });

    it('should accept plus-addressing', () => {
      expect(isValidEmail('user+tag@example.com')).toBe(true);
      expect(isValidEmail('user+123@domain.org')).toBe(true);
    });

    it('should accept subdomains', () => {
      expect(isValidEmail('user@mail.example.com')).toBe(true);
      expect(isValidEmail('admin@corp.domain.io')).toBe(true);
    });

    it('should accept valid special characters in the local part', () => {
      expect(isValidEmail('!#$%&\'*+-/=?^_`{|}~@example.com')).toBe(true);
      expect(isValidEmail('"test"@example.com')).toBe(true);
    });

    it('should accept single-character local part and domain names', () => {
      expect(isValidEmail('a@b.cd')).toBe(true);
    });
  });

  describe('Invalid email addresses', () => {
    it('should reject empty or missing inputs', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });

    it('should reject emails without @ symbol', () => {
      expect(isValidEmail('testexample.com')).toBe(false);
    });

    it('should reject emails with multiple @ symbols', () => {
      expect(isValidEmail('test@example@com')).toBe(false);
      expect(isValidEmail('user@@domain.com')).toBe(false);
    });

    it('should reject emails without a domain part', () => {
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
    });

    it('should reject emails without a local part', () => {
      expect(isValidEmail('@example.com')).toBe(false);
    });

    it('should reject emails with invalid characters', () => {
      expect(isValidEmail('te st@example.com')).toBe(false); // space
      expect(isValidEmail('test@ex ample.com')).toBe(false); // space
      expect(isValidEmail('test@example,com')).toBe(false); // comma
      expect(isValidEmail('test<@example.com')).toBe(false); // unescaped special char
    });

    it('should reject emails with consecutive dots in the domain', () => {
      expect(isValidEmail('test@example..com')).toBe(false);
    });
  });

  describe('Disposable email addresses', () => {
    it('should reject common disposable domains', () => {
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

      disposableDomains.forEach((domain) => {
        expect(isValidEmail(`user@${domain}`)).toBe(false);
      });
    });

    it('should reject disposable domains regardless of case', () => {
      expect(isValidEmail('user@MAILINATOR.COM')).toBe(false);
      expect(isValidEmail('user@YopMail.com')).toBe(false);
    });
  });
});

describe('Validators - checkEmailRateLimit', () => {
  let dateNowSpy;
  let loggerWarnSpy;

  beforeAll(() => {
    // Spy on logger.warn to keep test output clean
    loggerWarnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  beforeEach(() => {
    // We use a fresh spy for Date.now() in each test to easily control time
    dateNowSpy = jest.spyOn(Date, 'now');
  });

  afterEach(() => {
    // Restore the spy to not affect other tests
    dateNowSpy.mockRestore();
  });

  afterAll(() => {
    loggerWarnSpy.mockRestore();
  });

  it('should allow submissions up to maxSubmissions', () => {
    const email = 'limit1@example.com';
    const currentTime = 1000000;
    dateNowSpy.mockReturnValue(currentTime);

    const maxSubmissions = 3;
    const windowMs = 10000;

    // First submission
    const res1 = checkEmailRateLimit(email, maxSubmissions, windowMs);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(2);

    // Second submission
    const res2 = checkEmailRateLimit(email, maxSubmissions, windowMs);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(1);

    // Third submission
    const res3 = checkEmailRateLimit(email, maxSubmissions, windowMs);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it('should block submissions over maxSubmissions and return resetTime', () => {
    const email = 'limit2@example.com';
    const currentTime = 2000000;
    dateNowSpy.mockReturnValue(currentTime);

    const maxSubmissions = 2;
    const windowMs = 10000;

    // First two should be allowed
    checkEmailRateLimit(email, maxSubmissions, windowMs);
    checkEmailRateLimit(email, maxSubmissions, windowMs);

    // Third should be blocked
    const res3 = checkEmailRateLimit(email, maxSubmissions, windowMs);
    expect(res3.allowed).toBe(false);
    expect(res3.remaining).toBe(0);
    expect(res3.resetTime).toBe(currentTime + windowMs);
  });

  it('should allow new submissions after windowMs has elapsed', () => {
    const email = 'limit3@example.com';
    let currentTime = 3000000;
    dateNowSpy.mockReturnValue(currentTime);

    const maxSubmissions = 1;
    const windowMs = 5000;

    // Use up the limit
    const res1 = checkEmailRateLimit(email, maxSubmissions, windowMs);
    expect(res1.allowed).toBe(true);

    // Immediate attempt should be blocked
    const res2 = checkEmailRateLimit(email, maxSubmissions, windowMs);
    expect(res2.allowed).toBe(false);

    // Advance time past the window
    currentTime += windowMs + 100;
    dateNowSpy.mockReturnValue(currentTime);

    // Should be allowed again
    const res3 = checkEmailRateLimit(email, maxSubmissions, windowMs);
    expect(res3.allowed).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it('should treat email addresses case-insensitively', () => {
    const emailLower = 'limit4@example.com';
    const emailUpper = 'LIMIT4@EXAMPLE.COM';
    const currentTime = 4000000;
    dateNowSpy.mockReturnValue(currentTime);

    const maxSubmissions = 2;
    const windowMs = 10000;

    // Submission with lowercase
    const res1 = checkEmailRateLimit(emailLower, maxSubmissions, windowMs);
    expect(res1.allowed).toBe(true);
    expect(res1.remaining).toBe(1);

    // Submission with uppercase should count against the same limit
    const res2 = checkEmailRateLimit(emailUpper, maxSubmissions, windowMs);
    expect(res2.allowed).toBe(true);
    expect(res2.remaining).toBe(0);

    // Next submission should be blocked regardless of case
    const res3 = checkEmailRateLimit('LiMiT4@ExAmPlE.cOm', maxSubmissions, windowMs);
    expect(res3.allowed).toBe(false);
  });
});
