import axios from 'axios';
import { JobRoleResponse } from '../models/JobRole';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

export class JobRoleService {
  async getJobRoles(): Promise<JobRoleResponse[]> {
    try {
      const response = await axios.get<JobRoleResponse[]>(
        `${API_BASE_URL}/api/job-roles`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching job roles:', error);
      throw new Error('Failed to fetch job roles');
    }
  }
}

export const jobRoleService = new JobRoleService();
