import type { Request, Response } from 'express';
import type { LoginService } from '../services/LoginService';

export class AuthenticateController {
  constructor(private loginService: LoginService) {}
  async renderLoginPage(req: Request, res: Response) {
    const errorMessage = req.query.error as string;
    res.render('login', {
      title: 'Sign In - Kainos Job Roles',
      error: errorMessage,
    });
  }

  async performLogin(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const token = await this.loginService.login(email, password);

      // Validate token exists and is a non-empty string
      if (typeof token !== 'string' || token.length === 0) {
        return res.redirect('/login?error=Invalid%20Credentials');
      }

      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        path: '/',
        sameSite: 'lax',
      });

      res.redirect('/job-roles');
    } catch (error) {
      return res.redirect('/login?error=Invalid%20Credentials');
    }
  }

  async performLogout(req: Request, res: Response) {
    res.clearCookie('token');
    res.redirect('/login');
  }
}
