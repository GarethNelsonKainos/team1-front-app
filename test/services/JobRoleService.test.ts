import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import type { JobRole } from '../../src/models/JobRole';
import { JobRoleService } from '../../src/services/JobRoleService';

vi.mock('axios');

describe('JobRoleService', () => {
  let mockedGet: Mock;
  let mockedDelete: Mock;
  const service = new JobRoleService();

  beforeEach(() => {
    mockedGet = vi.mocked(axios).get as unknown as Mock;
    mockedDelete = vi.mocked(axios).delete as unknown as Mock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should wrap array response for backward compatibility', async () => {
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
      data: mockJobRoles, // legacy array response
    });

    const result = await service.getJobRoles();

    expect(result).toEqual({
      canDelete: false,
      jobRoles: mockJobRoles,
    });
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

    const result = await service.getJobRoles();

    expect(result).toEqual({
      canDelete: true,
      jobRoles: mockJobRoles,
    });
    expect(mockedGet).toHaveBeenCalledWith(
      'http://localhost:3001/api/job-roles',
    );
  });

  it('should throw error when API call fails', async () => {
    const error = new Error('Network error');
    mockedGet.mockRejectedValue(error);

    await expect(service.getJobRoles()).rejects.toThrow();
  });

  it('should return empty array when no job roles exist', async () => {
    mockedGet.mockResolvedValue({
      data: {
        canDelete: false,
        jobRoles: [],
      },
    });

    const result = await service.getJobRoles();

    expect(result).toEqual({
      canDelete: false,
      jobRoles: [],
    });
  });

  it('should delete job role successfully', async () => {
    mockedDelete.mockResolvedValue({ status: 204 });

    await service.deleteJobRole(123, 'token');

    expect(mockedDelete).toHaveBeenCalledWith(
      expect.stringContaining('/api/job-roles/123'),
      { headers: { Authorization: 'Bearer token' } },
    );
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

    expect(result).toEqual({ canDelete: false, jobRole: mockJobRole });
    expect(mockedGet).toHaveBeenCalledWith(
      'http://localhost:3001/api/job-roles/1',
    );
  });

  it('should throw error when getJobRoleById API call fails', async () => {
    const error = new Error('Network error');
    mockedGet.mockRejectedValue(error);

    await expect(service.getJobRoleById('1')).rejects.toThrow();
  });
  describe('checkApplicationStatus', () => {
    it('should return true when user has already applied', async () => {
      mockedGet.mockResolvedValue({
        data: { hasApplied: true },
      });

      const result = await service.checkApplicationStatus('1', 'test-token');

      expect(result).toBe(true);
      expect(mockedGet).toHaveBeenCalledWith(
        'http://localhost:3001/api/applications/status/1',
        { headers: { Authorization: 'Bearer test-token' } },
      );
    });

    it('should return false when user has not applied', async () => {
      mockedGet.mockResolvedValue({
        data: { hasApplied: false },
      });

      const result = await service.checkApplicationStatus('1', 'test-token');

      expect(result).toBe(false);
    });

    it('should return false when API call fails', async () => {
      mockedGet.mockRejectedValue(new Error('API Error'));

      const result = await service.checkApplicationStatus('1', 'test-token');

      expect(result).toBe(false);
    });
  });
});
