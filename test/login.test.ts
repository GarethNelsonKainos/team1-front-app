import request from 'supertest';
import { describe, expect, it } from 'vitest';
import app from '../src/index';

describe('Login Functionality', () => {
  it('should render login page with form elements', async () => {
    const response = await request(app).get('/login');

    expect(response.status).toBe(200);
    expect(response.text).toContain('id="loginForm"');
    expect(response.text).toContain('type="email"');
    expect(response.text).toContain('type="password"');
    expect(response.text).toContain('Sign In');
  });

  it('should include form validation logic', async () => {
    const response = await request(app).get('/login');

    expect(response.text).toContain('validateForm');
    expect(response.text).toContain('isValidEmail');
    expect(response.text).toContain('length < 8');
  });

  it('should submit to /login POST endpoint', async () => {
    const response = await request(app).get('/login');

    expect(response.text).toContain("fetch('/login'");
    expect(response.text).toContain("method: 'POST'");
  });
});
