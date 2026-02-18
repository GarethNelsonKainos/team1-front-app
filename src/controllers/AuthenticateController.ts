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

      console.log(
        'Login successful, token received:',
        `${token.substring(0, 20)}...`,
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        path: '/',
        sameSite: 'lax',
      });

      console.log('Cookie set, redirecting to /job-roles');
      res.redirect('/job-roles');
    } catch (error) {
      res.status(401).render('login', {
        title: 'Sign In - Kainos Job Roles',
        error: 'Invalid Credentials',
      });
    }
  }

  async renderLogout(req: Request, res: Response) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}
