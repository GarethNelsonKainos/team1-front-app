export interface JobRole {
  jobRoleId: number;
  roleName: string;
  location: string;
  capability: string;
  band: string;
  closingDate: string;
  description?: string;
  responsibilities?: string;
  jobSpecLink?: string;
  openPositions?: number;
  status?: string;
}
