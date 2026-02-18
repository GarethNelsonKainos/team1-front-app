import axios from 'axios';
import type { JobRole } from '../models/JobRole';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export class JobRoleService {
  async getJobRoles(token?: string): Promise<JobRole[]> {
    try {
      const response = await axios.get<JobRole[]>(
        `${API_BASE_URL}/api/job-roles`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching job roles:', error);
      throw error;
    }
  }

  async getJobRoleById(id: string | number, token?: string): Promise<JobRole> {
    try {
      const response = await axios.get<JobRole>(
        `${API_BASE_URL}/api/job-roles/${id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      return response.data;
    } catch (error: unknown) {
      console.error(`Error fetching job role with id ${id}:`, error);
      throw error;
    }
  }
}
