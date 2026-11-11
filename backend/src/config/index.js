import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5001,
  timezone: process.env.TZ || 'Asia/Kolkata',
  
  // Database
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/library_hub',
    options: {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000,
    },
  },

  // Security & JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_library_hub_nawalpur_super_secure_key_123',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: 'lh_session',
  },

  // Google OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    mockEnabled: process.env.MOCK_GOOGLE_AUTH === 'true' || !process.env.GOOGLE_CLIENT_ID,
  },

  // Email Configuration (Nodemailer)
  email: {
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || '"Library Hub Nawalpur" <noreply@libraryhub.in>',
    mockMode: process.env.EMAIL_MOCK_MODE !== 'false', // Default to safe mock mode
  },

  // Frontend App URL (for email links and redirects)
  frontendUrl: process.env.FRONTEND_URL || 'https://libraryhubnawalpur.netlify.app',

  // CORS Allowed Origins
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173,https://libraryhubnawalpur.netlify.app')
    .split(',')
    .map((origin) => origin.trim()),

  // Super Admin Default Provisioning (Seed only)
  seedAdmin: {
    name: process.env.SEED_ADMIN_NAME || 'Library Hub Admin',
    email: process.env.SEED_ADMIN_EMAIL || 'admin@libraryhub.in',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin@LibraryHub2025',
  },

  // ImageKit Media Storage
  imagekit: {
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
  },
};

export default config;

