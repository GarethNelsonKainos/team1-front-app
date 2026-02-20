import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authenticateJWT from '../../src/middleware/AuthMiddleware';

vi.mock('jsonwebtoken');
vi.mock('axios');

describe('AuthMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;
  let redirectMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;
  let renderMock: ReturnType<typeof vi.fn>;
  let clearCookieMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset axios defaults
    if (axios.defaults.headers.common) {
      axios.defaults.headers.common.Authorization = undefined;
    }

    // Set up environment variable for JWT secret
    process.env.JWT_SECRET = 'test-secret-key';

    redirectMock = vi.fn();
    statusMock = vi.fn();
    renderMock = vi.fn();
    clearCookieMock = vi.fn();
    mockNext = vi.fn();

    // Make statusMock return an object with render method for chaining
    statusMock.mockReturnValue({ render: renderMock });

    mockRes = {
      redirect: redirectMock,
      status: statusMock,
      render: renderMock,
      clearCookie: clearCookieMock,
      locals: {},
    } as unknown as Response;

    mockReq = {
      cookies: {},
    };

    vi.clearAllMocks();
  });

  it('should call next() with valid token and set user in res.locals', () => {
    const mockToken = 'valid.jwt.token';
    const mockDecoded = {
      userId: 1,
      email: 'test@example.com',
      userRole: 1,
      firstName: 'Test',
      lastName: 'User',
    };

    mockReq.cookies = { token: mockToken };
    vi.mocked(jwt.verify).mockReturnValue(mockDecoded as never);

    authenticateJWT(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction,
    );

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret-key');
    expect(mockRes.locals?.user).toEqual(mockDecoded);
    expect(axios.defaults.headers.common?.Authorization).toBe(
      `Bearer ${mockToken}`,
    );
    expect(mockNext).toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should redirect to /login when no token is provided', () => {
    mockReq.cookies = {};

    authenticateJWT(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction,
    );

    expect(redirectMock).toHaveBeenCalledWith('/login');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should redirect to /login when token cookie is undefined', () => {
    mockReq.cookies = { token: undefined };

    authenticateJWT(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction,
    );

    expect(redirectMock).toHaveBeenCalledWith('/login');
    expect(mockNext).not.toHaveBeenCalled();
  });
  it('should return 500 error when JWT_SECRET is not configured', () => {
    const originalJwtSecret = process.env.JWT_SECRET;
    // @ts-ignore - Setting to empty string to simulate missing env var
    process.env.JWT_SECRET = '';

    mockReq.cookies = { token: 'some-token' };

    statusMock.mockReturnValue({ render: renderMock });

    authenticateJWT(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction,
    );

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(renderMock).toHaveBeenCalledWith('error', {
      error: 'Internal server error',
    });
    expect(axios.defaults.headers.common?.Authorization).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();

    // Restore original value
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it('should redirect to login when token verification fails', () => {
    const mockToken = 'invalid.jwt.token';
    mockReq.cookies = { token: mockToken };

    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authenticateJWT(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction,
    );

    expect(clearCookieMock).toHaveBeenCalledWith('token');
    expect(redirectMock).toHaveBeenCalledWith('/login');
    expect(axios.defaults.headers.common?.Authorization).toBeUndefined();
    expect(mockNext).not.toHaveBeenCalled();
  });
});
