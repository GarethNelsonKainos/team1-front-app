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
  sharepointUrl?: string;
  openPositions?: number;
  numberOfOpenPositions?: number;
  status?: string;
}
