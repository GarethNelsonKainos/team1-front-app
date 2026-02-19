import { Router, Request, Response } from 'express';
import ApplicationController from "../controllers/ApplicationController";
import upload from '../middleware/UploadMiddleware';


export default function applicationRouter(applicationController: ApplicationController) {
    const router = Router();

    router.get('/application-success', (req: Request, res: Response) => {
        res.render('application-success', {
            title: 'Application Submitted - Kainos Job Roles',
        });
    });

    router.post('/application/:id/apply', upload.single('cv'), (req: Request, res: Response) => applicationController.createApplication(req, res));
    return router;
}