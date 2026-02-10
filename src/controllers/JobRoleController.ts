import {Application, Request, Response} from 'express';
import { JobRoleService } from "../services/JobRoleService";

export default function JobRoleController(app: Application, jobRoleService: JobRoleService) {
  app.get('/job-roles', async (_req: Request, res: Response) => {
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
    }});

}