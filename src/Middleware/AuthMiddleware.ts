import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies.token;

  console.log('🔍 Checking auth for:', req.path);
  console.log('🍪 Cookies received:', Object.keys(req.cookies));
  console.log('🎫 Token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('❌ No token found, redirecting to /login');
    res.redirect('/login');
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.log('❌ JWT_SECRET not configured');
    res.redirect('/login');
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    res.locals.user = decoded;
    next();
  } catch (error) {
    console.log('Invalid token:', error);

    res.clearCookie('token');
    res.redirect('/login');
  }
}
