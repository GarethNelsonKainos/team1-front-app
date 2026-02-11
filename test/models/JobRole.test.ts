import { describe, expect, it } from 'vitest';
import type { JobRole } from '../../src/models/JobRole';

describe('JobRole Model', () => {
  it('should create a valid JobRole object', () => {
    const jobRole: JobRole = {
      jobRoleId: 1,
      roleName: 'Software Engineer',
      location: 'London',
      capability: 'Engineering',
      band: 'Band 4',
      closingDate: '2026-02-28',
    };

    expect(jobRole.jobRoleId).toBe(1);
    expect(jobRole.roleName).toBe('Software Engineer');
    expect(jobRole.location).toBe('London');
    expect(jobRole.capability).toBe('Engineering');
    expect(jobRole.band).toBe('Band 4');
    expect(jobRole.closingDate).toBe('2026-02-28');
  });

  it('should have all required properties', () => {
    const jobRole: JobRole = {
      jobRoleId: 2,
      roleName: 'Product Manager',
      location: 'Manchester',
      capability: 'Product',
      band: 'Band 5',
      closingDate: '2026-03-15',
    };

    expect(Object.keys(jobRole)).toEqual([
      'jobRoleId',
      'roleName',
      'location',
      'capability',
      'band',
      'closingDate',
    ]);
  });
});
