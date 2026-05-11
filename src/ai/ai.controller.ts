import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { AiService } from './ai.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('recommend')
  async recommendVehicle(@Body() tripDetails: {
    pickup: string;
    destination: string;
    passengers: number;
    purpose?: string;
    specialRequirements?: string;
  }) {
    return this.aiService.recommendVehicle(tripDetails);
  }

  @Post('estimate-price')
  async estimateTripPrice(@Body() tripDetails: {
    pickup: string;
    destination: string;
    carCategoryName: string;
    tripType: string;
  }) {
    return this.aiService.estimateTripPrice(tripDetails);
  }

  @Post('suggest-drivers')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  async suggestDrivers(@Body() body: any) {
    return this.aiService.suggestDrivers(body);
  }

  @Get('morning-briefing')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseGuards(RolesGuard)
  async getMorningBriefing() {
    return this.aiService.getMorningBriefing();
  }
}
