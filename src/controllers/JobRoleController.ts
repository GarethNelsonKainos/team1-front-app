import axios from 'axios';
import type { Application, Request, Response } from 'express';
import FormData from 'form-data';
import multer from 'multer';
import { API_BASE_URL } from '../config';
import authenticateJWT from '../middleware/AuthMiddleware';
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
        const response = await jobRoleService.getJobRoles();

        res.render('job-role-list', {
          title: 'Available Job Roles',
          jobRoles: response.jobRoles,
          canDelete: response.canDelete,
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
          jobRole.jobRole.closingDate,
        );

        res.render('job-role-information', {
          title: jobRole.jobRole.roleName,
          jobRole: jobRole.jobRole,
          formattedClosingDate: formattedClosingDate,
          canDelete: true,
          apiBaseUrl: API_BASE_URL,
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
    '/job-roles/:id/confirm-delete',
    authenticateJWT,
    async (req: Request, res: Response) => {
      try {
        const idParam = req.params.id as string;

        const jobRole = await jobRoleService.getJobRoleById(idParam);

        const formattedClosingDate = formatTimestampToDateString(
          jobRole.jobRole.closingDate,
        );

        res.render('confirm-delete', {
          title: 'Confirm Delete',
          jobRole: jobRole.jobRole,
          formattedClosingDate: formattedClosingDate,
        });
      } catch (error) {
        console.error('Error fetching job role for deletion:', error);
        res.status(500).render('error', {
          title: 'Error',
          message: 'Unable to load job role. Please try again later.',
        });
      }
    },
  );

  // This will need to be edited when the authentication for the frontend is implemented,
  // as we will need to pass the token from the frontend to the backend to verify that
  // the user is an admin before allowing them to delete a job role
  app.post(
    '/job-roles/:id/delete',
    authenticateJWT,
    async (req: Request, res: Response) => {
      try {
        const id = Number(req.params.id);

        // Check if user is admin
        if (res.locals.user?.userRole !== 'Admin') {
          res.status(403).render('error', {
            title: 'Forbidden',
            message: 'You do not have permission to delete job roles.',
          });
          return;
        }

        // Delete the job role
        await jobRoleService.deleteJobRole(id, req.cookies.token);

        // Redirect to job roles list on success
        res.redirect('/job-roles');
      } catch (error) {
        console.error('Error deleting job role:', error);
        res.status(500).render('error', {
          title: 'Error',
          message: 'Unable to delete job role. Please try again later.',
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
          title: `Apply for ${jobRole.jobRole.roleName}`,
          jobRoleId: jobRole.jobRole.jobRoleId,
          roleName: jobRole.jobRole.roleName,
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
}
