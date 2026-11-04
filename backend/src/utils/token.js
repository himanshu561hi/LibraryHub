import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret);
};

export const setSessionCookie = (res, token) => {
  const isProduction = config.env === 'production';
  res.cookie(config.jwt.cookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
};

export const clearSessionCookie = (res) => {
  res.clearCookie(config.jwt.cookieName, {
    httpOnly: true,
    path: '/',
  });
};

