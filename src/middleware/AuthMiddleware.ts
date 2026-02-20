import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type User from '../models/User';

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

  if (!process.env.JWT_SECRET) {
    res.status(500).render('error', {
      error: 'Internal server error',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as User;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    res.locals.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}
