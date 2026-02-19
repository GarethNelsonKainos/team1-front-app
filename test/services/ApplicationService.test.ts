import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ApplicationService from '../../src/services/ApplicationService';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('ApplicationService', () => {
  let applicationService: ApplicationService;

  beforeEach(() => {
    applicationService = new ApplicationService();
    vi.clearAllMocks();
  });

  describe('createApplication', () => {
    it('should create application with valid file and job role ID', async () => {
      const mockFile: Express.Multer.File = {
        buffer: Buffer.from('test file content'),
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

      mockedAxios.post.mockResolvedValue({ status: 201 });

      await applicationService.createApplication(1, mockFile);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/applications',
        expect.any(FormData),
        expect.objectContaining({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }),
      );
    });

    it('should handle network errors', async () => {
      const mockFile: Express.Multer.File = {
        buffer: Buffer.from('test file content'),
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

      mockedAxios.post.mockRejectedValue(new Error('Network error'));

      await expect(
        applicationService.createApplication(1, mockFile),
      ).rejects.toThrow('Network error');
    });
  });
});
