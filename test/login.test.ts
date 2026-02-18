import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/index';

describe('Login Functionality', () => {
  it('should render login page with form elements', async () => {
    const response = await request(app).get('/login');

    expect(response.status).toBe(200);
    expect(response.text).toContain('action="/login"');
    expect(response.text).toContain('method="POST"');
    expect(response.text).toContain('type="email"');
    expect(response.text).toContain('type="password"');
    expect(response.text).toContain('Sign In');
  });

  it('should include proper form structure', async () => {
    const response = await request(app).get('/login');

    expect(response.text).toContain('name="email"');
    expect(response.text).toContain('name="password"');
    expect(response.text).toContain('type="submit"');
  });

  it('should submit to /login POST endpoint via form action', async () => {
    const response = await request(app).get('/login');

    expect(response.text).toContain('action="/login"');
    expect(response.text).toContain('method="POST"');
    // Ensure no JavaScript fetch is present
    expect(response.text).not.toContain("fetch('/login'");
  });
});
