import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import type { JobRole } from '../src/models/JobRole';

// Simple API functions for testing
const API_BASE_URL = 'http://localhost:8080';

async function fetchJobRoles(): Promise<JobRole[]> {
  const response = await axios.get<JobRole[]>(`${API_BASE_URL}/api/job-roles`);
  return response.data;
}

vi.mock('axios');

describe('API', () => {
  let mockedGet: Mock;

  beforeEach(() => {
    mockedGet = vi.mocked(axios).get as unknown as Mock;
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

    mockedGet.mockResolvedValue({
      data: {
        canDelete: true,
        jobRoles: mockJobRoles,
      },
    });

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
    mockedGet.mockResolvedValue({
      data: {
        canDelete: false,
        jobRoles: [],
      },
    });

    const result = await fetchJobRoles();

    expect(result).toEqual([]);
  });
});
