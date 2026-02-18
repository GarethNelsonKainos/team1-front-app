import type { Application } from 'express';
import { AuthenticateController } from '../controllers/AuthenticateController';

export default function authenticateRouter(app: Application) {
  const authController = new AuthenticateController();

  app.get('/login', (req, res) => {
    res.render('login', { title: 'Sign In - Kainos Job Roles' });
  });

  app.post('/login', (req, res) => authController.renderLogin(req, res));

  app.get('/logout', (req, res) => authController.renderLogout(req, res));
}
