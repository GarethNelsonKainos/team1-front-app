import type { Request, Response } from 'express';
import { LoginService } from '../services/LoginService';

const loginService = new LoginService();

export class AuthenticateController {
  async renderLogin(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const token = await loginService.login(email, password);

      // Validate token exists and is a non-empty string
      if (typeof token !== 'string' || token.length === 0) {
        return res.render('login', {
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
      return res.render('login', {
        error: 'Invalid Credentials',
      });
    }
  }

  async performLogout(req: Request, res: Response) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}
