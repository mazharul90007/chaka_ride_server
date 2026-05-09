import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) { }

  async updateProfile(userId: string, role: string, dataString?: string, file?: Express.Multer.File) {
    let data: any = {};
    if (dataString) {
      try {
        data = JSON.parse(dataString);
      } catch (e) {
        throw new BadRequestException('Invalid JSON format in data field');
      }
    }

    // Separate base user fields from role-specific fields
    const { name, dob, gender, ...roleData } = data;

    const baseUserData: any = {};
    if (name !== undefined) baseUserData.name = name;
    if (dob !== undefined) baseUserData.dob = new Date(dob);
    if (gender !== undefined) baseUserData.gender = gender;

    // Handle Image Upload
    if (file) {
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { image: true },
      });

      if (existingUser?.image) {
        const publicId = this.cloudinary.extractPublicIdFromUrl(existingUser.image);
        if (publicId) {
          await this.cloudinary.deleteImage(publicId).catch(console.error);
        }
      }

      const uploadResult = await this.cloudinary.uploadImage(file);
      baseUserData.image = uploadResult.secure_url;
    }

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
          // Remove fields that don't exist in Driver model
          const { address, ...driverData } = roleData;
          await tx.driver.upsert({
            where: { userId },
            create: { ...driverData, userId },
            update: driverData,
          });
        } else if (role === 'ADMIN') {
          const { address, ...adminData } = roleData;
          await tx.admin.upsert({
            where: { userId },
            create: { ...adminData, userId },
            update: adminData,
          });
        }
      }

      // Return the updated profile with nested relations
      return tx.user.findUnique({
        where: { id: userId },
        include: {
          passenger: true,
          driver: {
            include: {
              vehicleCategory: true
            }
          },
          admin: true
        },
      });
    });
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        passenger: true,
        driver: {
          include: {
            vehicleCategory: true
          }
        },
        admin: true,
      },
    });
  }
}
