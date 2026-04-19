import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../types/jwt-payload';

@Injectable()
export class SuperadminRouteGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) return true;

    const path: string = request.route?.path ?? request.url ?? '';
    if (user.role === Role.SUPERADMIN && !path.startsWith('/superadmin')) {
      throw new ForbiddenException('Superadmin can only access /superadmin routes');
    }

    return true;
  }
}
