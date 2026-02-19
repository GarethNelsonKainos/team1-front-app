import type { Application, Request, Response } from 'express';
import { API_BASE_URL } from '../config';
import type { JobRoleService } from '../services/JobRoleService';
import { formatTimestampToDateString } from '../utils/date-formatter';

export default function JobRoleController(
  app: Application,
  jobRoleService: JobRoleService,
) {
  app.get('/job-roles', async (_req: Request, res: Response) => {
    try {
      const { jobRoles, canDelete } = await jobRoleService.getJobRoles();

      const formattedJobRoles = jobRoles.map((role) => ({
        ...role,
        formattedClosingDate: formatTimestampToDateString(role.closingDate),
      }));

      res.render('job-role-list', {
        title: 'Available Job Roles',
        jobRoles: formattedJobRoles,
        canDelete,
        apiBaseUrl: API_BASE_URL,
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
      const { jobRole } = await jobRoleService.getJobRoleById(idParam);

      const normalizedJobRole = jobRole;

      const formattedClosingDate = formatTimestampToDateString(
        jobRole.closingDate,
      );

      res.render('job-role-information', {
        title: jobRole.roleName,
        jobRole: normalizedJobRole,
        formattedClosingDate: formattedClosingDate,
        canDelete: true,
        apiBaseUrl: API_BASE_URL,
      });
    } catch (error) {
      console.error('Error fetching job role information:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Unable to load job role information. Please try again later.',
      });
    }
  });

  app.get(
    '/job-roles/:id/confirm-delete',
    async (req: Request, res: Response) => {
      // get the job id
      // get job info
      // render confirm delete page with info
      res.render('confirm-delete');
    },
  );

  // This will need to be edited when the authentication for the frontend is implemented,
  // as we will need to pass the token from the frontend to the backend to verify that
  // the user is an admin before allowing them to delete a job role
  app.delete('/job-roles/:id/', async (req: Request, res: Response) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const id = Number(req.params.id);
    try {
      await jobRoleService.deleteJobRole(id, req.user.token);
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete role' });
    }
  });
}
