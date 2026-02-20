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

  try {
    const decoded = jwt.decode(token) as User;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    res.locals.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}
