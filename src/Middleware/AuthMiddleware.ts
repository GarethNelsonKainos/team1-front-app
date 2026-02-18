import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default function authenticateJWT(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies.token;

  if (!token) {
    res.redirect('/login');
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).render('error', {
      error: 'Internal server error',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    res.locals.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}
