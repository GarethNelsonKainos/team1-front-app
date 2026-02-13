import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { fetchJobRoles } from '../src/api';
import type { JobRole } from '../src/models/JobRole';

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
});
