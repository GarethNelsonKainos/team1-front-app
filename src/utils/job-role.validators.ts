import { z } from 'zod';
import type { CreateJobRoleRequest } from '../models/CreateJobRoleRequest';

export const createJobRoleSchema = z.object({
  roleName: z
    .string()
    .min(3, 'Role name must be at least 3 characters')
    .max(100, 'Role name cannot exceed 100 characters'),
  capabilityId: z.number().int().positive('Please select a capability'),
  bandId: z.number().int().positive('Please select a band'),
  description: z
    .string()
    .min(10, 'Summary must be at least 10 characters')
    .max(500, 'Summary cannot exceed 500 characters'),
  responsibilities: z
    .string()
    .min(10, 'Responsibilities must be at least 10 characters')
    .max(1000, 'Responsibilities cannot exceed 1000 characters'),
  jobSpecLink: z
    .string()
    .url('Must be a valid URL')
    .startsWith(
      'https://kainossoftwareltd.sharepoint.com',
      'Must be a valid Kainos SharePoint link',
    ),
  openPositions: z
    .number()
    .int()
    .min(1, 'Must have at least 1 open position')
    .max(100, 'Cannot exceed 100 open positions'),
  locationIds: z
    .array(z.number().int().positive())
    .min(1, 'Please select at least one location'),
  closingDate: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate > today;
  }, 'Closing date must be in the future'),
}) satisfies z.ZodType<CreateJobRoleRequest>;

export type CreateJobRoleInput = CreateJobRoleRequest;

export function validateCreateJobRole(data: unknown): CreateJobRoleInput {
  return createJobRoleSchema.parse(data);
}
