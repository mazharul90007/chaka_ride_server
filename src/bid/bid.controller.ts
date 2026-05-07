import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Patch,
} from '@nestjs/common';
import { BidService } from './bid.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StatusGuard } from '../auth/guards/status.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('bid')
@UseGuards(RolesGuard)
export class BidController {
  constructor(private readonly bidService: BidService) {}

  @Post(':journeyId')
  @UseGuards(StatusGuard)
  @Roles(UserRole.DRIVER)
  async createBid(
    @Req() req: any,
    @Param('journeyId') journeyId: string,
    @Body() data: any,
  ) {
    return this.bidService.createBid(req.user.id, journeyId, data);
  }

  @Get('journey/:journeyId')
  @Roles(UserRole.PASSENGER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getBidsByJourney(@Param('journeyId') journeyId: string) {
    return this.bidService.getBidsByJourney(journeyId);
  }

  @Patch('select/:bidId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async selectBid(@Req() req: any, @Param('bidId') bidId: string) {
    return this.bidService.selectBid(req.user.id, bidId);
  }
}
