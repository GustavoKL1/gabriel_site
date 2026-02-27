# GKL Engenharia - Backend Security Documentation

## ⚠️ CRITICAL SECURITY WARNINGS

This document outlines all security measures implemented and potential vulnerabilities that must be addressed before production deployment.

---

## 1. CORS (Cross-Origin Resource Sharing)

### ⚠️ DANGER: Misconfigured CORS is CRITICAL

**Risks:**
- `origin: '*'` allows ANY website to make requests to your API
- Missing credentials handling enables session hijacking
- Wrong methods allow unauthorized data modification
- Can lead to data theft, CSRF attacks, API abuse

### Implementation

```javascript
// config/security.js - CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGIN.split(',');
    
    if (!origin) return callback(null, true); // Mobile apps, curl
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

### Production Checklist
- [ ] Set `CORS_ORIGIN` to your exact domain(s)
- [ ] NEVER use `*` in production
- [ ] Test with different origins to verify blocking

---

## 2. Security Middlewares

### Helmet (Security Headers)

**Protection against:**
- XSS attacks
- Clickjacking
- MIME sniffing
- Protocol downgrade attacks

**Headers set:**
- `Content-Security-Policy`
- `Strict-Transport-Security` (HSTS)
- `X-Frame-Options`
- `X-Content-Type-Options`
- `X-XSS-Protection`
- `Referrer-Policy`

### Rate Limiting

**Two layers implemented:**

1. **General Limiter**: 100 requests per 15 minutes per IP
2. **Contact Form Limiter**: 5 submissions per hour per IP+email

**DANGER without rate limiting:**
- DDoS attacks
- Brute force
- Resource exhaustion
- Email spamming

### HPP (HTTP Parameter Pollution)

Prevents attackers from polluting query parameters to bypass validation.

---

## 3. Authentication

### Current State
**NO AUTHENTICATION** is implemented for the contact form.

**Why this is acceptable:**
- Contact form is public-facing
- No sensitive data is accessed
- Rate limiting provides protection

### If Adding Admin Panel Later

**REQUIRED security measures:**

```javascript
// 1. JWT Authentication
const jwt = require('jsonwebtoken');

// 2. Password hashing (NEVER store plain text!)
const bcrypt = require('bcrypt');
const saltRounds = 12; // Minimum recommended

// 3. Session management
const session = require('express-session');
const RedisStore = require('connect-redis')(session);

