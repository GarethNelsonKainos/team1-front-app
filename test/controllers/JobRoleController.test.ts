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
      getJobRole: vi.fn(),
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
        status: 'Open',
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

  describe('GET /job-roles/:id', () => {
    it('should render job-role-information when fetching job role successfully', async () => {
      const mockJobRole: JobRole = {
        jobRoleId: 1,
        roleName: 'Software Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Band 4',
        closingDate: '2026-02-28',
        status: 'Open',
      };

      vi.mocked(mockJobRoleService.getJobRole).mockResolvedValue(mockJobRole);

      const response = await request(app).get('/job-roles/1');

      expect(response.status).toBe(200);
      expect(vi.mocked(mockJobRoleService.getJobRole)).toHaveBeenCalledWith(1);
      expect(response.body.view).toBe('job-role-information');
      expect(response.body.title).toBe('Software Engineer');
      expect(response.body.jobRole).toEqual(mockJobRole);
      expect(response.body.formattedClosingDate).toBeDefined();
    });

    it('should return 500 error when service fails', async () => {
      vi.mocked(mockJobRoleService.getJobRole).mockRejectedValue(
        new Error('Service error'),
      );

      const response = await request(app).get('/job-roles/1');

      expect(response.status).toBe(500);
      expect(vi.mocked(mockJobRoleService.getJobRole)).toHaveBeenCalledWith(1);
      expect(response.body.view).toBe('error');
      expect(response.body.message).toContain(
        'Unable to load job role details',
      );
    });
  });

  describe('GET /job-roles/:id/apply', () => {
    it('should render job-apply page when job role exists', async () => {
      const mockJobRole: JobRole = {
        jobRoleId: 1,
        roleName: 'Software Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Band 4',
        closingDate: '2026-02-28',
        status: 'Open',
      };

      vi.mocked(mockJobRoleService.getJobRole).mockResolvedValue(mockJobRole);

      const response = await request(app).get('/job-roles/1/apply');

      expect(response.status).toBe(200);
      expect(vi.mocked(mockJobRoleService.getJobRole)).toHaveBeenCalledWith(1);
    });

    it('should return 400 error for invalid job role ID', async () => {
      const response = await request(app).get('/job-roles/invalid/apply');

      expect(response.status).toBe(400);
      expect(vi.mocked(mockJobRoleService.getJobRole)).not.toHaveBeenCalled();
    });

    it('should return 500 error when service fails', async () => {
      vi.mocked(mockJobRoleService.getJobRole).mockRejectedValue(
        new Error('Service error'),
      );

      const response = await request(app).get('/job-roles/1/apply');

      expect(response.status).toBe(500);
      expect(vi.mocked(mockJobRoleService.getJobRole)).toHaveBeenCalledWith(1);
    });
  });
});
