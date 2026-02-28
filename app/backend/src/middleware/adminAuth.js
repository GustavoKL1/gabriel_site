import { logSecurityEvent } from '../utils/logger.js';

/**
 * High-performance middleware for Admin route authentication and IP whitelisting.
 * Validates Bearer token from .env and checks if the client IP is allowed.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
// Pre-compute allowed IPs array at startup to save parsing time on every request. O(1) optimization.
let allowedIpsStr = '';
let allowedIps = [];

export const adminAuth = (req, res, next) => {
  // Lazily initialize to ensure env vars are loaded by the time this runs first
  if (!allowedIpsStr && process.env.ADMIN_ALLOWED_IPS !== undefined) {
    allowedIpsStr = process.env.ADMIN_ALLOWED_IPS || '';
    allowedIps = allowedIpsStr.split(',').map(ip => ip.trim()).filter(Boolean);
  }

  // When 'trust proxy' is set, req.ip will contain the true client IP provided by proxies (like Vercel).
  const clientIp = req.ip || req.connection.remoteAddress;

  // 1. Check IP Whitelist
  // Skip IP check if the whitelist is explicitly configured to allow all (e.g. '*') for local dev,
  // but by default enforce strict checking.
  if (allowedIpsStr !== '*' && (!allowedIpsStr || !allowedIps.includes(clientIp))) {
    logSecurityEvent('admin_ip_blocked', { ip: clientIp, path: req.path });
    return res.status(403).json({ success: false, message: 'Forbidden: IP not authorized' });
  }

  // 2. Validate Bearer Token
  // Fast string comparison instead of expensive JWT decoding
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logSecurityEvent('admin_auth_missing', { ip: clientIp, path: req.path });
    return res.status(401).json({ success: false, message: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken || token !== expectedToken) {
    logSecurityEvent('admin_auth_failed', { ip: clientIp, path: req.path });
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }

  // All checks passed
  next();
};
