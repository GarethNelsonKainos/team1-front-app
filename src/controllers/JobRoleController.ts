import type { Application, Request, Response } from 'express';
import type { JobRoleService } from '../services/JobRoleService';

export default function JobRoleController(
  app: Application,
  jobRoleService: JobRoleService,
) {
  app.get('/job-roles', async (_req: Request, res: Response) => {
    try {
      const jobRoles = await jobRoleService.getJobRoles();

      res.render('job-role-list', {
        title: 'Available Job Roles',
        jobRoles: jobRoles,
      });
    } catch (error: unknown) {
      console.error('Error in JobRoleController:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Unable to load job roles. Please try again later.',
      });
    }
  });

  app.get('/job-roles/:id', async (req: Request, res: Response) => {
    try {
      const jobRoleId = Number.parseInt(req.params.id, 10);

      if (Number.isNaN(jobRoleId)) {
        res.status(400).render('error', {
          title: 'Error',
          message: 'Invalid job role ID.',
        });
        return;
      }

      const jobRole = await jobRoleService.getJobRole(jobRoleId);

      res.render('job-role-detail', {
        title: `${jobRole.roleName} - Job Details`,
        jobRole: jobRole,
      });
    } catch (error) {
      console.error('Error in JobRoleController:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Unable to load job role details. Please try again later.',
      });
    }
  });
}
