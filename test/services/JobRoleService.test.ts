import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import type { JobRole } from '../../src/models/JobRole';
import { JobRoleService } from '../../src/services/JobRoleService';

vi.mock('axios');

describe('JobRoleService', () => {
  let mockedGet: Mock;
  const service = new JobRoleService();

  beforeEach(() => {
    mockedGet = vi.mocked(axios).get as unknown as Mock;
  });

  afterEach(() => {
    vi.clearAllMocks();
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

    const result = await service.getJobRoles();

    expect(result).toEqual(mockJobRoles);
    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringContaining('/api/job-roles'),
    );
  });

  it('should throw error when API call fails', async () => {
    const error = new Error('Network error');
    mockedGet.mockRejectedValue(error);

    await expect(service.getJobRoles()).rejects.toThrow();
  });

  it('should return empty array when no job roles exist', async () => {
    mockedGet.mockResolvedValue({ data: [] });

    const result = await service.getJobRoles();

    expect(result).toEqual([]);
  });

  it('should fetch job role by id successfully', async () => {
    const mockJobRole: JobRole = {
      jobRoleId: 1,
      roleName: 'Software Engineer',
      location: 'London',
      capability: 'Engineering',
      band: 'Band 4',
      closingDate: '2026-02-28',
    };

    mockedGet.mockResolvedValue({ data: mockJobRole });

    const result = await service.getJobRoleById('1');

    expect(result).toEqual(mockJobRole);
    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringContaining('/api/job-roles/1'),
    );
  });
});
