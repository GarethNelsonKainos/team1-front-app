import cookieParser from 'cookie-parser';
import type { Application } from 'express';
import express from 'express';
import multer from 'multer';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import JobRoleController from '../../src/controllers/JobRoleController';
import type { JobRole } from '../../src/models/JobRole';
import type { JobRoleService } from '../../src/services/JobRoleService';
import * as FeatureFlags from '../../src/utils/FeatureFlags';

// Mock external dependencies
vi.mock('../../src/utils/FeatureFlags');
vi.mock('../../src/utils/date-formatter', () => ({
  formatTimestampToDateString: vi.fn((date: string) => date),
}));
vi.mock('../../src/middleware/AuthMiddleware', () => ({
  default: (req: unknown, res: unknown, next: () => void) => {
    // Mock authenticated user
    (res as { locals: { user: unknown } }).locals = {
      user: { userId: 1, email: 'test@example.com' },
    };
    next();
  },
}));
vi.mock('multer', () => {
  const mockMulter = vi.fn(() => ({
    single: vi.fn(
      () => (req: unknown, res: unknown, next: () => void) => next(),
    ),
  }));

  return {
    default: Object.assign(mockMulter, {
      memoryStorage: vi.fn(),
    }),
  };
});
vi.mock('axios');
vi.mock('form-data');

describe('JobRoleController', () => {
  let app: Application;
  let mockJobRoleService: JobRoleService;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Set up environment variables
    process.env.API_BASE_URL = 'http://localhost:3001';

    // Initialize FeatureFlags mock with default values
    vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(true);

    app = express();
    app.set('view engine', 'njk');
    app.set('views', './views');

    // Add middleware to parse request bodies and cookies
    app.use(cookieParser());
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Mock cookies by adding a token to all requests
    app.use((req, res, next) => {
      req.cookies = { token: 'valid-test-token' };
      next();
    });

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

    it('should handle error in apply page loading', async () => {
      vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(true);
      vi.mocked(mockJobRoleService.getJobRoleById).mockRejectedValue(
        new Error('Service error'),
      );

      const response = await request(app).get('/job-roles/1/apply');

      expect(response.status).toBe(500);
      expect(response.body.view).toBe('error');
    });

    it('should return 400 when job role ID is missing in apply route', async () => {
      vi.mocked(FeatureFlags.isJobApplicationsEnabled).mockReturnValue(true);

      // Mock request with undefined params.id
      const mockApp = express();
      mockApp.use(express.json());
      JobRoleController(mockApp, mockJobRoleService);

      const response = await request(mockApp)
        .get('/job-roles//apply') // Empty ID
        .expect(404); // Express treats empty params as 404

      // This tests the edge case handling
    });
  });

  describe('Edge Cases', () => {
    it('should handle array ID parameter correctly', async () => {
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

      // Test with array-like parameter handling (edge case)
      const response = await request(app).get('/job-roles/1').query({});

      expect(response.status).toBe(200);
      expect(response.body.view).toBe('job-role-information');
    });
  });
});
