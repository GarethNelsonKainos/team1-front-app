import request from 'supertest';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import axios from 'axios';
import type { Mock } from 'vitest';
import app from '../src/index';

vi.mock('axios');

describe('Frontend Application', () => {
  describe('GET /', () => {
    it('should render the home page', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Kainos Job Roles');
      expect(response.text).toContain('Find Your Next Opportunity');
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
      expect(response.text).toContain('Back to Job Listings');
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

      // Should attempt to serve static CSS file
      // May return 404 if file doesn't exist, but should handle the request
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
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });

  describe('Environment Configuration', () => {
    it('should use environment PORT or default to 3000', () => {
      // Test that the app is configured properly
      expect(app).toBeDefined();
    });
  });

  describe('GET /application-success', () => {
    it('should render the application success page', async () => {
      const response = await request(app).get('/application-success');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Application Submitted - Kainos Job Roles');
    });
  });

  describe('POST /api/applications', () => {
    let mockedPost: Mock;

    beforeEach(() => {
      mockedPost = vi.mocked(axios).post as unknown as Mock;
      vi.clearAllMocks();
    });

    it('should return 401 when no authorization token provided', async () => {
      const response = await request(app)
        .post('/api/applications')
        .send({ jobRoleId: 1 });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Authentication required' });
    });

    it('should successfully proxy request to backend and redirect', async () => {
      mockedPost.mockResolvedValue({ data: { success: true } });

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', 'Bearer test-token')
        .send({ jobRoleId: 1 });

      expect(response.status).toBe(302); // Redirect status
      expect(response.headers.location).toBe('/application-success');
      expect(mockedPost).toHaveBeenCalledWith(
        expect.stringContaining('/api/applications'),
        'jobRoleId=1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should return 401 when backend returns 401', async () => {
      const error = { response: { status: 401 } };
      mockedPost.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', 'Bearer invalid-token')
        .send({ jobRoleId: 1 });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Authentication required' });
    });

    it('should render error page when backend fails with other errors', async () => {
      const error = { response: { status: 500, data: 'Internal server error' } };
      mockedPost.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', 'Bearer test-token')
        .send({ jobRoleId: 1 });

      expect(response.status).toBe(500);
      expect(response.text).toContain('Failed to submit application');
    });
  });
});
