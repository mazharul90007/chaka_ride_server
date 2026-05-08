import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async updateProfile(userId: string, role: string, data: any) {
    // Separate base user fields from role-specific fields
    const { name, dob, gender, image, ...roleData } = data;

    const baseUserData: any = {};
    if (name !== undefined) baseUserData.name = name;
    if (dob !== undefined) baseUserData.dob = new Date(dob);
    if (gender !== undefined) baseUserData.gender = gender;
    if (image !== undefined) baseUserData.image = image;

    // Security: Prevent updating sensitive fields
    delete roleData.id;
    delete roleData.userId;
    delete roleData.status; // Prevent drivers from self-approving
    delete roleData.role;
    delete roleData.email;
    delete roleData.emailVerified;

    return this.prisma.$transaction(async (tx) => {
      // 1. Update base User table if there are base fields provided
      if (Object.keys(baseUserData).length > 0) {
        await tx.user.update({
          where: { id: userId },
          data: baseUserData,
        });
      }

      // 2. Update role-specific table if there are role fields provided
      if (Object.keys(roleData).length > 0) {
        if (role === 'PASSENGER') {
          await tx.passenger.upsert({
            where: { userId },
            create: { ...roleData, userId },
            update: roleData,
          });
        } else if (role === 'DRIVER') {
          await tx.driver.upsert({
            where: { userId },
            create: { ...roleData, userId },
            update: roleData,
          });
        } else if (role === 'ADMIN') {
          await tx.admin.upsert({
            where: { userId },
            create: { ...roleData, userId },
            update: roleData,
          });
        }
      }

      // Return the updated profile with nested relations
      return tx.user.findUnique({
        where: { id: userId },
        include: { passenger: true, driver: true, admin: true },
      });
    });
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        passenger: true,
        driver: true,
        admin: true,
      },
    });
  }
}
