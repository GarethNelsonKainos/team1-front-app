import type { Application } from 'express';
import type { JobRoleService } from '../services/JobRoleService';
import { isAddJobRoleEnabled } from '../utils/FeatureFlags';

export default function JobRoleController(
  app: Application,
  jobRoleService: JobRoleService,
) {
  app.get('/job-roles', async (req, res) => {
    try {
      // TODO: Add authorization middleware check when auth module is ready
      const jobRoles = await jobRoleService.getJobRoles();
      res.render('job-role-list', {
        jobRoles,
        canAddJobRole: isAddJobRoleEnabled(),
      });
    } catch (error) {
      console.error('Error fetching job roles:', error);
      res.status(500).render('error', {
        message: 'Unable to load job roles. Please try again later.',
      });
    }
  });

  app.get('/job-roles/add', (req, res) => {
    // TODO: Add authorization middleware check when auth module is ready
    // Should verify user is Admin (UserRole.Admin = 2)

    if (!isAddJobRoleEnabled()) {
      return res.status(403).render('error', {
        message: 'This feature is not currently available',
      });
    }

    res.render('add-role', {
      title: 'Add New Job Role',
    });
  });

  app.get('/job-roles/:id', async (req, res) => {
    try {
      // TODO: Add authorization middleware check when auth module is ready
      const jobRole = await jobRoleService.getJobRoleById(
        Number(req.params.id),
      );
      res.render('job-role-details', { jobRole });
    } catch (error) {
      console.error('Error fetching job role:', error);
      res.status(404).render('error', {
        message: 'Job role not found',
      });
    }
  });

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
