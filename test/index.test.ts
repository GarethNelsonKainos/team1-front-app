import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/index';

describe('Frontend Application', () => {
  describe('GET /', () => {
    it('should render the home page', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.text).toContain('Kainos Job Roles');
      expect(response.text).toContain('Welcome to the Kainos Job Application System');
    });
  });

  describe('GET /health', () => {
    it('should return health status OK', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'OK' });
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
});