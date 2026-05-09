import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { QueryService } from './query.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, QueryStatus } from '@prisma/client';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@Controller('query')
export class QueryController {
  constructor(private readonly queryService: QueryService) { }

  @Post('create')
  @ResponseMessage('Query created successfully')
  async createQuery(@Body() data: any) {
    return this.queryService.createQuery(data);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ResponseMessage('All queries fetched successfully')
  async getAllQueries() {
    return this.queryService.getAllQueries();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ResponseMessage('Query details fetched successfully')
  async getQueryById(@Param('id') id: string) {
    return this.queryService.getQueryById(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ResponseMessage('Query status updated successfully')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: QueryStatus,
  ) {
    return this.queryService.updateQueryStatus(id, status);
  }

  @Delete('bulk-delete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ResponseMessage('Queries deleted successfully')
  async bulkDelete(@Body('ids') ids: string[]) {
    return this.queryService.bulkDeleteQueries(ids);
  }
}
