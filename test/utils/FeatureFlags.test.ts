import { beforeEach, describe, expect, it } from 'vitest';
import {
  getAllFlags,
  isAddJobRoleEnabled,
  isJobApplicationsEnabled,
} from '../../src/utils/FeatureFlags';

describe('FeatureFlags', () => {
  beforeEach(() => {
    // Clean up environment variables before each test
    process.env.ENABLE_JOB_APPLICATIONS = undefined;
    process.env.ENABLE_ADD_JOB_ROLE = undefined;
  });

  describe('isJobApplicationsEnabled', () => {
    it('should return true when ENABLE_JOB_APPLICATIONS is "true"', () => {
      process.env.ENABLE_JOB_APPLICATIONS = 'true';
      expect(isJobApplicationsEnabled()).toBe(true);
    });

    it('should return true when ENABLE_JOB_APPLICATIONS is "TRUE" (case insensitive)', () => {
      process.env.ENABLE_JOB_APPLICATIONS = 'TRUE';
      expect(isJobApplicationsEnabled()).toBe(true);
    });

    it('should return true when ENABLE_JOB_APPLICATIONS is "1"', () => {
      process.env.ENABLE_JOB_APPLICATIONS = '1';
      expect(isJobApplicationsEnabled()).toBe(true);
    });

    it('should return false when ENABLE_JOB_APPLICATIONS is "false"', () => {
      process.env.ENABLE_JOB_APPLICATIONS = 'false';
      expect(isJobApplicationsEnabled()).toBe(false);
    });

    it('should return false when ENABLE_JOB_APPLICATIONS is "0"', () => {
      process.env.ENABLE_JOB_APPLICATIONS = '0';
      expect(isJobApplicationsEnabled()).toBe(false);
    });

    it('should return false when ENABLE_JOB_APPLICATIONS is undefined', () => {
      expect(isJobApplicationsEnabled()).toBe(false);
    });

    it('should return false when ENABLE_JOB_APPLICATIONS is empty string', () => {
      process.env.ENABLE_JOB_APPLICATIONS = '';
      expect(isJobApplicationsEnabled()).toBe(false);
    });

    it('should return false for any other value', () => {
      process.env.ENABLE_JOB_APPLICATIONS = 'random';
      expect(isJobApplicationsEnabled()).toBe(false);
    });
  });

  describe('isAddJobRoleEnabled', () => {
    it('should return true when ENABLE_ADD_JOB_ROLE is "true"', () => {
      process.env.ENABLE_ADD_JOB_ROLE = 'true';
      expect(isAddJobRoleEnabled()).toBe(true);
    });

    it('should return true when ENABLE_ADD_JOB_ROLE is "TRUE" (case insensitive)', () => {
      process.env.ENABLE_ADD_JOB_ROLE = 'TRUE';
      expect(isAddJobRoleEnabled()).toBe(true);
    });

    it('should return true when ENABLE_ADD_JOB_ROLE is "1"', () => {
      process.env.ENABLE_ADD_JOB_ROLE = '1';
      expect(isAddJobRoleEnabled()).toBe(true);
    });

    it('should return false when ENABLE_ADD_JOB_ROLE is "false"', () => {
      process.env.ENABLE_ADD_JOB_ROLE = 'false';
      expect(isAddJobRoleEnabled()).toBe(false);
    });

    it('should return false when ENABLE_ADD_JOB_ROLE is "0"', () => {
      process.env.ENABLE_ADD_JOB_ROLE = '0';
      expect(isAddJobRoleEnabled()).toBe(false);
    });

    it('should return false when ENABLE_ADD_JOB_ROLE is undefined', () => {
      expect(isAddJobRoleEnabled()).toBe(false);
    });

    it('should return false when ENABLE_ADD_JOB_ROLE is empty string', () => {
      process.env.ENABLE_ADD_JOB_ROLE = '';
      expect(isAddJobRoleEnabled()).toBe(false);
    });

    it('should return false for any other value', () => {
      process.env.ENABLE_ADD_JOB_ROLE = 'yes';
      expect(isAddJobRoleEnabled()).toBe(false);
    });
  });

  describe('getAllFlags', () => {
    it('should return all feature flag states when enabled', () => {
      process.env.ENABLE_JOB_APPLICATIONS = 'true';
      const result = getAllFlags();
      expect(result).toEqual({ jobApplications: true });
    });

    it('should return all feature flag states when disabled', () => {
      process.env.ENABLE_JOB_APPLICATIONS = 'false';
      const result = getAllFlags();
      expect(result).toEqual({ jobApplications: false });
    });
  });
});
