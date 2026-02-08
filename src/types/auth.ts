import { UserRole } from '@prisma/client/index';

export type AuthUser = {
  id: string;
  role: UserRole;
  isActive: boolean;
};
