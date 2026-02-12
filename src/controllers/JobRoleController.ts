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
    } catch (error) {
      console.error('Error in JobRoleController:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Unable to load job roles. Please try again later.',
      });
    }
  });

  app.get('/job-roles/:id', async (req: Request, res: Response) => {
    try {
      const idParam = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const jobRole = await jobRoleService.getJobRoleById(idParam);

      res.render('job-role-information', {
        title: jobRole.roleName,
        jobRole: jobRole,
      });
    } catch (error) {
      console.error('Error fetching job role information:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Unable to load job role information. Please try again later.',
      });
    }
  });
}
