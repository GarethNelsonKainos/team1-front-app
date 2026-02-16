import type { Application } from 'express';
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import JobRoleController from '../../src/controllers/JobRoleController';
import type { JobRole } from '../../src/models/JobRole';
import type { JobRoleService } from '../../src/services/JobRoleService';
import * as FeatureFlags from '../../src/utils/FeatureFlags';

vi.mock('../../src/utils/FeatureFlags');

describe('JobRoleController', () => {
  let app: Application;
  let mockJobRoleService: JobRoleService;

  beforeEach(() => {
    app = express();
    app.set('view engine', 'njk');
    app.set('views', './views');

    mockJobRoleService = {
      getJobRoles: vi.fn(),
      getJobRoleById: vi.fn(),
    } as unknown as JobRoleService;

    app.use((req, res, next) => {
      res.render = vi.fn((_view: string, _data: unknown) => {
        res.send({ view: _view, ...(_data as object) });
      });
      next();
    });

    JobRoleController(app, mockJobRoleService);
  });

  it('should render job-role-list when fetching job roles successfully', async () => {
    const mockJobRoles: JobRole[] = [
      {
        jobRoleId: 1,
        roleName: 'Software Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Band 4',
        closingDate: '2026-02-28',
      },
    ];

    vi.mocked(mockJobRoleService.getJobRoles).mockResolvedValue(mockJobRoles);

    const response = await request(app).get('/job-roles');

    expect(response.status).toBe(200);
    expect(vi.mocked(mockJobRoleService.getJobRoles)).toHaveBeenCalled();
  });

  it('should return 500 error when service fails', async () => {
    vi.mocked(mockJobRoleService.getJobRoles).mockRejectedValue(
      new Error('Service error'),
    );

    const response = await request(app).get('/job-roles');

    expect(response.status).toBe(500);
  });

  it('should render job-role-information when fetching a job role by id successfully', async () => {
    const mockJobRole: JobRole = {
      jobRoleId: 2,
      roleName: 'Test Engineer',
      location: 'San Francisco',
      capability: 'Quality Assurance',
      band: 'Intermediate',
      closingDate: '2026-04-01T00:00:00.000Z',
    };

    vi.mocked(mockJobRoleService.getJobRoleById).mockResolvedValue(mockJobRole);

    const response = await request(app).get('/job-roles/2');

    expect(response.status).toBe(200);
    expect(response.body.view).toBe('job-role-information');
    expect(response.body.jobRole.roleName).toBe('Test Engineer');
  });

  it('should return 500 error when fetching job role by id fails', async () => {
    vi.mocked(mockJobRoleService.getJobRoleById).mockRejectedValue(
      new Error('Service error'),
    );

    const response = await request(app).get('/job-roles/2');

    expect(response.status).toBe(500);
    expect(response.body.view).toBe('error');
  });

  // Test for apply functionality
  it('should render job-apply page when accessing apply route', async () => {
    // Mock feature flag as enabled
    vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(true);

    const mockJobRole: JobRole = {
      jobRoleId: 1,
      roleName: 'Software Engineer',
      location: 'London',
      capability: 'Engineering',
      band: 'Band 4',
      closingDate: '2026-02-28',
    };

    vi.mocked(mockJobRoleService.getJobRoleById).mockResolvedValue(mockJobRole);

    const response = await request(app).get('/job-roles/1/apply');

    expect(response.status).toBe(200);
    expect(response.body.view).toBe('job-apply');
    expect(response.body.roleName).toBe('Software Engineer');
  });

  // Feature flag tests
  describe('Feature Flag: Job Applications', () => {
    it('should include feature flag in job detail page response', async () => {
      vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(true);

      const mockJobRole: JobRole = {
        jobRoleId: 1,
        roleName: 'Software Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Band 4',
        closingDate: '2026-02-28',
      };

      vi.mocked(mockJobRoleService.getJobRoleById).mockResolvedValue(
        mockJobRole,
      );

      const response = await request(app).get('/job-roles/1');

      expect(response.status).toBe(200);
      expect(response.body.isJobApplicationsEnabled).toBe(true);
      expect(
        vi.mocked(FeatureFlags.isJobApplicationsEnabled),
      ).toHaveBeenCalled();
    });

    it('should block apply route when feature is disabled', async () => {
      vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(false);

      const response = await request(app).get('/job-roles/1/apply');

      expect(response.status).toBe(404);
      expect(response.body.view).toBe('error');
      expect(response.body.message).toContain(
        'Job applications are currently not available',
      );
      expect(
        vi.mocked(mockJobRoleService.getJobRoleById),
      ).not.toHaveBeenCalled();
    });

    it('should block POST apply route when feature is disabled', async () => {
      vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(false);

      const response = await request(app).post('/job-roles/1/apply');

      expect(response.status).toBe(404);
      expect(response.body.view).toBe('error');
      expect(response.body.message).toContain(
        'Job applications are currently not available',
      );
    });

    it('should allow apply route when feature is enabled', async () => {
      vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(true);

      const mockJobRole: JobRole = {
        jobRoleId: 1,
        roleName: 'Software Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Band 4',
        closingDate: '2026-02-28',
      };

      vi.mocked(mockJobRoleService.getJobRoleById).mockResolvedValue(
        mockJobRole,
      );

      const response = await request(app).get('/job-roles/1/apply');

      expect(response.status).toBe(200);
      expect(response.body.view).toBe('job-apply');
    });

    it('should redirect to success page on POST when feature is enabled', async () => {
      vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(true);

      const response = await request(app).post('/job-roles/1/apply');

      expect(response.status).toBe(302); // Redirect status
      expect(response.headers.location).toBe('/application-success');
    });

    it('should handle error in apply page loading', async () => {
      vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(true);
      vi.mocked(mockJobRoleService.getJobRoleById).mockRejectedValue(
        new Error('Service error'),
      );

      const response = await request(app).get('/job-roles/1/apply');

      expect(response.status).toBe(500);
      expect(response.body.view).toBe('error');
    });

    it('should handle error in POST apply route', async () => {
      vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockImplementation(
        () => {
          throw new Error('Feature flag error');
        },
      );

      const response = await request(app).post('/job-roles/1/apply');

      expect(response.status).toBe(500);
      expect(response.body.view).toBe('error');
    });
  });
});
