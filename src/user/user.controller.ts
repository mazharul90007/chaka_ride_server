import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('user')
@UseGuards(RolesGuard)
@Roles(UserRole.PASSENGER)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.userService.getProfile(req.user.id);
  }

  @Post('profile')
  async updateProfile(@Req() req: any, @Body() data: any) {
    return this.userService.updateProfile(req.user.id, data);
  }
}
