import fs from 'fs';
import path from 'path';

/**
 * Validate that all required environment variables are present.
 * This should be called at the start of the application.
 */
export const validateEnv = () => {
  const requiredEnvVars = [
    'PORT',
    'CORS_ORIGIN',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'RECIPIENT_EMAIL',
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error('❌ CRITICAL ERROR: Missing required environment variables:');
    missingVars.forEach((envVar) => {
      console.error(`   - ${envVar}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');

    // In production, we might want to exit. In dev, we might just warn.
    // For this strict security review, we will exit to prevent running in an insecure state.
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing in development mode despite missing variables.');
    }
  } else {
    console.log('✅ Environment variables validated.');
  }
};
