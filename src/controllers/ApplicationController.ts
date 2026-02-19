import type { Request, Response } from 'express';
import type ApplicationService from '../services/ApplicationService';

export default class ApplicationController {
  private applicationService: ApplicationService;

  constructor(applicationService: ApplicationService) {
    this.applicationService = applicationService;
  }

  async createApplication(req: Request, res: Response): Promise<void> {
    try {
      const jobRoleId = req.params.id as string;
      const cvFile = req.file as Express.Multer.File;

      if (!jobRoleId) {
        res.status(400).render('error', {
          title: 'Invalid Request',
          message: 'Job role ID is required to apply.',
        });
        return;
      }

      if (!cvFile) {
        res.status(400).render('error', {
          title: 'Invalid Request',
          message: 'CV file is required to apply.',
        });
        return;
      }

      await this.applicationService.createApplication(
        Number.parseInt(jobRoleId, 10),
        cvFile,
      );

      res.redirect('/application-success');
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).render('error', {
        title: 'Error',
        message:
          'An error occurred while submitting your application. Please try again later.',
      });
    }
  }
}
