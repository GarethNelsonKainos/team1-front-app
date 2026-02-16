import axios from 'axios';
import type { JobRole } from '../models/JobRole';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export interface JobRoleListResponse {
  canDelete: boolean;
  jobRoles: JobRole[];
}

export interface JobRoleDetailResponse {
  canDelete: boolean;
  jobRole: JobRole;
}

export class JobRoleService {
  async getJobRoles(): Promise<JobRoleListResponse> {
    try {
      const response = await axios.get<JobRoleListResponse>(
        `${API_BASE_URL}/api/job-roles`,
      );
      const data = response.data as unknown;
      if (Array.isArray(data)) {
        return { canDelete: false, jobRoles: data };
      }
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching job roles:', error);
      throw error;
    }
  }

  async getJobRoleById(id: string | number): Promise<JobRoleDetailResponse> {
    try {
      const response = await axios.get<JobRoleDetailResponse>(
        `${API_BASE_URL}/api/job-roles/${id}`,
      );
      const data = response.data as unknown;
      if (data && !('jobRole' in (data as object))) {
        return { canDelete: false, jobRole: data as JobRole };
      }
      return response.data;
    } catch (error: unknown) {
      console.error(`Error fetching job role with id ${id}:`, error);
      throw error;
    }
  }

  async deleteJobRole(id: string | number, authToken?: string): Promise<void> {
    try {
      const config = authToken
        ? { headers: { Authorization: `Bearer ${authToken}` } }
        : undefined;
      await axios.delete(`${API_BASE_URL}/api/job-roles/${id}`, config);
    } catch (error: unknown) {
      console.error(`Error deleting job role with id ${id}:`, error);
      throw error;
    }
  }
}
