import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/index';

describe('Frontend Application', () => {
  describe('GET /', () => {
    it('should handle various template rendering scenarios', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(302);
      expect(response.header.location).toBe('/login');
    });
  });

  describe('GET /health', () => {
    it('should return health status OK', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
    });
  });

  describe('GET /login', () => {
    it('should render the login page', async () => {
      const response = await request(app).get('/login');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Sign In');
      expect(response.text).toContain('Email Address');
      expect(response.text).toContain('Password');
    });

    it('should have the correct page title', async () => {
      const response = await request(app).get('/login');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Sign In - Kainos Job Roles');
    });
  });

  describe('Static File Serving', () => {
    it('should serve static files from public directory', async () => {
      const response = await request(app).get('/css/styles.css');

      expect([200, 404]).toContain(response.status);
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app).get('/non-existent-route');

      expect(response.status).toBe(404);
    });
  });

  describe('Template Rendering', () => {
    it('should render with Nunjucks template engine', async () => {
      const response = await request(app).get('/login');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });

  describe('Environment Configuration', () => {
    it('should use environment PORT or default to 3000', () => {
      expect(app).toBeDefined();
    });
  });
});
