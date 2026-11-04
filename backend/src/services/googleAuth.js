import { OAuth2Client } from 'google-auth-library';
import config from '../config/index.js';
import logger from '../utils/logger.js';

let client = null;

const getOAuthClient = () => {
  const clientId = config.google.clientId || process.env.GOOGLE_CLIENT_ID;
  if (!client && clientId) {
    client = new OAuth2Client(clientId);
  }
  return client;
};

/**
 * Verifies a Google ID token from the frontend.
 * Returns { googleId, email, name, picture }
 */
export const verifyGoogleIdToken = async (idToken) => {
  // If mock mode is enabled or client ID is not configured (offline development)
  if (config.google.mockEnabled || !config.google.clientId) {
    // If client passed a mock object or mock string
    if (idToken.startsWith('mock-token-') || idToken.includes('@')) {
      logger.debug('Using mock Google token verification in development mode');
      const email = idToken.includes('@') ? idToken.replace('mock-token-', '') : 'student.test@example.com';
      return {
        googleId: `mock-gid-${Buffer.from(email).toString('hex').slice(0, 12)}`,
        email: email.toLowerCase(),
        name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        emailVerified: true,
      };
    }
  }

  const oauthClient = getOAuthClient();
  const clientId = config.google.clientId || process.env.GOOGLE_CLIENT_ID;

  if (!oauthClient || !clientId) {
    throw new Error('Google OAuth client ID is not configured in backend environment');
  }

  const ticket = await oauthClient.verifyIdToken({
    idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email_verified) {
    throw new Error('Google email is not verified or token is invalid');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture || null,
    emailVerified: payload.email_verified,
  };
};

export default { verifyGoogleIdToken };

