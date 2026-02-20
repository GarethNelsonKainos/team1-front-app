import axios from 'axios';
import type { Application, Request, Response } from 'express';
import FormData from 'form-data';
import multer from 'multer';
import authenticateJWT from '../middleware/AuthMiddleware';
import { JobRoleStatus } from '../models/JobRole';
import type { JobRoleService } from '../services/JobRoleService';
import {
  isAddJobRoleEnabled,
  isJobApplicationsEnabled,
} from '../utils/FeatureFlags';
import { formatTimestampToDateString } from '../utils/date-formatter';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

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

export default function JobRoleController(
  app: Application,
  jobRoleService: JobRoleService,
) {
  app.get(
    '/job-roles',
    authenticateJWT,
    async (req: Request, res: Response) => {
      try {
        const jobRoles = await jobRoleService.getJobRoles();

        // Format closing dates for all job roles
        const formattedJobRoles = jobRoles.map(role => ({
          ...role,
          closingDate: formatTimestampToDateString(role.closingDate)
        }));

        res.render('job-role-list', {
          title: 'Available Job Roles',
          jobRoles: formattedJobRoles,
          user: res.locals.user,
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
        const idParam = Number(req.params.id);
        const jobRole = await jobRoleService.getJobRoleById(idParam);

        const formattedClosingDate = formatTimestampToDateString(
          jobRole.closingDate,
        );

        // Calculate job status message based on conditions
        let jobStatusMessage = '';
        const user = res.locals.user;

        if (!user) {
          jobStatusMessage =
            '<a href="/login" class="text-blue-700 underline">Sign in</a> to apply';
        } else if (!isJobApplicationsEnabled()) {
          jobStatusMessage = 'Job applications are currently unavailable';
        } else if (
          jobRole.status !== JobRoleStatus.Open ||
          (jobRole.openPositions ?? 0) <= 0
        ) {
          jobStatusMessage = 'This position is no longer available';
        } else {
          jobStatusMessage = `<a href="/job-roles/${jobRole.jobRoleId}/apply" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition-colors">Apply Now</a>`;
        }

        res.render('job-role-information', {
          title: jobRole.roleName,
          jobRole: jobRole,
          formattedClosingDate: formattedClosingDate,
          isJobApplicationsEnabled: isJobApplicationsEnabled(),
          jobStatusMessage: jobStatusMessage,
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

        const idParam = Number(req.params.id);

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

  app.post(
    '/application/:id/apply',
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
                Authorization: `Bearer ${authToken}`,
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

  app.get('/add-role', authenticateJWT, async (req: Request, res: Response) => {
    try {
      if (!isAddJobRoleEnabled()) {
        res.status(404).render('error', {
          title: 'Feature Not Available',
          message: 'Adding job roles is currently not available.',
        });
        return;
      }

      if (!res.locals.user || res.locals.user.userRole !== 2) {
        res.status(403).render('error', {
          title: 'Access Denied',
          message: 'You do not have permission to access this page.',
        });
        return;
      }

      const [bands, capabilities, locations] = await Promise.all([
        jobRoleService.getBands(),
        jobRoleService.getCapabilities(),
        jobRoleService.getLocations(),
      ]);

      res.render('add-role', {
        title: 'Add New Job Role',
        user: res.locals.user,
        bands,
        capabilities,
        locations,
      });
    } catch (error) {
      console.error('Error in JobRoleController:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Unable to load add role page. Please try again later.',
      });
    }
  });

  app.post(
    '/add-role',
    authenticateJWT,
    async (req: Request, res: Response) => {
      try {
        if (!isAddJobRoleEnabled()) {
          res.status(404).render('error', {
            title: 'Feature Not Available',
            message: 'Adding job roles is currently not available.',
          });
          return;
        }

        if (!res.locals.user || res.locals.user.userRole !== 2) {
          res.status(403).render('error', {
            title: 'Access Denied',
            message: 'You do not have permission to access this page.',
          });
          return;
        }

        // Pass the raw body to the service
        await jobRoleService.createJobRole(req.body);

        // Redirect to success page
        res.redirect('/job-roles');
      } catch (error) {
        console.error('Error creating job role:', error);

        // Re-fetch dropdown data to re-render form
        const [bands, capabilities, locations] = await Promise.all([
          jobRoleService.getBands(),
          jobRoleService.getCapabilities(),
          jobRoleService.getLocations(),
        ]);

        let errorMessage = 'Failed to create job role. Please try again.';

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 409) {
            errorMessage = 'A job role with this name already exists.';
          } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
          }
        }

        res.render('add-role', {
          title: 'Add New Job Role',
          user: res.locals.user,
          bands,
          capabilities,
          locations,
          error: errorMessage,
          formData: req.body, // Re-populate form with submitted data
        });
      }
    },
  );
}
