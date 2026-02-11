import axios from 'axios';
import type { JobRole } from './models/JobRole';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

export async function fetchJobRoles(): Promise<JobRole[]> {
  const response = await axios.get<JobRole[]>(`${API_BASE_URL}/api/job-roles`);
  return response.data;
}
