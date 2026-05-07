import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JourneyStatus, TripType } from '@prisma/client';

@Injectable()
export class JourneyService {
  constructor(private prisma: PrismaService) {}

  async createJourney(userId: string, data: any) {
    return this.prisma.journey.create({
      data: {
        ...data,
        userId,
        pickupDate: new Date(data.pickupDate),
      },
    });
  }

  async getAllJourneys() {
    return this.prisma.journey.findMany({
      where: { status: JourneyStatus.PENDING },
      include: {
        user: {
          select: { name: true, image: true },
        },
        _count: {
          select: { bids: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getJourneyById(id: string) {
    return this.prisma.journey.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, image: true, passenger: true },
        },
        bids: {
          include: {
            driver: {
              select: { name: true, image: true, driver: true },
            },
          },
        },
      },
    });
  }
}
