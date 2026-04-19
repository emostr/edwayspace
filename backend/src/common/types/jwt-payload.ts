import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  schoolId: string | null;
  role: Role;
  classId: string | null;
}

export interface AuthenticatedUser extends JwtPayload {}
