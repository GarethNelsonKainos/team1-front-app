import type { UserRole } from './UserRole';

export default interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  userRole: UserRole;
}
