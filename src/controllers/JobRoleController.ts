import type { Application, Request, Response } from 'express';
import type { JobRoleService } from '../services/JobRoleService';
import { isJobApplicationsEnabled } from '../utils/FeatureFlags';
import { formatTimestampToDateString } from '../utils/date-formatter';

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
      const idParam = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const jobRole = await jobRoleService.getJobRoleById(idParam);

      const formattedClosingDate = formatTimestampToDateString(
        jobRole.closingDate,
      );

      res.render('job-role-information', {
        title: jobRole.roleName,
        jobRole: jobRole,
        formattedClosingDate: formattedClosingDate,
        isJobApplicationsEnabled: isJobApplicationsEnabled(),
      });
    } catch (error) {
      console.error('Error fetching job role information:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Unable to load job role information. Please try again later.',
      });
    }
  });

  app.get('/job-roles/:id/apply', async (req: Request, res: Response) => {
    try {
      // Check if job applications feature is enabled
      if (!isJobApplicationsEnabled()) {
        res.status(404).render('error', {
          title: 'Feature Not Available',
          message: 'Job applications are currently not available.',
        });
        return;
      }

      const idParam = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const jobRole = await jobRoleService.getJobRoleById(idParam);

      res.render('job-apply', {
        title: `Apply for ${jobRole.roleName}`,
        jobRoleId: jobRole.jobRoleId,
        roleName: jobRole.roleName,
      });
    } catch (error) {
      console.error('Error in JobRoleController:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Unable to load application page. Please try again later.',
      });
    }
  });

  app.post('/job-roles/:id/apply', async (req: Request, res: Response) => {
    // This route is now handled by JavaScript form submission to backend API
    // Redirect to success page as fallback
    res.redirect('/application-success');
  });
}
