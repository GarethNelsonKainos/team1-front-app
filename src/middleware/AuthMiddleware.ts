import axios from 'axios';
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

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).render('error', {
      error: 'Internal server error',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    res.locals.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}
