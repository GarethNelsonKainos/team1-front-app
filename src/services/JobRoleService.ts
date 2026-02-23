import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { Band } from '../models/Band';
import type { Capability } from '../models/Capability';
import type { CreateJobRoleRequest } from '../models/CreateJobRoleRequest';
import type { JobRole } from '../models/JobRole';
import type { Location } from '../models/Location';

export interface JobRoleListResponse {
  canDelete: boolean;
  jobRoles: JobRole[];
}

export interface JobRoleDetailResponse {
  canDelete: boolean;
  jobRole: JobRole;
}

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

  async getJobRoleById(id: number, token: string): Promise<JobRole> {
    const { data } = await axios.get<JobRole>(
      `${API_BASE_URL}/api/job-roles/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
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

  async checkApplicationStatus(
    jobRoleId: string,
    token: string,
  ): Promise<boolean> {
    try {
      const response = await axios.get<{ hasApplied: boolean }>(
        `${API_BASE_URL}/api/applications/status/${jobRoleId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return response.data.hasApplied;
    } catch (error: unknown) {
      console.error(
        `Error checking application status for job role ${jobRoleId}:`,
        error,
      );
      return false; // Default to allowing application on error
    }
  }
}
