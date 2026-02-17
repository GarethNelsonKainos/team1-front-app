import axios from 'axios';
import type { Band } from '../models/Band';
import type { Capability } from '../models/Capability';
import type { JobRole } from '../models/JobRole';
import type { Location } from '../models/Location';
import type { CreateJobRoleRequest } from '../models/CreateJobRoleRequest';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export class JobRoleService {
  async getJobRoles(): Promise<JobRole[]> {
    const { data } = await axios.get<JobRole[]>(
      `${API_BASE_URL}/api/job-roles`,
    );
    return data;
  }

  async getJobRoleById(id: number): Promise<JobRole> {
    const { data } = await axios.get<JobRole>(
      `${API_BASE_URL}/api/job-roles/${id}`,
    );
    return data;
  }

  async createJobRole(
    jobRoleData: CreateJobRoleRequest,
    token: string,
  ): Promise<JobRole> {
    const { data } = await axios.post<JobRole>(
      `${API_BASE_URL}/api/job-roles`,
      jobRoleData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return data;
  }

  async getBands(token: string): Promise<Band[]> {
    const { data } = await axios.get<Band[]>(`${API_BASE_URL}/api/bands`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  }

  async getCapabilities(token: string): Promise<Capability[]> {
    const { data } = await axios.get<Capability[]>(
      `${API_BASE_URL}/api/capabilities`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  }

  async getLocations(token: string): Promise<Location[]> {
    const { data } = await axios.get<Location[]>(
      `${API_BASE_URL}/api/locations`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  }
}