// 4. 2FA (Two-Factor Authentication)
const speakeasy = require('speakeasy');
```

**Password Requirements:**
- Minimum 12 characters
- Mix of uppercase, lowercase, numbers, symbols
- No common passwords (check against HaveIBeenPwned)
- Password rotation policy

---

## 4. Email Service Security

### ⚠️ CRITICAL: SMTP Credentials

**DANGERS:**
- Exposed credentials = Full email account access
- Can send spam/phishing from your domain
- Can read all company emails
- Reputation damage

### Protection Measures

1. **Use App Passwords** (never main password)
   - Gmail: Generate app-specific password
   - Outlook: Use app password
   - Custom SMTP: Create service account

2. **Enable 2FA** on email account

3. **Use TLS/SSL encryption**
   ```javascript
   tls: {
     rejectUnauthorized: true,
     minVersion: 'TLSv1.2',
   }
   ```

4. **Restrict SMTP user permissions**
   - Send-only account
   - No inbox access
   - IP restrictions

### Environment Variables

```bash
# NEVER commit these to git!
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-service-account@gmail.com
SMTP_PASS=your-app-password  # NOT your main password!
RECIPIENT_EMAIL=contato@gklengenharia.com
```

---

## 5. Input Validation & Sanitization

### Validation Layers

1. **Express Validator** - Schema validation
2. **Custom Sanitizers** - XSS prevention
3. **Attack Pattern Detection** - SQLi, XSS, NoSQLi
4. **Length Limits** - Buffer overflow prevention

### XSS Prevention

```javascript
// Sanitization removes:
- <script> tags
- Event handlers (onclick, onload)
- javascript: protocols
- iframe/object/embed tags
- Dangerous HTML entities
```

### SQL/NoSQL Injection Prevention

```javascript
// Pattern detection for:
- SELECT, INSERT, UPDATE, DELETE, DROP, UNION
- $gt, $lt, $ne, $regex (MongoDB operators)
- Path traversal (../)
- Command injection (|, ;, `)
```

---

## 6. Logging Security

### Sensitive Data Redaction

**NEVER log:**
- Passwords
- API keys
- Session tokens
- Credit card numbers
- Social security numbers
- SMTP passwords

**Implementation:**
```javascript
const SENSITIVE_FIELDS = [
  'password', 'token', 'secret', 
  'credit_card', 'smtp_pass', 'api_key'
];

// Automatically redacted in logs
```

---

## 7. Environment Variables Security

### ⚠️ CRITICAL: .env File

**NEVER:**
- Commit `.env` to git
- Share `.env` files
- Hardcode secrets in code
- Log environment variables

**ALWAYS:**
- Use `.env.example` as template
- Add `.env` to `.gitignore`
- Use different secrets for dev/prod
- Rotate secrets regularly

### Required Variables

```bash
# Server
NODE_ENV=production
PORT=3000

# CORS
CORS_ORIGIN=https://gklengenharia.com

# SMTP (MOST CRITICAL!)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
RECIPIENT_EMAIL=

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15
CONTACT_RATE_LIMIT_MAX=5
CONTACT_RATE_LIMIT_WINDOW=60
```

---

## 8. Production Deployment Checklist

### Before Going Live

- [ ] Change all default secrets
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure firewall (allow only ports 80, 443, 3000)
- [ ] Set up log monitoring
- [ ] Configure backup strategy
- [ ] Enable DDoS protection (Cloudflare)
- [ ] Set up error tracking (Sentry)
- [ ] Configure alerting

### Server Security

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 3. Install fail2ban (brute force protection)
sudo apt install fail2ban

# 4. Disable root login
sudo passwd -l root

# 5. Use SSH keys only
# Edit /etc/ssh/sshd_config:
# PasswordAuthentication no
# PubkeyAuthentication yes
```

---

## 9. Common Attack Vectors

### 1. DDoS Attacks
**Protection:** Rate limiting, Cloudflare, server scaling

### 2. Brute Force
**Protection:** Rate limiting, fail2ban, strong passwords

### 3. XSS (Cross-Site Scripting)
**Protection:** Input sanitization, CSP headers, output encoding

### 4. SQL/NoSQL Injection
**Protection:** Input validation, parameterized queries, ORM

### 5. CSRF (Cross-Site Request Forgery)
**Protection:** CSRF tokens, SameSite cookies, origin validation

### 6. Man-in-the-Middle
**Protection:** HTTPS, HSTS, certificate pinning

### 7. Information Disclosure
**Protection:** Error handling, no stack traces in prod, secure headers

---

## 10. Security Monitoring

### What to Monitor

1. **Failed login attempts**
2. **Rate limit violations**
3. **Validation failures**
4. **Error rates**
5. **Unusual traffic patterns**
6. **Attack pattern detections**

### Alert Thresholds

```javascript
// Example alerts
if (failedLogins > 5) alert('Possible brute force');
if (rateLimitHits > 10) alert('Possible DDoS');
if (validationFailures > 20) alert('Possible attack');
```

---

## 11. Incident Response

### If Compromised

1. **Immediately:**
   - Take service offline
   - Change all passwords
   - Revoke all sessions
   - Check logs for breach scope

2. **Within 1 hour:**
   - Notify stakeholders
   - Preserve evidence
   - Contact hosting provider

3. **Within 24 hours:**
   - Patch vulnerability
   - Restore from clean backup
   - Implement additional monitoring

4. **Post-incident:**
   - Document lessons learned
   - Update security policies
   - Conduct security audit

---

## 12. Contact & Support

For security issues, contact:
- Security Team: security@gklengenharia.com
- Emergency: +55 (11) 1234-5678

---

**Last Updated:** 2024
**Version:** 1.0
**Classification:** CONFIDENTIAL
