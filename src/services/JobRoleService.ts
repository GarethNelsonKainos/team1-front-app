import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { JobRole } from '../models/JobRole';

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

  async deleteJobRole(id: number, token: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/job-roles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: unknown) {
      console.error(`Error deleting job role with id ${id}:`, error);
      throw error;
    }
  }

  async getJobRoleById(id: string | number): Promise<JobRoleDetailResponse> {
    try {
      const response = await axios.get<JobRoleDetailResponse>(
        `${API_BASE_URL}/api/job-roles/${id}`,
      );
      const data = response.data as unknown;
      if (typeof data === 'object' && data !== null && !('jobRole' in data)) {
        return { canDelete: false, jobRole: data as JobRole };
      }
      return response.data;
    } catch (error: unknown) {
      console.error(`Error fetching job role with id ${id}:`, error);
      throw error;
    }
  }
}
