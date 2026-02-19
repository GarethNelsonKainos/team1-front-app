import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type ApplicationController from '../../src/controllers/ApplicationController';
import applicationRouter from '../../src/router/ApplicationRouter';

describe('ApplicationRouter', () => {
  let app: express.Application;
  let mockApplicationController: ApplicationController;

  beforeEach(() => {
    app = express();

    // Mock the render method to avoid template rendering issues
    app.set('view engine', 'njk');
    app.engine(
      'njk',
      (
        path: string,
        options: Record<string, unknown>,
        callback: (err: Error | null, html?: string) => void,
      ) => {
        callback(null, `<html><body>${options.title as string}</body></html>`);
      },
    );

    mockApplicationController = {
      createApplication: vi.fn(),
    } as unknown as ApplicationController;

    app.use('/', applicationRouter(mockApplicationController));
  });

  describe('GET /application-success', () => {
    it('should render application success page', async () => {
      const response = await request(app).get('/application-success');

      expect(response.status).toBe(200);
      expect(response.type).toBe('text/html');
    });
  });
});
