import axios from 'axios';
import type { Band } from '../models/Band';
import type { Capability } from '../models/Capability';
import type { CreateJobRoleRequest } from '../models/CreateJobRoleRequest';
import type { JobRole } from '../models/JobRole';
import type { Location } from '../models/Location';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

interface RawJobRoleFormData {
  roleName: string;
  capabilityId: string;
  bandId: string;
  description: string;
  responsibilities: string;
  jobSpecLink: string;
  openPositions: string;
  locationIds: string | string[];
  closingDate: string;
}

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

  async createJobRole(rawFormData: RawJobRoleFormData): Promise<JobRole> {
    const formData: CreateJobRoleRequest = {
      roleName: rawFormData.roleName,
      capabilityId: Number.parseInt(rawFormData.capabilityId, 10),
      bandId: Number.parseInt(rawFormData.bandId, 10),
      description: rawFormData.description,
      responsibilities: rawFormData.responsibilities,
      jobSpecLink: rawFormData.jobSpecLink,
      openPositions: Number.parseInt(rawFormData.openPositions, 10),
      locationIds: Array.isArray(rawFormData.locationIds)
        ? rawFormData.locationIds.map((id: string) => Number.parseInt(id, 10))
        : [Number.parseInt(rawFormData.locationIds, 10)],
      closingDate: new Date(rawFormData.closingDate).toISOString(),
    };

    const response = await axios.post<JobRole>(
      `${API_BASE_URL}/api/job-roles`,
      formData,
    );
    return response.data;
  }

  async getBands(): Promise<Band[]> {
    const { data } = await axios.get<Band[]>(`${API_BASE_URL}/api/bands`);
    return data;
  }

  async getCapabilities(): Promise<Capability[]> {
    const { data } = await axios.get<Capability[]>(
      `${API_BASE_URL}/api/capabilities`,
    );
    return data;
  }

  async getLocations(): Promise<Location[]> {
    const { data } = await axios.get<Location[]>(
      `${API_BASE_URL}/api/locations`,
    );
    return data;
  }
}
