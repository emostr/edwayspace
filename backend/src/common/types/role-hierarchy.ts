import { Role } from '@prisma/client';

const RANK: Record<Role, number> = {
  STUDENT: 1,
  TRUSTED_STUDENT: 2,
  TEACHER: 3,
  CLASS_HEAD: 4,
  ZAVUCH: 5,
  SUPERADMIN: 6,
};

export const roleRank = (role: Role): number => RANK[role];

export const roleSatisfies = (actual: Role, required: Role): boolean =>
  roleRank(actual) >= roleRank(required);

export const roleSatisfiesAny = (actual: Role, required: Role[]): boolean =>
  required.some((r) => roleSatisfies(actual, r));
