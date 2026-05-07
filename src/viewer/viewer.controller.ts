import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
} from '@nestjs/common';
import { ViewerService } from './viewer.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, QueryStatus } from '@prisma/client';

@Controller('viewer')
export class ViewerController {
  constructor(private readonly viewerService: ViewerService) { }

  @Post('query')
  async createQuery(@Body() data: any) {
    return this.viewerService.createQuery(data);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAllQueries() {
    return this.viewerService.getAllQueries();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getQueryById(@Param('id') id: string) {
    return this.viewerService.getQueryById(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: QueryStatus,
  ) {
    return this.viewerService.updateQueryStatus(id, status);
  }
}
