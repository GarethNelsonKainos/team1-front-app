import axios from 'axios';
import type { Application, NextFunction, Request, Response } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import JobRoleController from '../../src/controllers/JobRoleController';
import { JobRoleStatus } from '../../src/models/JobRole';
import { UserRole } from '../../src/models/UserRole';
import type { JobRoleService } from '../../src/services/JobRoleService';
import * as FeatureFlags from '../../src/utils/FeatureFlags';

vi.mock('axios');
vi.mock('../../src/services/JobRoleService');
vi.mock('../../src/middleware/AuthMiddleware', () => ({
  default: (_req: Request, _res: Response, next: NextFunction) => next(),
}));

describe('JobRoleController', () => {
  let app: Application;
  let routes: Record<string, (req: Request, res: Response) => void>;
  let mockJobRoleService: JobRoleService;

  beforeEach(() => {
    routes = {};

    app = {
      get: vi.fn(
        (
          path: string,
          ...handlers: ((req: Request, res: Response) => void)[]
        ) => {
          routes[`GET:${path}`] = handlers[handlers.length - 1];
        },
      ),
      post: vi.fn(
        (
          path: string,
          ...handlers: ((req: Request, res: Response) => void)[]
        ) => {
          routes[`POST:${path}`] = handlers[handlers.length - 1];
        },
      ),
    } as unknown as Application;

    mockJobRoleService = {
      getJobRoles: vi.fn(),
      getJobRoleById: vi.fn(),
      createJobRole: vi.fn(),
      getBands: vi.fn(),
      getCapabilities: vi.fn(),
      getLocations: vi.fn(),
    } as unknown as JobRoleService;

    vi.spyOn(FeatureFlags, 'isJobApplicationsEnabled').mockReturnValue(true);
    vi.spyOn(FeatureFlags, 'isAddJobRoleEnabled').mockReturnValue(true);

    JobRoleController(app, mockJobRoleService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (overrides: Partial<Request> = {}): Request =>
    ({
      params: {},
      body: {},
      cookies: { token: 'test-token' },
      file: undefined,
      ...overrides,
    }) as Request;

  const createMockResponse = (userRole = UserRole.ADMIN): Response => {
    const res = {
      render: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      redirect: vi.fn(),
      locals: { user: { userId: 1, userRole } },
    };
    return res as unknown as Response;
  };

  describe('GET /job-roles', () => {
    it('should render job roles list', async () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();

      const mockJobRoles = [
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

      await routes['GET:/job-roles'](mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith('job-role-list', {
        title: 'Available Job Roles',
        jobRoles: [
          {
            ...mockJobRoles[0],
            closingDate: '28/02/2026',
          },
        ],
        user: mockRes.locals.user,
        UserRole: UserRole,
      });
    });

    it('should handle errors', async () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();

      vi.mocked(mockJobRoleService.getJobRoles).mockRejectedValue(
        new Error('DB error'),
      );

      await routes['GET:/job-roles'](mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.render).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          message: expect.stringContaining('Unable to load job roles'),
        }),
      );
    });
  });

  describe('GET /job-roles/:id', () => {
    it('should show apply button for authenticated user with open position', async () => {
      const mockReq = createMockRequest({ params: { id: '1' } });
      const mockRes = createMockResponse();

      vi.mocked(mockJobRoleService.getJobRoleById).mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Band 4',
        closingDate: '2026-02-28T00:00:00.000Z',
        status: JobRoleStatus.Open,
        openPositions: 5,
      });

      await routes['GET:/job-roles/:id'](mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith(
        'job-role-information',
        expect.objectContaining({
          jobStatusMessage: expect.stringContaining('Apply Now'),
        }),
      );
    });

    it('should show sign in message for unauthenticated user', async () => {
      const mockReq = createMockRequest({ params: { id: '1' } });
      const mockRes = createMockResponse();
      mockRes.locals = {};

      vi.mocked(mockJobRoleService.getJobRoleById).mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Engineer',
        location: 'Belfast',
        capability: 'Data',
        band: 'Band 3',
        closingDate: '2026-02-28',
        status: JobRoleStatus.Open,
        openPositions: 5,
      });

      await routes['GET:/job-roles/:id'](mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith(
        'job-role-information',
        expect.objectContaining({
          jobStatusMessage: expect.stringContaining('Sign in'),
        }),
      );
    });

    it('should show unavailable when applications disabled', async () => {
      vi.spyOn(FeatureFlags, 'isJobApplicationsEnabled').mockReturnValue(false);

      const mockReq = createMockRequest({ params: { id: '1' } });
      const mockRes = createMockResponse();

      vi.mocked(mockJobRoleService.getJobRoleById).mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Band 4',
        closingDate: '2026-02-28',
        status: JobRoleStatus.Open,
        openPositions: 5,
      });

      await routes['GET:/job-roles/:id'](mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith(
        'job-role-information',
        expect.objectContaining({
          jobStatusMessage: 'Job applications are currently unavailable',
        }),
      );
    });

    it('should show unavailable when position closed', async () => {
      const mockReq = createMockRequest({ params: { id: '1' } });
      const mockRes = createMockResponse();

      vi.mocked(mockJobRoleService.getJobRoleById).mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Band 4',
        closingDate: '2026-02-28',
        status: JobRoleStatus.Closed,
        openPositions: 0,
      });

      await routes['GET:/job-roles/:id'](mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith(
        'job-role-information',
        expect.objectContaining({
          jobStatusMessage: 'This position is no longer available',
        }),
      );
    });

    it('should show unavailable when applications disabled', async () => {
      vi.spyOn(FeatureFlags, 'isJobApplicationsEnabled').mockReturnValue(false);

      const mockReq = createMockRequest({ params: { id: '1' } });
      const mockRes = createMockResponse();

      vi.mocked(mockJobRoleService.getJobRoleById).mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Band 4',
        closingDate: '2026-02-28',
        status: JobRoleStatus.Open,
        openPositions: 5,
      });

      await routes['GET:/job-roles/:id'](mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith(
        'job-role-information',
        expect.objectContaining({
          jobStatusMessage: 'Job applications are currently unavailable',
        }),
      );
    });

    it('should show unavailable when position closed', async () => {
      const mockReq = createMockRequest({ params: { id: '1' } });
      const mockRes = createMockResponse();

      vi.mocked(mockJobRoleService.getJobRoleById).mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Engineer',
        closingDate: '2026-02-28',
        status: JobRoleStatus.Closed,
        openPositions: 0,
      });

      await routes['GET:/job-roles/:id'](mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith(
        'job-role-information',
        expect.objectContaining({
          jobStatusMessage: 'This position is no longer available',
        }),
      );
    });

    it('should handle errors', async () => {
      const mockReq = createMockRequest({ params: { id: '1' } });
      const mockRes = createMockResponse();

      vi.mocked(mockJobRoleService.getJobRoleById).mockRejectedValue(
        new Error('Error'),
      );

      await routes['GET:/job-roles/:id'](mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('GET /job-roles/:id/apply', () => {
    it('should render apply page when enabled', async () => {
      const mockReq = createMockRequest({ params: { id: '1' } });
      const mockRes = createMockResponse();

      vi.mocked(mockJobRoleService.getJobRoleById).mockResolvedValue({
        jobRoleId: 1,
        roleName: 'Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Band 4',
        closingDate: '2026-02-28',
        status: JobRoleStatus.Open,
        openPositions: 5,
      });

      await routes['GET:/job-roles/:id/apply'](mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith(
        'job-apply',
        expect.objectContaining({
          jobRoleId: 1,
          roleName: 'Engineer',
        }),
      );
    });

    it('should return 404 when feature disabled', async () => {
      vi.spyOn(FeatureFlags, 'isJobApplicationsEnabled').mockReturnValue(false);

      const mockReq = createMockRequest({ params: { id: '1' } });
      const mockRes = createMockResponse();

      await routes['GET:/job-roles/:id/apply'](mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should handle errors', async () => {
      const mockReq = createMockRequest({ params: { id: '1' } });
      const mockRes = createMockResponse();

      vi.mocked(mockJobRoleService.getJobRoleById).mockRejectedValue(
        new Error('Error'),
      );

      await routes['GET:/job-roles/:id/apply'](mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('POST /application/:id/apply', () => {
    it('should return 404 when feature disabled', async () => {
      vi.spyOn(FeatureFlags, 'isJobApplicationsEnabled').mockReturnValue(false);

      const mockReq = createMockRequest({ params: { id: '1' } });
      const mockRes = createMockResponse();

      await routes['POST:/application/:id/apply'](mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 when no CV uploaded', async () => {
      const mockReq = createMockRequest({
        params: { id: '1' },
        file: undefined,
      });
      const mockRes = createMockResponse();

      await routes['POST:/application/:id/apply'](mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.render).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          message: expect.stringContaining('CV'),
        }),
      );
    });

    it('should redirect to login when no token', async () => {
      const mockReq = createMockRequest({
        params: { id: '1' },
        cookies: {},
        file: {
          buffer: Buffer.from('pdf'),
          originalname: 'cv.pdf',
          mimetype: 'application/pdf',
        } as Express.Multer.File,
      });
      const mockRes = createMockResponse();

      await routes['POST:/application/:id/apply'](mockReq, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith('/login');
    });

    it('should redirect to success on successful submission', async () => {
      const mockReq = createMockRequest({
        params: { id: '1' },
        file: {
          buffer: Buffer.from('pdf'),
          originalname: 'cv.pdf',
          mimetype: 'application/pdf',
        } as Express.Multer.File,
      });
      const mockRes = createMockResponse();

      vi.mocked(axios.post).mockResolvedValue({ data: {} });

      await routes['POST:/application/:id/apply'](mockReq, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith('/application-success');
    });

    it('should handle axios errors', async () => {
      const mockReq = createMockRequest({
        params: { id: '1' },
        file: {
          buffer: Buffer.from('pdf'),
          originalname: 'cv.pdf',
          mimetype: 'application/pdf',
        } as Express.Multer.File,
      });
      const mockRes = createMockResponse();

      const axiosError = {
        isAxiosError: true,
        response: { data: { error: 'Custom error' } },
      };
      vi.mocked(axios.post).mockRejectedValue(axiosError);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      await routes['POST:/application/:id/apply'](mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.render).toHaveBeenCalledWith(
        'error',
        expect.objectContaining({
          message: 'Custom error',
        }),
      );
    });

    it('should handle generic errors', async () => {
      const mockReq = createMockRequest({
        params: { id: '1' },
        file: {
          buffer: Buffer.from('pdf'),
          originalname: 'cv.pdf',
          mimetype: 'application/pdf',
        } as Express.Multer.File,
      });
      const mockRes = createMockResponse();

      vi.mocked(axios.post).mockRejectedValue(new Error('Generic error'));
      vi.mocked(axios.isAxiosError).mockReturnValue(false);

      await routes['POST:/application/:id/apply'](mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('GET /add-role', () => {
    it('should render form for admin users', async () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse(2);

      vi.mocked(mockJobRoleService.getBands).mockResolvedValue([
        { bandId: 1, bandName: 'Band 1' },
      ]);
      vi.mocked(mockJobRoleService.getCapabilities).mockResolvedValue([
        { capabilityId: 1, capabilityName: 'Eng' },
      ]);
      vi.mocked(mockJobRoleService.getLocations).mockResolvedValue([
        {
          locationId: 1,
          locationName: 'London',
          city: 'London',
          country: 'UK',
        },
      ]);

      await routes['GET:/add-role'](mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith(
        'add-role',
        expect.objectContaining({
          bands: expect.any(Array),
          capabilities: expect.any(Array),
          locations: expect.any(Array),
        }),
      );
    });

    it('should return 404 when feature disabled', async () => {
      vi.spyOn(FeatureFlags, 'isAddJobRoleEnabled').mockReturnValue(false);

      const mockReq = createMockRequest();
      const mockRes = createMockResponse();

      await routes['GET:/add-role'](mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 for non-admin users', async () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse(1);

      await routes['GET:/add-role'](mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('should handle errors', async () => {
      const mockReq = createMockRequest();
      const mockRes = createMockResponse();

      vi.mocked(mockJobRoleService.getBands).mockRejectedValue(
        new Error('DB error'),
      );

      await routes['GET:/add-role'](mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('POST /add-role', () => {
    it('should create job role and redirect', async () => {
      const mockReq = createMockRequest({ body: { roleName: 'Test' } });
      const mockRes = createMockResponse();

      vi.mocked(mockJobRoleService.createJobRole).mockResolvedValue({});

      await routes['POST:/add-role'](mockReq, mockRes);

      expect(mockRes.redirect).toHaveBeenCalledWith('/job-roles');
    });

    it('should return 404 when feature disabled', async () => {
      vi.spyOn(FeatureFlags, 'isAddJobRoleEnabled').mockReturnValue(false);

      const mockReq = createMockRequest({ body: { roleName: 'Test' } });
      const mockRes = createMockResponse();

      await routes['POST:/add-role'](mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 403 for non-admin users', async () => {
      const mockReq = createMockRequest({ body: { roleName: 'Test' } });
      const mockRes = createMockResponse(1);

      await routes['POST:/add-role'](mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('should handle duplicate role name', async () => {
      const mockReq = createMockRequest({ body: { roleName: 'Duplicate' } });
      const mockRes = createMockResponse();

      const axiosError = { isAxiosError: true, response: { status: 409 } };
      vi.mocked(mockJobRoleService.createJobRole).mockRejectedValue(axiosError);
      vi.mocked(mockJobRoleService.getBands).mockResolvedValue([]);
      vi.mocked(mockJobRoleService.getCapabilities).mockResolvedValue([]);
      vi.mocked(mockJobRoleService.getLocations).mockResolvedValue([]);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      await routes['POST:/add-role'](mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith(
        'add-role',
        expect.objectContaining({
          error: expect.stringContaining('already exists'),
        }),
      );
    });

    it('should handle axios errors with custom message', async () => {
      const mockReq = createMockRequest({ body: { roleName: 'Test' } });
      const mockRes = createMockResponse();

      const axiosError = {
        isAxiosError: true,
        response: { data: { error: 'Custom' } },
      };
      vi.mocked(mockJobRoleService.createJobRole).mockRejectedValue(axiosError);
      vi.mocked(mockJobRoleService.getBands).mockResolvedValue([]);
      vi.mocked(mockJobRoleService.getCapabilities).mockResolvedValue([]);
      vi.mocked(mockJobRoleService.getLocations).mockResolvedValue([]);
      vi.mocked(axios.isAxiosError).mockReturnValue(true);

      await routes['POST:/add-role'](mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith(
        'add-role',
        expect.objectContaining({
          error: 'Custom',
        }),
      );
    });

    it('should handle generic errors', async () => {
      const mockReq = createMockRequest({ body: { roleName: 'Test' } });
      const mockRes = createMockResponse();

      vi.mocked(mockJobRoleService.createJobRole).mockRejectedValue(
        new Error('Error'),
      );
      vi.mocked(mockJobRoleService.getBands).mockResolvedValue([]);
      vi.mocked(mockJobRoleService.getCapabilities).mockResolvedValue([]);
      vi.mocked(mockJobRoleService.getLocations).mockResolvedValue([]);
      vi.mocked(axios.isAxiosError).mockReturnValue(false);

      await routes['POST:/add-role'](mockReq, mockRes);

      expect(mockRes.render).toHaveBeenCalledWith(
        'add-role',
        expect.objectContaining({
          error: expect.stringContaining('Failed to create'),
        }),
      );
    });
  });
});
