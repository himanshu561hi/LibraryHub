import app from '../src/app.js';
import { connectDatabase } from '../src/config/db.js';

/**
 * Vercel Serverless Function Entry Point for Library Hub REST API
 */
export default async function handler(req, res) {
  try {
    await connectDatabase();
  } catch (err) {
    // If DB fails, log error so cloud logs capture the issue, while app continues to return structured response
    console.error('Vercel Serverless DB Connection Error:', err.message);
  }

  return app(req, res);
}

