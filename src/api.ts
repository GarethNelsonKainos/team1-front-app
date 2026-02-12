import axios from 'axios';
import type { JobRole } from './models/JobRole';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

export interface ApplicationResponse {
  message: string;
  application: {
    applicationId: number;
    jobRoleId: number;
    userId: number;
    applicationStatusId: number;
    createdAt: string;
  };
}

export async function fetchJobRoles(): Promise<JobRole[]> {
  const response = await axios.get<JobRole[]>(`${API_BASE_URL}/api/job-roles`);
  return response.data;
}

export async function submitApplication(
  jobRoleId: number,
  token: string,
): Promise<ApplicationResponse> {
  const response = await axios.post<ApplicationResponse>(
    `${API_BASE_URL}/api/applications`,
    { jobRoleId },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
}
