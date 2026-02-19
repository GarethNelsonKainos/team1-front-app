import axios from 'axios';
import type { Band } from '../models/Band';
import type { Capability } from '../models/Capability';
import type { CreateJobRoleRequest } from '../models/CreateJobRoleRequest';
import type { JobRole } from '../models/JobRole';
import type { Location } from '../models/Location';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

export class JobRoleService {
  async getJobRoles(): Promise<JobRole[]> {
    const { data } = await axios.get<JobRole[]>(
      `${API_BASE_URL}/job-roles`,
    );
    return data;
  }

  async getJobRoleById(id: number): Promise<JobRole> {
    const { data } = await axios.get<JobRole>(
      `${API_BASE_URL}/job-roles/${id}`,
    );
    return data;
  }

  async createJobRole(
    jobRoleData: CreateJobRoleRequest
  ): Promise<JobRole> {
    const { data } = await axios.post<JobRole>(
      `${API_BASE_URL}/job-roles`,
      jobRoleData,
    );
    return data;
  }

  async getBands(): Promise<Band[]> {
    const { data } = await axios.get<Band[]>(`${API_BASE_URL}/bands`);
    return data;
  }

  async getCapabilities(): Promise<Capability[]> {
    const { data } = await axios.get<Capability[]>(
      `${API_BASE_URL}/capabilities`,
    );
    return data;
  }

  async getLocations(): Promise<Location[]> {
    const { data } = await axios.get<Location[]>(
      `${API_BASE_URL}/locations`,
    );
    return data;
  }
}
