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

  beforeEach(() => {
    app = express();
    app.set('view engine', 'njk');
    app.set('views', './views');

    mockJobRoleService = {
      getJobRoles: vi.fn(),
    } as unknown as JobRoleService;

    app.use((req, res, next) => {
      res.render = vi.fn((_view: string, _data: unknown) => {
        res.send('');
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
    expect(vi.mocked(mockJobRoleService.getJobRoles)).toHaveBeenCalled();
  });
});
