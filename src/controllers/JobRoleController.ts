import axios from 'axios';
import type { Application, Request, Response } from 'express';
import FormData from 'form-data';
import multer from 'multer';
import authenticateJWT from '../middleware/AuthMiddleware';
import type { JobRoleService } from '../services/JobRoleService';
import { isAddJobRoleEnabled } from '../utils/FeatureFlags';

export default function JobRoleController(
  app: Application,
  jobRoleService: JobRoleService,
) {
  app.get(
    '/job-roles',
    authenticateJWT,
    async (req: Request, res: Response) => {
      try {
        const token = req.cookies.token;
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
    },
  );

  app.get(
    '/job-roles/:id',
    authenticateJWT,
    async (req: Request, res: Response) => {
      try {
        const idParam = req.params.id as string;

        const token = req.cookies.token;
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
          message:
            'Unable to load job role information. Please try again later.',
        });
      }
    },
  );

  app.get(
    '/job-roles/:id/apply',
    authenticateJWT,
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

        const idParam = req.params.id as string;

        const token = req.cookies.token;
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
    },
  );
  // API endpoints for axios calls from frontend
  app.get('/api/bands', async (req, res) => {
    try {
      // TODO: Get token from session/auth when auth module is ready
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      const bands = await jobRoleService.getBands(token);
      res.json(bands);
    } catch (error) {
      console.error('Error fetching bands:', error);
      res.status(500).json({ error: 'Failed to fetch bands' });
    }
  });

  app.get('/api/capabilities', async (req, res) => {
    try {
      // TODO: Get token from session/auth when auth module is ready
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      const capabilities = await jobRoleService.getCapabilities(token);
      res.json(capabilities);
    } catch (error) {
      console.error('Error fetching capabilities:', error);
      res.status(500).json({ error: 'Failed to fetch capabilities' });
    }
  });

  app.get('/api/locations', async (req, res) => {
    try {
      // TODO: Get token from session/auth when auth module is ready
      const token = req.headers.authorization?.replace('Bearer ', '') || '';
      const locations = await jobRoleService.getLocations(token);
      res.json(locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ error: 'Failed to fetch locations' });
    }
  });

  app.post(
    '/job-roles/:id/apply',
    authenticateJWT,
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

        // Get auth token from cookies
        const authToken = req.cookies.token;
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
  app.post('/api/job-roles', async (req, res) => {
    try {
      // TODO: Add authorization middleware check when auth module is ready
      // Should verify user is Admin (UserRole.Admin = 2)

      if (!isAddJobRoleEnabled()) {
        return res.status(403).json({
          error: 'This feature is not currently available',
        });
      }

      const token = req.headers.authorization?.replace('Bearer ', '') || '';

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const jobRole = await jobRoleService.createJobRole(req.body, token);
      res.status(201).json(jobRole);
    } catch (error) {
      console.error('Error creating job role:', error);

      if (error instanceof Error && 'response' in error) {
        const axiosError = error as {
          response?: { status?: number; data?: { error?: string } };
        };

        if (axiosError.response?.status === 401) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        if (axiosError.response?.status === 403) {
          return res
            .status(403)
            .json({ error: 'Forbidden: Admin access required' });
        }

        return res.status(500).json({
          error:
            axiosError.response?.data?.error || 'Failed to create job role',
        });
      }

      res.status(500).json({ error: 'Failed to create job role' });
    }
  });
}
