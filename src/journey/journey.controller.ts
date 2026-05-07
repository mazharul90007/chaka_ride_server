import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { JourneyService } from './journey.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('journey')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.PASSENGER)
  async createJourney(@Req() req: any, @Body() data: any) {
    return this.journeyService.createJourney(req.user.id, data);
  }

  @Get()
  async getAllJourneys() {
    return this.journeyService.getAllJourneys();
  }

  @Get(':id')
  async getJourneyById(@Param('id') id: string) {
    return this.journeyService.getJourneyById(id);
  }
}
