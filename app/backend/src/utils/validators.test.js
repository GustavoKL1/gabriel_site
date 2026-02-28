import { isValidEmail } from './validators.js';

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
