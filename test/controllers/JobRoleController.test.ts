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

  const mockJobRoles: JobRole[] = [
    {
      roleId: 1,
      roleName: 'Software Engineer',
      capability: 'Engineering',
      band: 'Associate',
      description: 'Test role',
      responsibilities: 'Test responsibilities',
      jobSpecLink: 'https://kainossoftwareltd.sharepoint.com/test',
      openPositions: 5,
      status: 'open',
      closingDate: '2026-12-31',
      locations: ['Belfast', 'London'],
    },
  ];

  beforeEach(() => {
    // Mock feature flags
    vi.mocked(FeatureFlags.isAddJobRoleEnabled).mockReturnValue(true);

    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    mockJobRoleService = {
      getJobRoles: vi.fn().mockResolvedValue(mockJobRoles),
      getJobRoleById: vi.fn().mockResolvedValue(mockJobRoles[0]),
      createJobRole: vi.fn(),
      getBands: vi.fn(),
      getCapabilities: vi.fn(),
      getLocations: vi.fn(),
    } as unknown as JobRoleService;

    // Mock the view engine and render method BEFORE setting up routes
    app.engine('njk', (_, options, callback) => {
      callback(null, JSON.stringify(options));
    });
    app.set('view engine', 'njk');
    app.set('views', './views');

    // Add middleware to intercept render calls
    app.use((req, res, next) => {
      res.render = (view: string, options?: Record<string, unknown>) => {
        const statusCode = res.statusCode || 200;
        return res.status(statusCode).json({
          view,
          ...options,
        });
      };
      next();
    });

    JobRoleController(app, mockJobRoleService);
  });

  it('should render job-role-list when fetching job roles successfully', async () => {
    const response = await request(app).get('/job-roles');

    expect(response.status).toBe(200);
    expect(vi.mocked(mockJobRoleService.getJobRoles)).toHaveBeenCalled();
    expect(response.body.view).toBe('job-role-list');
    expect(response.body.jobRoles).toEqual(mockJobRoles);
  });

  it('should render error page when fetching job roles fails', async () => {
    vi.mocked(mockJobRoleService.getJobRoles).mockRejectedValueOnce(
      new Error('Database error'),
    );

    const response = await request(app).get('/job-roles');

    expect(response.status).toBe(500);
    expect(response.body.view).toBe('error');
    expect(response.body.message).toBe(
      'Unable to load job roles. Please try again later.',
    );
  });

  it('should render job-role-details when fetching a specific job role', async () => {
    const response = await request(app).get('/job-roles/1');

    expect(response.status).toBe(200);
    expect(vi.mocked(mockJobRoleService.getJobRoleById)).toHaveBeenCalledWith(
      1,
    );
    expect(response.body.view).toBe('job-role-details');
    expect(response.body.jobRole).toEqual(mockJobRoles[0]);
  });

  it('should render error page when job role is not found', async () => {
    vi.mocked(mockJobRoleService.getJobRoleById).mockRejectedValueOnce(
      new Error('Not found'),
    );

    const response = await request(app).get('/job-roles/999');

    expect(response.status).toBe(404);
    expect(response.body.view).toBe('error');
    expect(response.body.message).toBe('Job role not found');
  });

  it('should render add job role page when feature is enabled', async () => {
    const response = await request(app).get('/job-roles/add');

    expect(response.status).toBe(200);
    expect(response.body.view).toBe('add-role');
    expect(response.body.title).toBe('Add New Job Role');
  });

  it('should return 403 when add job role feature is disabled', async () => {
    vi.mocked(FeatureFlags.isAddJobRoleEnabled).mockReturnValue(false);

    // Create new app instance with disabled feature
    const testApp = express();
    testApp.use(express.json());

    testApp.engine('njk', (_, options, callback) => {
      callback(null, JSON.stringify(options));
    });
    testApp.set('view engine', 'njk');
    testApp.set('views', './views');

    testApp.use((req, res, next) => {
      res.render = (view: string, options?: Record<string, unknown>) => {
        const statusCode = res.statusCode || 200;
        return res.status(statusCode).json({ view, ...options });
      };
      next();
    });

    JobRoleController(testApp, mockJobRoleService);

    const response = await request(testApp).get('/job-roles/add');

    expect(response.status).toBe(403);
    expect(response.body.view).toBe('error');
    expect(response.body.message).toBe(
      'This feature is not currently available',
    );
  });
});
