import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class StatusGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Only drivers have a status check for now
    if (user.role === UserRole.DRIVER) {
      const driver = await this.prisma.driver.findUnique({
        where: { userId: user.id },
      });

      if (!driver || driver.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException(
          'Your driver account is not active. Please wait for admin approval.',
        );
      }
    }

    return true;
  }
}
