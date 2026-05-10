import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

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

}
