import type { Application } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authenticateRouter from '../../src/Router/AuthenicateRouter';
import { AuthenticateController } from '../../src/controllers/AuthenticateController';

vi.mock('../../src/controllers/AuthenticateController');

describe('AuthenticateRouter', () => {
  let mockApp: Partial<Application>;
  let getMock: ReturnType<typeof vi.fn>;
  let postMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getMock = vi.fn();
    postMock = vi.fn();

    mockApp = {
      get: getMock,
      post: postMock,
    } as unknown as Application;

    vi.clearAllMocks();
  });

  it('should register GET /login route', () => {
    authenticateRouter(mockApp as Application);

    expect(getMock).toHaveBeenCalledWith('/login', expect.any(Function));
  });

  it('should register POST /login route', () => {
    authenticateRouter(mockApp as Application);

    expect(postMock).toHaveBeenCalledWith('/login', expect.any(Function));
  });

  it('should register POST /logout route', () => {
    authenticateRouter(mockApp as Application);

    expect(postMock).toHaveBeenCalledWith('/logout', expect.any(Function));
  });

  it('should create AuthenticateController instance', () => {
    authenticateRouter(mockApp as Application);

    expect(AuthenticateController).toHaveBeenCalled();
  });
});
