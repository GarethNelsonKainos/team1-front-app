import axios from 'axios';
import type { JobRole } from '../models/JobRole';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

export class JobRoleService {
  async getJobRoles(): Promise<JobRole[]> {
    try {
      const response = await axios.get<JobRole[]>(
        `${API_BASE_URL}/api/job-roles`,
      );
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching job roles:', error);
      throw error;
    }
  }

  async getJobRoleById(id: string | number): Promise<JobRole> {
    const mockJobRoles = [
      {
        jobRoleId: 1,
        roleName: 'Software Engineer',
        capability: 'Technical',
        band: 'Intermediate',
        closingDate: '2026-03-01T00:00:00.000Z',
        status: 'Open',
        description: 'Develops and maintains software applications.',
        responsibilities:
          'Write code, review code, participate in agile ceremonies.',
        sharepointUrl: 'https://company.sharepoint.com/software-engineer',
        numberOfOpenPositions: 3,
        location: 'New York',
      },
      {
        jobRoleId: 2,
        roleName: 'Test Engineer',
        capability: 'Quality Assurance',
        band: 'Intermediate',
        closingDate: '2026-04-01T00:00:00.000Z',
        status: 'Open',
        description: 'Ensures the quality of software products.',
        responsibilities: 'Test applications, report bugs, write test cases.',
        sharepointUrl: 'https://company.sharepoint.com/test-engineer',
        numberOfOpenPositions: 2,
        location: 'San Francisco',
      },
      {
        jobRoleId: 3,
        roleName: 'Technical Architect',
        capability: 'Technical',
        band: 'Trainee',
        closingDate: '2026-05-01T00:00:00.000Z',
        status: 'Open',
        description: 'Designs technical solutions and system architecture.',
        responsibilities:
          'Define architecture, review designs, mentor engineers.',
        sharepointUrl: 'https://company.sharepoint.com/technical-architect',
        numberOfOpenPositions: 1,
        location: 'Chicago',
      },
      {
        jobRoleId: 4,
        roleName: 'Low Code Principal Architect',
        capability: 'Low Code',
        band: 'Principal Architect',
        closingDate: '2026-06-01T00:00:00.000Z',
        status: 'Open',
        description: 'Leads low code architecture and strategy.',
        responsibilities:
          'Architect low code solutions, lead teams, ensure best practices.',
        sharepointUrl:
          'https://company.sharepoint.com/low-code-principal-architect',
        numberOfOpenPositions: 1,
        location: 'Remote',
      },
    ];

    const jobRole = mockJobRoles.find((jr) => jr.jobRoleId === Number(id));
    if (!jobRole) throw new Error('Job role not found');
    return jobRole;

    try {
      const response = await axios.get<JobRole>(
        `${API_BASE_URL}/api/job-roles/${id}`,
      );
      return response.data;
    } catch (error: unknown) {
      console.error(`Error fetching job role with id ${id}:`, error);
      throw error;
    }
  }
}
