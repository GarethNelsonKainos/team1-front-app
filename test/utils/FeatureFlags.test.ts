import { describe, expect, it } from 'vitest';
import {
  getAllFlags,
  isJobApplicationsEnabled,
} from '../../src/utils/FeatureFlags';

describe('FeatureFlags', () => {
  describe('isJobApplicationsEnabled', () => {
    it('should return true when ENABLE_JOB_APPLICATIONS is enabled', () => {
      process.env.ENABLE_JOB_APPLICATIONS = 'true';
      expect(isJobApplicationsEnabled()).toBe(true);
    });

    it('should return false when ENABLE_JOB_APPLICATIONS is not set', () => {
      process.env.ENABLE_JOB_APPLICATIONS = undefined;
      expect(isJobApplicationsEnabled()).toBe(false);
    });
  });

  describe('getAllFlags', () => {
    it('should return all feature flag states', () => {
      process.env.ENABLE_JOB_APPLICATIONS = 'true';
      const result = getAllFlags();
      expect(result).toEqual({ jobApplications: true });
    });
  });
});
