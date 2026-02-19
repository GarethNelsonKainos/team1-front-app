import axios from 'axios';
import type { Application, Request, Response } from 'express';
import { API_BASE_URL } from '../config';
import FormData from 'form-data';
import multer from 'multer';
import type { JobRoleService } from '../services/JobRoleService';
import { isJobApplicationsEnabled } from '../utils/FeatureFlags';
import { formatTimestampToDateString } from '../utils/date-formatter';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

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

  app.post(
    '/job-roles/:id/apply',
    upload.single('cv'),
    async (req: Request, res: Response) => {
      try {
        // Check if job applications feature is enabled
        if (!isJobApplicationsEnabled()) {
          res.status(404).render('error', {
            title: 'Feature Not Available',
            message: 'Job applications are currently not available.',
          });
          return;
        }

        // Validate CV upload
        if (!req.file) {
          res.status(400).render('error', {
            title: 'Missing CV',
            message: 'Please upload your CV to complete the application.',
          });
          return;
        }

        const jobRoleId = req.params.id;

        // Get auth token from cookies or authorization header
        const authToken =
          req.cookies?.authToken ||
          req.headers.authorization?.replace('Bearer ', '');
        if (!authToken) {
          res.redirect('/login');
          return;
        }

        try {
          // Prepare form data for backend API
          const formData = new FormData();
          formData.append('cv', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
          });
          formData.append('jobRoleId', jobRoleId);

          // Forward the application + CV to backend API
          const response = await axios.post(
            `${API_BASE_URL}/api/applications`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                ...formData.getHeaders(),
              },
            },
          );

          // Redirect to success page
          res.redirect('/application-success');
        } catch (apiError: unknown) {
          console.error('Error submitting application to backend:', apiError);

          let errorMessage =
            'Unable to submit application. Please try again later.';
          if (axios.isAxiosError(apiError) && apiError.response?.data?.error) {
            errorMessage = apiError.response.data.error;
          }

          res.status(500).render('error', {
            title: 'Application Failed',
            message: errorMessage,
          });
        }
      } catch (error) {
        console.error('Error in JobRoleController:', error);
        res.status(500).render('error', {
          title: 'Error',
          message:
            'Unable to process application request. Please try again later.',
        });
      }
    },
  );
}
