import { Controller, Get, Patch, Body, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('user')
@UseGuards(RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.userService.getProfile(req.user.id);
  }

  @Patch('profile')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(
    @Req() req: any,
    @Body() body: { data?: string },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.updateProfile(req.user.id, req.user.role, body.data, file);
  }
}
