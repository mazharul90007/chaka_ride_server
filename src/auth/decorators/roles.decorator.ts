import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
// Use string array to avoid stale Prisma type issues in IDE
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
