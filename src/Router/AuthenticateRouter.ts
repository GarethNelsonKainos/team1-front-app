import { Router } from 'express';
import type { AuthenticateController } from '../controllers/AuthenticateController';

export default function authenticationRouter(
  authController: AuthenticateController,
) {
  const router = Router();

  router.get('/login', (req, res) => {
    res.render('login', { title: 'Sign In - Kainos Job Roles' });
  });

  router.post('/login', (req, res) => authController.renderLogin(req, res));

  router.post('/logout', (req, res) => authController.performLogout(req, res));

  return router;
}
