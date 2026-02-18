import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authenticateJWT from '../../src/Middleware/AuthMiddleware';

vi.mock('jsonwebtoken');

describe('AuthMiddleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;
  let redirectMock: ReturnType<typeof vi.fn>;
  let clearCookieMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;
  let sendMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    redirectMock = vi.fn();
    clearCookieMock = vi.fn();
    sendMock = vi.fn();
    mockNext = vi.fn();

    // statusMock needs to return the mockRes object for method chaining
    statusMock = vi.fn().mockReturnThis();

    mockRes = {
      redirect: redirectMock,
      clearCookie: clearCookieMock,
      status: statusMock,
      send: sendMock,
      locals: {},
    } as unknown as Response;

    mockReq = {
      cookies: {},
    };

    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
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

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, 'test-secret');
    expect(mockRes.locals?.user).toEqual(mockDecoded);
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

  it('should redirect to /login when token is invalid', () => {
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
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should redirect to /login when token is expired', () => {
    const mockToken = 'expired.jwt.token';
    mockReq.cookies = { token: mockToken };

    const error = new Error('jwt expired');
    error.name = 'TokenExpiredError';
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw error;
    });

    authenticateJWT(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction,
    );

    expect(clearCookieMock).toHaveBeenCalledWith('token');
    expect(redirectMock).toHaveBeenCalledWith('/login');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle malformed token gracefully', () => {
    const mockToken = 'malformed-token-format';
    mockReq.cookies = { token: mockToken };

    const error = new Error('jwt malformed');
    error.name = 'JsonWebTokenError';
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw error;
    });

    authenticateJWT(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction,
    );

    expect(clearCookieMock).toHaveBeenCalledWith('token');
    expect(redirectMock).toHaveBeenCalledWith('/login');
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 500 error when JWT_SECRET is not configured', () => {
    const originalJwtSecret = process.env.JWT_SECRET;
    // @ts-ignore - Setting to empty string to simulate missing env var (satisfies linter)
    process.env.JWT_SECRET = '';

    mockReq.cookies = { token: 'some-token' };

    authenticateJWT(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction,
    );

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(sendMock).toHaveBeenCalledWith(
      'Server configuration error: JWT secret is not configured.',
    );
    expect(mockNext).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();

    // Restore original value
    process.env.JWT_SECRET = originalJwtSecret;
  });
});
