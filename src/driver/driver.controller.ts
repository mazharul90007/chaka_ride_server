import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { DriverService } from './driver.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('driver')
@UseGuards(RolesGuard)
@Roles(UserRole.DRIVER)
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.driverService.getProfile(req.user.id);
  }

  @Post('profile')
  async updateProfile(@Req() req: any, @Body() data: any) {
    return this.driverService.updateProfile(req.user.id, data);
  }
}
