import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BidStatus, JourneyStatus } from '@prisma/client';

@Injectable()
export class BidService {
  constructor(private prisma: PrismaService) {}

  async createBid(driverId: string, journeyId: string, data: any) {
    // Check if journey exists and is pending
    const journey = await this.prisma.journey.findUnique({
      where: { id: journeyId },
    });

    if (!journey || journey.status !== JourneyStatus.PENDING) {
      throw new ForbiddenException('Cannot bid on this journey');
    }

    return this.prisma.bid.create({
      data: {
        ...data,
        driverId,
        journeyId,
      },
    });
  }

  async getBidsByJourney(journeyId: string) {
    return this.prisma.bid.findMany({
      where: { journeyId },
      include: {
        driver: {
          select: { name: true, image: true, driver: true },
        },
      },
    });
  }

  async selectBid(adminId: string, bidId: string) {
    const bid = await this.prisma.bid.findUnique({
      where: { id: bidId },
      include: { journey: true },
    });

    if (!bid) throw new ForbiddenException('Bid not found');

    // Update journey with selected bid and status
    await this.prisma.journey.update({
      where: { id: bid.journeyId },
      data: {
        selectedBidId: bid.id,
        status: JourneyStatus.ACCEPTED,
      },
    });

    // Update bid status
    return this.prisma.bid.update({
      where: { id: bidId },
      data: { status: BidStatus.ACCEPTED },
    });
  }
}
