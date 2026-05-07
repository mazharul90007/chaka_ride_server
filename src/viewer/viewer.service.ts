import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryStatus } from '@prisma/client';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ViewerService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) { }

  async createQuery(data: any) {
    const query = await this.prisma.query.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        whatsAppNumber: data.whatsAppNumber,
        pickupLocation: data.pickupLocation,
        destination: data.destination,
        carCategoryId: data.carCategoryId,
        tripType: data.tripType,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        userId: data.userId || null,
      },
      include: {
        carCategory: true,
      },
    });

    // Send confirmation email
    await this.mailService.sendQueryConfirmation(data.email, query);

    return query;
  }

  async getAllQueries() {
    return this.prisma.query.findMany({
      include: {
        carCategory: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getQueryById(id: string) {
    return this.prisma.query.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, image: true },
        },
        carCategory: true,
      },
    });
  }

  async updateQueryStatus(id: string, status: QueryStatus) {
    return this.prisma.query.update({
      where: { id },
      data: { status },
    });
  }
}
