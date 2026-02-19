import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ApplicationController from '../../src/controllers/ApplicationController';
import type ApplicationService from '../../src/services/ApplicationService';

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let mockApplicationService: ApplicationService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let renderMock: ReturnType<typeof vi.fn>;
  let redirectMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    renderMock = vi.fn();
    redirectMock = vi.fn();
    statusMock = vi.fn().mockReturnThis();

    mockResponse = {
      render: renderMock,
      redirect: redirectMock,
      status: statusMock,
    };

    mockApplicationService = {
      createApplication: vi.fn(),
    } as unknown as ApplicationService;

    controller = new ApplicationController(mockApplicationService);

    mockRequest = {
      params: {},
      file: undefined,
    };
  });

  describe('constructor', () => {
    it('should initialize with application service', () => {
      expect(controller).toBeTruthy();
    });
  });

  describe('createApplication', () => {
    it('should successfully create application with valid data', async () => {
      const mockFile: Express.Multer.File = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        fieldname: 'cv',
        size: 100,
        destination: '',
        filename: '',
        path: '',
        stream: {} as NodeJS.ReadableStream,
        encoding: '7bit',
      };

      mockRequest.params = { id: '1' };
      mockRequest.file = mockFile;

      vi.mocked(mockApplicationService.createApplication).mockResolvedValue();

      await controller.createApplication(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockApplicationService.createApplication).toHaveBeenCalledWith(
        1,
        mockFile,
      );
      expect(redirectMock).toHaveBeenCalledWith('/application-success');
    });

    it('should return 400 when job role ID is missing', async () => {
      mockRequest.params = {};
      mockRequest.file = {} as Express.Multer.File;

      await controller.createApplication(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(renderMock).toHaveBeenCalledWith('error', {
        title: 'Invalid Request',
        message: 'Job role ID is required to apply.',
      });
    });

    it('should return 400 when CV file is missing', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.file = undefined;

      await controller.createApplication(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(renderMock).toHaveBeenCalledWith('error', {
        title: 'Invalid Request',
        message: 'CV file is required to apply.',
      });
    });

    it('should handle service errors', async () => {
      const mockFile: Express.Multer.File = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        fieldname: 'cv',
        size: 100,
        destination: '',
        filename: '',
        path: '',
        stream: {} as NodeJS.ReadableStream,
        encoding: '7bit',
      };

      mockRequest.params = { id: '1' };
      mockRequest.file = mockFile;

      vi.mocked(mockApplicationService.createApplication).mockRejectedValue(
        new Error('Service error'),
      );

      await controller.createApplication(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(renderMock).toHaveBeenCalledWith('error', {
        title: 'Error',
        message:
          'An error occurred while submitting your application. Please try again later.',
      });
    });
  });
});
