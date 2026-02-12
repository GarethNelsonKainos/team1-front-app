import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { fetchJobRoles, submitApplication } from '../src/api';
import type { JobRole } from '../src/models/JobRole';

vi.mock('axios');

describe('API', () => {
  let mockedGet: Mock;
  let mockedPost: Mock;

  beforeEach(() => {
    mockedGet = vi.mocked(axios).get as unknown as Mock;
    mockedPost = vi.mocked(axios).post as unknown as Mock;
  });

  it('should fetch job roles successfully', async () => {
    const mockJobRoles: JobRole[] = [
      {
        jobRoleId: 1,
        roleName: 'Software Engineer',
        location: 'London',
        capability: 'Engineering',
        band: 'Band 4',
        closingDate: '2026-02-28',
      },
    ];

    mockedGet.mockResolvedValue({ data: mockJobRoles });

    const result = await fetchJobRoles();

    expect(result).toEqual(mockJobRoles);
    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringContaining('/api/job-roles'),
    );
  });

  it('should throw error when API call fails', async () => {
    const error = new Error('Network error');
    mockedGet.mockRejectedValue(error);

    await expect(fetchJobRoles()).rejects.toThrow('Network error');
  });

  it('should return empty array when no job roles exist', async () => {
    mockedGet.mockResolvedValue({ data: [] });

    const result = await fetchJobRoles();

    expect(result).toEqual([]);
  });

  describe('submitApplication', () => {
    it('should submit application successfully', async () => {
      const mockResponse = {
        message: 'Application submitted successfully',
        application: {
          applicationId: 1,
          jobRoleId: 1,
          userId: 1,
          applicationStatusId: 1,
          createdAt: '2026-02-12T10:00:00Z',
        },
      };

      mockedPost.mockResolvedValue({ data: mockResponse });

      const result = await submitApplication(1, 'fake-jwt-token');

      expect(result).toEqual(mockResponse);
      expect(mockedPost).toHaveBeenCalledWith(
        'http://localhost:8080/api/applications',
        { jobRoleId: 1 },
        {
          headers: {
            Authorization: 'Bearer fake-jwt-token',
            'Content-Type': 'application/json',
          },
        },
      );
    });

    it('should throw error when application submission fails', async () => {
      const error = new Error('Network error');
      mockedPost.mockRejectedValue(error);

      await expect(submitApplication(1, 'fake-jwt-token')).rejects.toThrow(
        'Network error',
      );
    });
  });
});
