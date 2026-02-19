import axios from 'axios';
import type { Application, Request, Response } from 'express';
import FormData from 'form-data';
import multer from 'multer';
import authenticateJWT from '../Middleware/AuthMiddleware';
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

  // GET route for job application form
  app.get(
    '/job-roles/:id/apply',
    authenticateJWT,
    async (req: Request, res: Response) => {
      try {
        if (!req.params.id) {
          res.status(400).render('error', {
            title: 'Invalid Request',
            message: 'Job role ID is required to apply.',
          });
          return;
        }

        const idParam = Number.parseInt(req.params.id as string, 10);

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
}
