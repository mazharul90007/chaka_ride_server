import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { RespondTripDto, DriverTripResponse } from './dto/respond-trip.dto';
import { TripStatus, TripRequestStatus } from '@prisma/client';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) {}

  async createTrip(createTripDto: CreateTripDto) {
    const { driverIds, ...tripData } = createTripDto;

    let finalPassengerId = tripData.passengerId;

    // Auto-link to existing user if email is provided
    if (!finalPassengerId && tripData.email) {
      const user = await this.prisma.user.findUnique({
        where: { email: tripData.email }
      });
      if (user) {
        finalPassengerId = user.id;
      }
    }

    // Create the trip and the initial requests for drivers in a transaction
    return this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          ...tripData,
          passengerId: finalPassengerId,
          status: TripStatus.PENDING,
          driverRequests: {
            create: driverIds.map((driverId) => ({
              driverId,
              status: TripRequestStatus.PENDING,
            })),
          },
        },
        include: {
          driverRequests: true,
        },
      });

      return trip;
    });
  }

  // Admin: View all trips
  async getAllTripsAdmin(page: number = 1, limit: number = 10, search?: string, status?: TripStatus) {
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { pickupLocation: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.trip.findMany({
        where,
        skip,
        take: limit,
        include: {
          passenger: { select: { name: true, email: true, passenger: { select: { phone: true } } } },
          finalDriver: { include: { user: { select: { name: true } } } },
          carCategory: { select: { categoryName: true } },
          driverRequests: {
            include: {
              driver: {
                include: { 
                  user: { select: { name: true, email: true, image: true, dob: true, gender: true } },
                  vehicleCategory: { select: { categoryName: true } }
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Admin: Approve a driver's bid
  async approveDriver(tripId: string, tripRequestId: string) {
    return this.prisma.$transaction(async (tx) => {
      const tripRequest = await tx.tripRequest.findUnique({
        where: { id: tripRequestId },
      });

      if (!tripRequest || tripRequest.tripId !== tripId) {
        throw new NotFoundException('Trip request not found or does not belong to this trip');
      }

      if (tripRequest.status !== TripRequestStatus.ACCEPTED) {
        throw new BadRequestException('Can only approve drivers who have accepted the trip');
      }

      // Update the approved request
      await tx.tripRequest.update({
        where: { id: tripRequestId },
        data: { status: TripRequestStatus.APPROVED },
      });

      // Cancel all other requests for this trip
      await tx.tripRequest.updateMany({
        where: {
          tripId,
          id: { not: tripRequestId },
        },
        data: { status: TripRequestStatus.CANCELLED },
      });

      // Update the main trip status and final driver
      const updatedTrip = await tx.trip.update({
        where: { id: tripId },
        data: {
          status: TripStatus.ASSIGNED,
          finalDriverId: tripRequest.driverId,
          finalPrice: tripRequest.offeredPrice,
        },
        include: {
          finalDriver: { include: { user: { select: { name: true } } } },
          passenger: { select: { name: true, passenger: { select: { phone: true } } } },
        },
      });

      return updatedTrip;
    });
  }

  // Admin: Reject a driver's bid (Send back to driver to bid again)
  async rejectDriverBid(tripId: string, tripRequestId: string) {
    const tripRequest = await this.prisma.tripRequest.findUnique({
      where: { id: tripRequestId },
    });

    if (!tripRequest || tripRequest.tripId !== tripId) {
      throw new NotFoundException('Trip request not found or does not belong to this trip');
    }

    if (tripRequest.status !== TripRequestStatus.ACCEPTED) {
      throw new BadRequestException('Can only reject drivers who have an active bid (Accepted status)');
    }

    return this.prisma.tripRequest.update({
      where: { id: tripRequestId },
      data: { 
        status: TripRequestStatus.PENDING,
        offeredPrice: null 
      },
    });
  }

  // Driver: View assigned trip requests (Pending & Accepted by them)
  async getDriverTrips(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      throw new NotFoundException('Driver profile not found');
    }

    // Get trip requests that are PENDING or ACCEPTED by this driver
    // For PENDING/ACCEPTED requests, hide passenger details.
    // Also include finalized trips where this driver is the final driver.

    const pendingRequests = await this.prisma.tripRequest.findMany({
      where: {
        driverId: driver.id,
        status: { in: [TripRequestStatus.PENDING, TripRequestStatus.ACCEPTED] },
      },
      include: {
        trip: {
          select: {
            id: true,
            pickupLocation: true,
            destination: true,
            tripType: true,
            pickupDate: true,
            pickupTime: true,
            requestedPrice: true,
            status: true,
            carCategory: { select: { categoryName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const finalizedTrips = await this.prisma.trip.findMany({
      where: {
        finalDriverId: driver.id,
        status: { in: [TripStatus.ASSIGNED, TripStatus.COMPLETED] },
      },
      include: {
        passenger: { select: { name: true, email: true, passenger: { select: { phone: true } } } },
        carCategory: { select: { categoryName: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return {
      requests: pendingRequests,
      finalized: finalizedTrips,
    };
  }

  // Driver: Respond to a trip request (Accept + Price, or Reject)
  async respondToTripRequest(userId: string, requestId: string, respondDto: RespondTripDto) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) throw new NotFoundException('Driver not found');

    const tripRequest = await this.prisma.tripRequest.findUnique({
      where: { id: requestId },
      include: { trip: true },
    });

    if (!tripRequest || tripRequest.driverId !== driver.id) {
      throw new NotFoundException('Trip request not found');
    }

    if (tripRequest.trip.status !== TripStatus.PENDING) {
      throw new BadRequestException('This trip is no longer pending');
    }

    if (respondDto.action === DriverTripResponse.REJECTED) {
      return this.prisma.tripRequest.update({
        where: { id: requestId },
        data: { status: TripRequestStatus.REJECTED },
      });
    }

    if (respondDto.action === DriverTripResponse.ACCEPTED) {
      return this.prisma.tripRequest.update({
        where: { id: requestId },
        data: {
          status: TripRequestStatus.ACCEPTED,
          offeredPrice: respondDto.offeredPrice || tripRequest.trip.requestedPrice,
        },
      });
    }
  }

  // Passenger: View their finalized trips
  async getPassengerTrips(userId: string) {
    return this.prisma.trip.findMany({
      where: {
        passengerId: userId,
        status: { in: [TripStatus.ASSIGNED, TripStatus.COMPLETED] },
      },
      include: {
        finalDriver: {
          include: {
            user: { select: { name: true } },
            cars: true, // Maybe just the first active car
          },
        },
        carCategory: { select: { categoryName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
