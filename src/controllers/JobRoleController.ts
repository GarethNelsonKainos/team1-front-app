import { Request, Response } from 'express';
import { jobRoleService } from '../services/JobRoleService';

export class JobRoleController {
  async getJobRoles(req: Request, res: Response): Promise<void> {
    try {
      const jobRoles = await jobRoleService.getJobRoles();
      
      res.render('job-role-list', {
        title: 'Available Job Roles',
        jobRoles: jobRoles
      });
    } catch (error) {
      console.error('Error in JobRoleController:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Unable to load job roles. Please try again later.'
      });
    }
  }
}

export const jobRoleController = new JobRoleController();
