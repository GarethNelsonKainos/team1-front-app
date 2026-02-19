import { Router } from 'express';
import type { AuthenticateController } from '../controllers/AuthenticateController';

export default function authenticationRouter(
  authController: AuthenticateController,
) {
  const router = Router();

  router.get('/login', (req, res) => authController.renderLoginPage(req, res));

  router.post('/login', (req, res) => authController.performLogin(req, res));

  router.post('/logout', (req, res) => authController.performLogout(req, res));

  return router;
}
