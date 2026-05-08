import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { auth } from '../auth.lib';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();

    // Get session from Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      throw new UnauthorizedException('You are not authorized');
    }

    const user = session.user;

    // Check if email is verified
    if (!user.emailVerified) {
      throw new ForbiddenException('Email verification required');
    }

    // Check if the user's role (string) is in the required roles list
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role as string)) {
        throw new ForbiddenException(
          'Forbidden! You do not have permission to access this resource',
        );
      }
    }

    // Attach user to request for further use
    request.user = user;

    return true;
  }
}
