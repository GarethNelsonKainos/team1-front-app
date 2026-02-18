import axios from 'axios';
import type { Request, Response } from 'express';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export class AuthenticateController {
  async renderLogin(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      const { token } = response.data;

      // Validate token exists and is a non-empty string
      if (typeof token !== 'string' || token.length === 0) {
        return res.status(401).json({
          error: 'Invalid Credentials',
        });
      }

      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        path: '/',
        sameSite: 'lax',
      });

      res.redirect('/job-roles');
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid Credentials',
      });
    }
  }

  async renderLogout(req: Request, res: Response) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}
