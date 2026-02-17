import axios from 'axios';
import type { JobRole } from './models/JobRole';
import type { JobRoleListResponse } from './services/JobRoleService';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

export async function fetchJobRoles(): Promise<JobRole[]> {
  const response = await axios.get<JobRoleListResponse>(
    `${API_BASE_URL}/api/job-roles`,
  );
  const data = response.data as unknown;
  if (Array.isArray(data)) {
    return data;
  }
  return response.data.jobRoles;
}
