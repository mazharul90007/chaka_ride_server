import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(userId: string, data: any) {
    return this.prisma.passenger.upsert({
      where: { userId },
      create: { ...data, userId },
      update: data,
    });
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { passenger: true },
    });
  }
}
