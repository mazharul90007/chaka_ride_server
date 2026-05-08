import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async updateDriverStatus(driverId: string, status: UserStatus) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return this.prisma.driver.update({
      where: { id: driverId },
      data: { status },
    });
  }

  async getAllDrivers() {
    return this.prisma.driver.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            emailVerified: true,
          },
        },
      },
    });
  }

  async getAllPassengers() {
    return this.prisma.passenger.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            emailVerified: true,
          },
        },
      },
    });
  }

  async getAllAdmins() {
    return this.prisma.admin.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
            emailVerified: true,
          },
        },
      },
    });
  }

  async getStats() {
    const [totalDrivers, totalPassengers, totalCarCategories, pendingDrivers] =
      await Promise.all([
        this.prisma.driver.count(),
        this.prisma.passenger.count(),
        this.prisma.carCategory.count(),
        this.prisma.driver.count({ where: { status: 'PENDING' } }),
      ]);

    return {
      totalDrivers,
      totalPassengers,
      totalCars: totalCarCategories, // Mapping categories to cars for the UI
      pendingDrivers,
    };
  }
}
