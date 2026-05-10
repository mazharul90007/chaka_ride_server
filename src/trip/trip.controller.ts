import { Controller, Post, Get, Patch, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { RespondTripDto } from './dto/respond-trip.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, TripStatus } from '@prisma/client';

@Controller('trip')
@UseGuards(RolesGuard)
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async createTrip(@Body() createTripDto: CreateTripDto) {
    return this.tripService.createTrip(createTripDto);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async getAllTripsAdmin(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.tripService.getAllTripsAdmin(
      parseInt(page, 10),
      parseInt(limit, 10),
      search,
      (status === 'ALL' ? undefined : status) as TripStatus,
    );
  }

  @Patch(':id/approve-driver/:requestId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async approveDriver(
    @Param('id') tripId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.tripService.approveDriver(tripId, requestId);
  }

  @Patch(':id/reject-bid/:requestId')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  async rejectBid(
    @Param('id') tripId: string,
    @Param('requestId') requestId: string,
  ) {
    return this.tripService.rejectDriverBid(tripId, requestId);
  }

  @Get('driver')
  @Roles(UserRole.DRIVER)
  async getDriverTrips(@Request() req) {
    // Note: Depends on how auth puts user on req. Adjust if it's req.user.id
    return this.tripService.getDriverTrips(req.user.id);
  }

  @Patch('request/:requestId/respond')
  @Roles(UserRole.DRIVER)
  async respondToTripRequest(
    @Request() req,
    @Param('requestId') requestId: string,
    @Body() respondDto: RespondTripDto,
  ) {
    return this.tripService.respondToTripRequest(req.user.id, requestId, respondDto);
  }

  @Get('passenger')
  @Roles(UserRole.PASSENGER)
  async getPassengerTrips(@Request() req) {
    return this.tripService.getPassengerTrips(req.user.id);
  }
}
