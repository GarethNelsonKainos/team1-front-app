import axios from 'axios';
import { JobRole } from '../models/JobRole';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

export class JobRoleService {
  async getJobRoles(): Promise<JobRole[]> {
    try {
      const response = await axios.get<JobRole[]>(
        `${API_BASE_URL}/api/job-roles`
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching job roles:', error);
      throw new Error('Failed to fetch job roles', { cause: error });
    }
  }
}

export const jobRoleService = new JobRoleService();
