import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticateController } from '../../src/controllers/AuthenticateController';
import type { LoginService } from '../../src/services/LoginService';

vi.mock('../../src/services/LoginService');

describe('AuthenticateController', () => {
  let controller: AuthenticateController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockLoginService: LoginService;
  let cookieMock: ReturnType<typeof vi.fn>;
  let clearCookieMock: ReturnType<typeof vi.fn>;
  let redirectMock: ReturnType<typeof vi.fn>;
  let renderMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create mock LoginService
    mockLoginService = {
      login: vi.fn(),
    } as unknown as LoginService;

    controller = new AuthenticateController(mockLoginService);

    cookieMock = vi.fn();
    clearCookieMock = vi.fn();
    redirectMock = vi.fn();
    renderMock = vi.fn();
    statusMock = vi.fn();

    mockReq = {
      body: {},
    };

    mockRes = {
      cookie: cookieMock,
      clearCookie: clearCookieMock,
      redirect: redirectMock,
      render: renderMock,
      status: statusMock,
    } as unknown as Response;

    // Make status return the response object for chaining
    statusMock.mockReturnValue(mockRes);

    vi.clearAllMocks();
  });

  describe('renderLoginPage', () => {
    it('should render login page without error', async () => {
      mockReq.query = {};

      await controller.renderLoginPage(mockReq as Request, mockRes as Response);

      expect(renderMock).toHaveBeenCalledWith('login', {
        title: 'Sign In - Kainos Job Roles',
        error: undefined,
      });
    });

    it('should render login page with error from query params', async () => {
      mockReq.query = { error: 'Invalid Credentials' };

      await controller.renderLoginPage(mockReq as Request, mockRes as Response);

      expect(renderMock).toHaveBeenCalledWith('login', {
        title: 'Sign In - Kainos Job Roles',
        error: 'Invalid Credentials',
      });
    });
  });

  describe('performLogin', () => {
    it('should set cookie and redirect on successful login', async () => {
      const mockToken = 'mock.jwt.token';
      mockReq.body = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      vi.mocked(mockLoginService.login).mockResolvedValue(mockToken);

      await controller.performLogin(mockReq as Request, mockRes as Response);

      expect(mockLoginService.login).toHaveBeenCalledWith(
        'test@example.com',
        'Password123!',
      );

      expect(cookieMock).toHaveBeenCalledWith('token', mockToken, {
        httpOnly: true,
        secure: false,
        path: '/',
        sameSite: 'lax',
      });

      expect(redirectMock).toHaveBeenCalledWith('/job-roles');
    });

    it('should redirect to login with error on failed authentication', async () => {
      mockReq.body = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      vi.mocked(mockLoginService.login).mockRejectedValue(
        new Error('Unauthorized'),
      );

      await controller.performLogin(mockReq as Request, mockRes as Response);

      expect(redirectMock).toHaveBeenCalledWith(
        '/login?error=Invalid%20Credentials',
      );
      expect(cookieMock).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      vi.mocked(mockLoginService.login).mockRejectedValue(
        new Error('Network Error: ECONNREFUSED'),
      );

      await controller.performLogin(mockReq as Request, mockRes as Response);

      expect(redirectMock).toHaveBeenCalledWith(
        '/login?error=Invalid%20Credentials',
      );
    });

    it('should handle empty token response', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      vi.mocked(mockLoginService.login).mockResolvedValue('');

      await controller.performLogin(mockReq as Request, mockRes as Response);

      expect(redirectMock).toHaveBeenCalledWith(
        '/login?error=Invalid%20Credentials',
      );
      expect(cookieMock).not.toHaveBeenCalled();
    });
  });

  describe('performLogout', () => {
    it('should clear cookie and redirect to login', async () => {
      await controller.performLogout(mockReq as Request, mockRes as Response);

      expect(clearCookieMock).toHaveBeenCalledWith('token');
      expect(redirectMock).toHaveBeenCalledWith('/login');
    });
  });
});
