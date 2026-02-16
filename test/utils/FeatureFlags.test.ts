import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getAllFlags,
  isJobApplicationsEnabled,
} from '../../src/utils/FeatureFlags';

describe('FeatureFlags', () => {
  // Store original env to restore after tests
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset the environment before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('isJobApplicationsEnabled', () => {
    it('should return false when ENABLE_JOB_APPLICATIONS is not set or invalid', () => {
      process.env.ENABLE_JOB_APPLICATIONS = undefined;
      expect(isJobApplicationsEnabled()).toBe(false);

      process.env.ENABLE_JOB_APPLICATIONS = '';
      expect(isJobApplicationsEnabled()).toBe(false);

      process.env.ENABLE_JOB_APPLICATIONS = 'invalid';
      expect(isJobApplicationsEnabled()).toBe(false);
    });

    it('should return true when ENABLE_JOB_APPLICATIONS is enabled', () => {
      process.env.ENABLE_JOB_APPLICATIONS = 'true';
      expect(isJobApplicationsEnabled()).toBe(true);

      process.env.ENABLE_JOB_APPLICATIONS = 'TRUE';
      expect(isJobApplicationsEnabled()).toBe(true);

      process.env.ENABLE_JOB_APPLICATIONS = '1';
      expect(isJobApplicationsEnabled()).toBe(true);
    });

    it('should return false when ENABLE_JOB_APPLICATIONS is explicitly disabled', () => {
      process.env.ENABLE_JOB_APPLICATIONS = 'false';
      expect(isJobApplicationsEnabled()).toBe(false);

      process.env.ENABLE_JOB_APPLICATIONS = '0';
      expect(isJobApplicationsEnabled()).toBe(false);
    });
  });

  describe('getAllFlags', () => {
    it('should return all feature flags with current states', () => {
      process.env.ENABLE_JOB_APPLICATIONS = 'true';

      const result = getAllFlags();

      expect(result).toEqual({
        jobApplications: true,
      });
    });

    it('should return false for disabled features', () => {
      process.env.ENABLE_JOB_APPLICATIONS = 'false';

      const result = getAllFlags();

      expect(result).toEqual({
        jobApplications: false,
      });
    });
  });
});
