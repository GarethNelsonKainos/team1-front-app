import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginService } from '../../src/services/LoginService';

vi.mock('axios');

describe('LoginService', () => {
  let loginService: LoginService;

  beforeEach(() => {
    loginService = new LoginService();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should make POST request to login endpoint with correct credentials', async () => {
      const mockToken = 'mock.jwt.token';
      const mockResponse = {
        data: { token: mockToken },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await loginService.login(
        'test@example.com',
        'Password123!',
      );

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        {
          email: 'test@example.com',
          password: 'Password123!',
        },
      );

      expect(result).toEqual(mockToken);
    });

    it('should throw error when axios request fails', async () => {
      const mockError = new Error('Network Error');
      vi.mocked(axios.post).mockRejectedValue(mockError);

      await expect(
        loginService.login('wrong@example.com', 'wrongpassword'),
      ).rejects.toThrow('Network Error');

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        {
          email: 'wrong@example.com',
          password: 'wrongpassword',
        },
      );
    });

    it('should use default API_BASE_URL when environment variable is not set', async () => {
      const mockResponse = {
        data: { token: 'test-token' },
      };

      vi.mocked(axios.post).mockResolvedValue(mockResponse);

      const result = await loginService.login('test@example.com', 'password');

      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        {
          email: 'test@example.com',
          password: 'password',
        },
      );

      expect(result).toBe('test-token');
    });
  });
});
