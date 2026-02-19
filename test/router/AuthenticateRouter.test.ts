import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthenticateController } from '../../src/controllers/AuthenticateController';
import authenticationRouter from '../../src/router/AuthenticateRouter';

// Mock the Router
const mockRouter = {
  get: vi.fn(),
  post: vi.fn(),
};

vi.mock('express', () => ({
  Router: vi.fn(() => mockRouter),
}));

describe('AuthenticateRouter', () => {
  let mockAuthController: Partial<AuthenticateController>;

  beforeEach(() => {
    mockAuthController = {
      renderLoginPage: vi.fn(),
      performLogin: vi.fn(),
      performLogout: vi.fn(),
    } as unknown as AuthenticateController;

    vi.clearAllMocks();
  });

  it('should register GET /login route', () => {
    authenticationRouter(mockAuthController as AuthenticateController);

    expect(mockRouter.get).toHaveBeenCalledWith('/login', expect.any(Function));
  });

  it('should register POST /login route', () => {
    authenticationRouter(mockAuthController as AuthenticateController);

    expect(mockRouter.post).toHaveBeenCalledWith(
      '/login',
      expect.any(Function),
    );
  });

  it('should register POST /logout route', () => {
    authenticationRouter(mockAuthController as AuthenticateController);

    expect(mockRouter.post).toHaveBeenCalledWith(
      '/logout',
      expect.any(Function),
    );
  });

  it('should return the router instance', () => {
    const result = authenticationRouter(
      mockAuthController as AuthenticateController,
    );

    expect(result).toBe(mockRouter);
  });
});
