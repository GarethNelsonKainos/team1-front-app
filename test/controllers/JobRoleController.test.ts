import type { Application } from 'express';
import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import JobRoleController from '../../src/controllers/JobRoleController';
import type { JobRole } from '../../src/models/JobRole';
import type { JobRoleService } from '../../src/services/JobRoleService';

describe('JobRoleController', () => {
  let app: Application;
  let mockJobRoleService: JobRoleService;
  let renderSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    app = express();
    app.set('view engine', 'njk');
    app.set('views', './views');

    mockJobRoleService = {
      getJobRoles: vi.fn(),
      getJobRoleById: vi.fn(),
    } as unknown as JobRoleService;

    // Spy on res.render to capture view and data
    app.use((req, res, next) => {
      // @ts-ignore
      renderSpy = vi.fn((_view: string, _data: unknown) => {
        res.send({ view: _view, ...(_data as object) });
      });
      res.render = renderSpy;
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
    expect(vi.mocked(mockJobRoleService.getJobRoles)).toHaveBeenCalled();
  });

  // --- New tests for /job-roles/:id ---

  it('should render job-role-information when fetching a job role by id successfully', async () => {
    const mockJobRole: JobRole = {
      jobRoleId: 2,
      roleName: 'Test Engineer',
      location: 'San Francisco',
      capability: 'Quality Assurance',
      band: 'Intermediate',
      closingDate: '2026-04-01T00:00:00.000Z',
      description: 'Ensures the quality of software products.',
      responsibilities: 'Test applications, report bugs, write test cases.',
      sharepointUrl: 'https://company.sharepoint.com/test-engineer',
      numberOfOpenPositions: 2,
    };

    vi.mocked(mockJobRoleService.getJobRoleById).mockResolvedValue(mockJobRole);

    const response = await request(app).get('/job-roles/2');

    expect(response.status).toBe(200);
    expect(vi.mocked(mockJobRoleService.getJobRoleById)).toHaveBeenCalledWith(
      '2',
    );
    expect(response.body.view).toBe('job-role-information');
    expect(response.body.jobRole.roleName).toBe('Test Engineer');
    expect(response.body.formattedClosingDate).toBeDefined();
  });

  it('should return 500 error when fetching a job role by id fails', async () => {
    vi.mocked(mockJobRoleService.getJobRoleById).mockRejectedValue(
      new Error('Service error'),
    );

    const response = await request(app).get('/job-roles/2');

    expect(response.status).toBe(500);
    expect(vi.mocked(mockJobRoleService.getJobRoleById)).toHaveBeenCalledWith(
      '2',
    );
    expect(response.body.view).toBe('error');
    expect(response.body.message).toContain(
      'Unable to load job role information',
    );
  });
});
