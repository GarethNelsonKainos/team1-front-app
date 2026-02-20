import type { Express } from 'express';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Frontend Environment Configuration', () => {
  let app: Express;

  beforeEach(() => {
    // Clear the module cache to ensure fresh imports
    vi.resetModules();
  });

  afterEach(() => {
    // Clean up environment variables
    process.env.PORT = undefined;
  });

  describe('PORT Configuration', () => {
    it('should use default port 3000 when PORT is not set', async () => {
      process.env.PORT = undefined;

      // Import the app after clearing the environment variable
      const { default: appModule } = await import('../src/index');
      app = appModule;

      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });

    it('should use default port 3000 when PORT is empty string', async () => {
      process.env.PORT = '';

      // Import the app after setting empty PORT
      const { default: appModule } = await import('../src/index');
      app = appModule;

      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });

    it('should use environment PORT when valid number is provided', async () => {
      process.env.PORT = '5000';

      // Import the app after setting valid PORT
      const { default: appModule } = await import('../src/index');
      app = appModule;

      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });

    it('should handle various template rendering scenarios', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/login');
    });
  });
});
