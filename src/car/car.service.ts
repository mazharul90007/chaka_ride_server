import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CarService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async createCategory(
    body: { data: string },
    files: { categoryIcon?: Express.Multer.File[]; photos?: Express.Multer.File[] },
  ) {
    let categoryIconUrl = '';
    const photoUrls: string[] = [];

    // 1. Parse the stringified JSON data
    let parsedData: any;
    try {
      parsedData = JSON.parse(body.data);
    } catch (e) {
      throw new BadRequestException('Invalid JSON format in data field');
    }

    // 2. Upload Category Icon
    if (files.categoryIcon && files.categoryIcon[0]) {
      const iconResult = await this.cloudinary.uploadImage(files.categoryIcon[0]);
      categoryIconUrl = iconResult.secure_url;
    }

    // 3. Upload Photos
    if (files.photos && files.photos.length > 0) {
      const uploadPromises = files.photos.map((file) =>
        this.cloudinary.uploadImage(file),
      );
      const photoResults = await Promise.all(uploadPromises);
      photoResults.forEach((res) => photoUrls.push(res.secure_url));
    }

    // 4. Create in Database
    return this.prisma.carCategory.create({
      data: {
        categoryName: parsedData.categoryName,
        categoryNameBn: parsedData.categoryNameBn,
        description: parsedData.description,
        descriptionBn: parsedData.descriptionBn,
        seat: parsedData.seat,
        seatBn: parsedData.seatBn,
        luggage: parsedData.luggage,
        luggageBn: parsedData.luggageBn,
        ac: parsedData.ac,
        acBn: parsedData.acBn,
        fuel: parsedData.fuel,
        fuelBn: parsedData.fuelBn,
        features: parsedData.features || [],
        categoryIcon: categoryIconUrl || null,
        photos: photoUrls,
      },
    });
  }

  async getAllCategories() {
    return this.prisma.carCategory.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCategory(
    id: string,
    body: { data?: string },
    files: {
      categoryIcon?: Express.Multer.File[];
      photos?: Express.Multer.File[];
    } = {},
  ) {
    const existing = await this.prisma.carCategory.findUnique({ where: { id } });
    if (!existing) {
      throw new BadRequestException('Category not found');
    }

    let updateData: any = {};

    // 1. Parse stringified JSON data if provided
    if (body.data) {
      try {
        const parsedData = JSON.parse(body.data);
        updateData = { ...parsedData };
      } catch (e) {
        throw new BadRequestException('Invalid JSON format in data field');
      }
    }

    // 2. Handle new Category Icon upload
    if (files.categoryIcon && files.categoryIcon[0]) {
      // Delete old icon from Cloudinary
      if (existing.categoryIcon) {
        const publicId = this.cloudinary.extractPublicIdFromUrl(
          existing.categoryIcon,
        );
        if (publicId) {
          await this.cloudinary.deleteImage(publicId).catch(console.error);
        }
      }
      const iconResult = await this.cloudinary.uploadImage(
        files.categoryIcon[0],
      );
      updateData.categoryIcon = iconResult.secure_url;
    }

    // 3. Handle new Photos upload
    if (files.photos && files.photos.length > 0) {
      // Delete old photos from Cloudinary
      if (existing.photos && existing.photos.length > 0) {
        const deletePromises = existing.photos
          .map((url) => this.cloudinary.extractPublicIdFromUrl(url))
          .filter((id): id is string => id !== null)
          .map((publicId) => this.cloudinary.deleteImage(publicId));
        await Promise.all(deletePromises).catch(console.error);
      }

      const uploadPromises = files.photos.map((file) =>
        this.cloudinary.uploadImage(file),
      );
      const photoResults = await Promise.all(uploadPromises);
      const newPhotoUrls = photoResults.map((res) => res.secure_url);

      // Replace old photos with new ones
      updateData.photos = newPhotoUrls;
    }

    // 4. Map fields to database schema to ensure only valid fields are updated
    const finalUpdate: any = {
      categoryName: updateData.categoryName,
      categoryNameBn: updateData.categoryNameBn,
      description: updateData.description,
      descriptionBn: updateData.descriptionBn,
      seat: updateData.seat,
      seatBn: updateData.seatBn,
      luggage: updateData.luggage,
      luggageBn: updateData.luggageBn,
      ac: updateData.ac,
      acBn: updateData.acBn,
      fuel: updateData.fuel,
      fuelBn: updateData.fuelBn,
      features: updateData.features,
      categoryIcon: updateData.categoryIcon,
      photos: updateData.photos,
    };

    // Filter out undefined fields
    const cleanUpdateData = Object.fromEntries(
      Object.entries(finalUpdate).filter(([_, v]) => v !== undefined),
    );

    return this.prisma.carCategory.update({
      where: { id },
      data: cleanUpdateData,
    });
  }

  async getCategoryById(id: string) {
    return this.prisma.carCategory.findUnique({
      where: { id },
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.carCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    // 1. Collect all images to delete
    const urlsToDelete = [...(category.photos || [])];
    if (category.categoryIcon) {
      urlsToDelete.push(category.categoryIcon);
    }

    // 2. Delete images from Cloudinary
    const deletePromises = urlsToDelete
      .map((url) => this.cloudinary.extractPublicIdFromUrl(url))
      .filter((id): id is string => id !== null)
      .map((publicId) => this.cloudinary.deleteImage(publicId));

    await Promise.all(deletePromises).catch((err) => {
      console.error('Failed to delete some images from Cloudinary:', err);
    });

    // 3. Delete from Database
    return this.prisma.carCategory.delete({
      where: { id },
    });
  }
}
