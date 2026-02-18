import axios from 'axios';
import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthenticateController } from '../../src/controllers/AuthenticateController';

vi.mock('axios');

describe('AuthenticateController', () => {
  let controller: AuthenticateController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let cookieMock: ReturnType<typeof vi.fn>;
  let clearCookieMock: ReturnType<typeof vi.fn>;
  let redirectMock: ReturnType<typeof vi.fn>;
  let renderMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    controller = new AuthenticateController();

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

  describe('renderLogin', () => {
    it('should set cookie and redirect on successful login', async () => {
      const mockToken = 'mock.jwt.token';
      mockReq.body = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      vi.mocked(axios.post).mockResolvedValue({
        data: { token: mockToken },
      });

      await controller.renderLogin(mockReq as Request, mockRes as Response);

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        {
          email: 'test@example.com',
          password: 'Password123!',
        },
      );

      expect(cookieMock).toHaveBeenCalledWith('token', mockToken, {
        httpOnly: true,
        secure: false,
        path: '/',
        sameSite: 'lax',
      });

      expect(redirectMock).toHaveBeenCalledWith('/job-roles');
    });

    it('should render login page with error on failed authentication', async () => {
      mockReq.body = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      vi.mocked(axios.post).mockRejectedValue(new Error('Unauthorized'));

      await controller.renderLogin(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(renderMock).toHaveBeenCalledWith('login', {
        title: 'Sign In - Kainos Job Roles',
        error: 'Invalid Credentials',
      });

      expect(cookieMock).not.toHaveBeenCalled();
      expect(redirectMock).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      mockReq.body = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      vi.mocked(axios.post).mockRejectedValue(
        new Error('Network Error: ECONNREFUSED'),
      );

      await controller.renderLogin(mockReq as Request, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(renderMock).toHaveBeenCalledWith('login', {
        title: 'Sign In - Kainos Job Roles',
        error: 'Invalid Credentials',
      });
    });
  });

  describe('renderLogout', () => {
    it('should clear cookie and redirect to login', async () => {
      await controller.renderLogout(mockReq as Request, mockRes as Response);

      expect(clearCookieMock).toHaveBeenCalledWith('token');
      expect(redirectMock).toHaveBeenCalledWith('/login');
    });
  });
});
