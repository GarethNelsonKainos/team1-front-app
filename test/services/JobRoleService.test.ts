import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import type { Band } from '../../src/models/Band';
import type { Capability } from '../../src/models/Capability';
import type { JobRole } from '../../src/models/JobRole';
import type { Location } from '../../src/models/Location';
import { JobRoleService } from '../../src/services/JobRoleService';

vi.mock('axios');

describe('JobRoleService', () => {
  let mockedGet: Mock;
  let mockedPost: Mock;
  let mockedDelete: Mock;
  const service = new JobRoleService();

  beforeEach(() => {
    mockedGet = vi.mocked(axios).get as unknown as Mock;
    mockedPost = vi.mocked(axios).post as unknown as Mock;
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
      expect.stringContaining('/api/job-roles'),
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

    const result = await service.getJobRoleById(1, 'mock-token');

    expect(result).toEqual(mockJobRole);
    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringContaining('/api/job-roles/1'),
      expect.objectContaining({
        headers: { Authorization: 'Bearer mock-token' },
      }),
    );
  });

  it('should throw error when getJobRoleById API call fails', async () => {
    const error = new Error('Network error');
    mockedGet.mockRejectedValue(error);

    await expect(service.getJobRoleById(1, 'mock-token')).rejects.toThrow();
  });

  it('should create job role successfully with single location', async () => {
    const rawFormData = {
      roleName: 'Software Engineer',
      capabilityId: '1',
      bandId: '2',
      description: 'Test description',
      responsibilities: 'Test responsibilities',
      jobSpecLink: 'https://example.com/spec',
      openPositions: '5',
      locationIds: '3',
      closingDate: '2026-02-28',
    };

    const mockJobRole: JobRole = {
      jobRoleId: 1,
      roleName: 'Software Engineer',
      location: 'London',
      capability: 'Engineering',
      band: 'Band 4',
      closingDate: '2026-02-28',
    };

    mockedPost.mockResolvedValue({ data: mockJobRole });

    const result = await service.createJobRole(rawFormData);

    expect(result).toEqual(mockJobRole);
    expect(mockedPost).toHaveBeenCalledWith(
      expect.stringContaining('/api/job-roles'),
      expect.objectContaining({
        roleName: 'Software Engineer',
        capabilityId: 1,
        bandId: 2,
        locationIds: [3],
        openPositions: 5,
      }),
    );
  });

  it('should create job role successfully with multiple locations', async () => {
    const rawFormData = {
      roleName: 'Data Analyst',
      capabilityId: '2',
      bandId: '3',
      description: 'Analyze data',
      responsibilities: 'Create reports',
      jobSpecLink: 'https://example.com/analyst',
      openPositions: '3',
      locationIds: ['1', '2', '3'],
      closingDate: '2026-03-15',
    };

    const mockJobRole: JobRole = {
      jobRoleId: 2,
      roleName: 'Data Analyst',
      location: 'Multiple',
      capability: 'Data',
      band: 'Band 5',
      closingDate: '2026-03-15',
    };

    mockedPost.mockResolvedValue({ data: mockJobRole });

    const result = await service.createJobRole(rawFormData);

    expect(result).toEqual(mockJobRole);
    expect(mockedPost).toHaveBeenCalledWith(
      expect.stringContaining('/api/job-roles'),
      expect.objectContaining({
        locationIds: [1, 2, 3],
      }),
    );
  });

  it('should fetch bands successfully', async () => {
    const mockBands: Band[] = [
      { bandId: 1, bandName: 'Band 1' },
      { bandId: 2, bandName: 'Band 2' },
    ];

    mockedGet.mockResolvedValue({ data: mockBands });

    const result = await service.getBands();

    expect(result).toEqual(mockBands);
    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringContaining('/api/bands'),
    );
  });

  it('should throw error when getBands API call fails', async () => {
    mockedGet.mockRejectedValue(new Error('Network error'));

    await expect(service.getBands()).rejects.toThrow();
  });

  it('should fetch capabilities successfully', async () => {
    const mockCapabilities: Capability[] = [
      { capabilityId: 1, capabilityName: 'Engineering' },
      { capabilityId: 2, capabilityName: 'Data' },
    ];

    mockedGet.mockResolvedValue({ data: mockCapabilities });

    const result = await service.getCapabilities();

    expect(result).toEqual(mockCapabilities);
    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringContaining('/api/capabilities'),
    );
  });

  it('should throw error when getCapabilities API call fails', async () => {
    mockedGet.mockRejectedValue(new Error('Network error'));

    await expect(service.getCapabilities()).rejects.toThrow();
  });

  it('should fetch locations successfully', async () => {
    const mockLocations: Location[] = [
      { locationId: 1, locationName: 'London', city: 'London', country: 'UK' },
      {
        locationId: 2,
        locationName: 'Belfast',
        city: 'Belfast',
        country: 'UK',
      },
    ];

    mockedGet.mockResolvedValue({ data: mockLocations });

    const result = await service.getLocations();

    expect(result).toEqual(mockLocations);
    expect(mockedGet).toHaveBeenCalledWith(
      expect.stringContaining('/api/locations'),
    );
  });

  it('should throw error when getLocations API call fails', async () => {
    mockedGet.mockRejectedValue(new Error('Network error'));

    await expect(service.getLocations()).rejects.toThrow();
  });

  it('should throw error when createJobRole API call fails', async () => {
    const rawFormData = {
      roleName: 'Test Role',
      capabilityId: '1',
      bandId: '2',
      description: 'Test',
      responsibilities: 'Test',
      jobSpecLink: 'https://test.com',
      openPositions: '1',
      locationIds: '1',
      closingDate: '2026-02-28',
    };

    mockedPost.mockRejectedValue(new Error('Creation failed'));

    await expect(service.createJobRole(rawFormData)).rejects.toThrow();
  });
});
