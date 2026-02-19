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

  beforeEach(() => {
    // Reset axios defaults
    if (axios.defaults.headers.common) {
      axios.defaults.headers.common.Authorization = undefined;
    }

    redirectMock = vi.fn();
    mockNext = vi.fn();

    mockRes = {
      redirect: redirectMock,
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
    vi.mocked(jwt.decode).mockReturnValue(mockDecoded as never);

    authenticateJWT(
      mockReq as Request,
      mockRes as Response,
      mockNext as NextFunction,
    );

    expect(jwt.decode).toHaveBeenCalledWith(mockToken);
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
});
