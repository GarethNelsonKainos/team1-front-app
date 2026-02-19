import { type Request, type Response, Router } from 'express';
import type ApplicationController from '../controllers/ApplicationController';
import upload from '../Middleware/UploadMiddleware';

export default function applicationRouter(
  applicationController: ApplicationController,
) {
  const router = Router();

  router.get('/application-success', (req: Request, res: Response) => {
    res.render('application-success', {
      title: 'Application Submitted - Kainos Job Roles',
    });
  });

  router.post(
    '/application/:id/apply',
    upload.single('cv'),
    (req: Request, res: Response) =>
      applicationController.createApplication(req, res),
  );
  return router;
}
