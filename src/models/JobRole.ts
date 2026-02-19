export enum JobRoleStatus {
  Open = 1,
  Closed = 2,
}

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
  status?: number;
}
