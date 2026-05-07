import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, UserStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('drivers')
  async getAllDrivers() {
    return this.adminService.getAllDrivers();
  }

  @Get('passengers')
  async getAllPassengers() {
    return this.adminService.getAllPassengers();
  }

  @Get('admins')
  async getAllAdmins() {
    return this.adminService.getAllAdmins();
  }

  @Patch('driver/:id/status')
  async updateDriverStatus(
    @Param('id') driverId: string,
    @Body('status') status: UserStatus,
  ) {
    return this.adminService.updateDriverStatus(driverId, status);
  }
}
