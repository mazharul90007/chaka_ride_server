import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CarService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) { }

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

    // 2. Handle Category Icon upload
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
    } else if (updateData.categoryIcon === null && existing.categoryIcon) {
      // Explicit removal of icon
      const publicId = this.cloudinary.extractPublicIdFromUrl(existing.categoryIcon);
      if (publicId) {
        await this.cloudinary.deleteImage(publicId).catch(console.error);
      }
    }

    // 3. Handle Photos (Differential Update)
    let finalPhotos = existing.photos || [];

    // 3.1 Handle removal of existing photos
    if (updateData.photos !== undefined && Array.isArray(updateData.photos)) {
      const photosToKeep = updateData.photos;
      const photosToDelete = finalPhotos.filter(url => !photosToKeep.includes(url));

      if (photosToDelete.length > 0) {
        const deletePromises = photosToDelete
          .map((url) => this.cloudinary.extractPublicIdFromUrl(url))
          .filter((id): id is string => id !== null)
          .map((publicId) => this.cloudinary.deleteImage(publicId));
        await Promise.all(deletePromises).catch(console.error);
      }
      finalPhotos = photosToKeep;
    }

    // 3.2 Handle new photo uploads
    if (files.photos && files.photos.length > 0) {
      const uploadPromises = files.photos.map((file) =>
        this.cloudinary.uploadImage(file),
      );
      const photoResults = await Promise.all(uploadPromises);
      const newPhotoUrls = photoResults.map((res) => res.secure_url);
      finalPhotos = [...finalPhotos, ...newPhotoUrls];
    }

    updateData.photos = finalPhotos;

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

  // --- Car Management ---

  async createCar(
    userId: string,
    body: { data: string },
    files: { photos?: Express.Multer.File[] },
  ) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(body.data);
    } catch (e) {
      throw new BadRequestException('Invalid JSON format in data field');
    }

    const photoUrls: string[] = [];
    if (files.photos && files.photos.length > 0) {
      const uploadPromises = files.photos.map((file) =>
        this.cloudinary.uploadImage(file),
      );
      const photoResults = await Promise.all(uploadPromises);
      photoResults.forEach((res) => photoUrls.push(res.secure_url));
    }

    return this.prisma.car.create({
      data: {
        model: parsedData.model,
        modelBn: parsedData.modelBn,
        year: parsedData.year,
        yearBn: parsedData.yearBn,
        description: parsedData.description,
        descriptionBn: parsedData.descriptionBn,
        registrationNumber: parsedData.registrationNumber,
        engineNumber: parsedData.engineNumber,
        chassisNumber: parsedData.chassisNumber,
        color: parsedData.color,
        colorBn: parsedData.colorBn,
        photos: photoUrls,
        driverId: driver.id,
        categoryId: parsedData.categoryId,
        status: 'PENDING',
      },
    });
  }

  async getDriverCars(userId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId },
    });

    if (!driver) {
      throw new BadRequestException('Driver profile not found');
    }

    return this.prisma.car.findMany({
      where: { driverId: driver.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllCars() {
    return this.prisma.car.findMany({
      include: {
        category: true,
        driver: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCarById(id: string, userId: string, isAdmin: boolean) {
    const car = await this.prisma.car.findUnique({
      where: { id },
      include: { category: true, driver: true },
    });

    if (!car) {
      throw new BadRequestException('Car not found');
    }

    if (!isAdmin) {
      const driver = await this.prisma.driver.findUnique({
        where: { userId },
      });
      if (!driver || car.driverId !== driver.id) {
        throw new BadRequestException('You do not have permission to view this car');
      }
    }

    return car;
  }

  async updateCar(
    id: string,
    userId: string,
    body: { data: string },
    files: { photos?: Express.Multer.File[] },
    isAdmin: boolean,
  ) {
    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new BadRequestException('Car not found');
    }

    if (!isAdmin) {
      const driver = await this.prisma.driver.findUnique({
        where: { userId },
      });
      if (!driver || car.driverId !== driver.id) {
        throw new BadRequestException('You do not have permission to update this car');
      }
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(body.data);
    } catch (e) {
      throw new BadRequestException('Invalid JSON format in data field');
    }

    const updateData: any = { ...parsedData };

    // Security: Drivers cannot change driverId or status
    if (!isAdmin) {
      delete updateData.driverId;
      delete updateData.status;
    }

    // Handle Photos (Differential Update)
    let finalPhotos = car.photos || [];

    // 1. Handle removal of existing photos
    // If the user provides a list of photos to keep (remainingPhotos), 
    // we delete the ones that are no longer in that list.
    if (parsedData.photos !== undefined && Array.isArray(parsedData.photos)) {
      const photosToKeep = parsedData.photos;
      const photosToDelete = finalPhotos.filter(url => !photosToKeep.includes(url));

      if (photosToDelete.length > 0) {
        const deletePromises = photosToDelete
          .map((url) => this.cloudinary.extractPublicIdFromUrl(url))
          .filter((id): id is string => id !== null)
          .map((publicId) => this.cloudinary.deleteImage(publicId));
        await Promise.all(deletePromises).catch(console.error);
      }
      finalPhotos = photosToKeep;
    }

    // 2. Handle new photo uploads
    if (files.photos && files.photos.length > 0) {
      const uploadPromises = files.photos.map((file) =>
        this.cloudinary.uploadImage(file),
      );
      const photoResults = await Promise.all(uploadPromises);
      const newPhotoUrls = photoResults.map((res) => res.secure_url);
      finalPhotos = [...finalPhotos, ...newPhotoUrls];
    }

    updateData.photos = finalPhotos;

    // Filter out fields that don't exist in the model if any
    const finalUpdate: any = {};
    const allowedFields = [
      'model',
      'modelBn',
      'year',
      'yearBn',
      'description',
      'descriptionBn',
      'registrationNumber',
      'engineNumber',
      'chassisNumber',
      'color',
      'colorBn',
      'photos',
      'categoryId',
      'status',
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        finalUpdate[field] = updateData[field];
      }
    });

    return this.prisma.car.update({
      where: { id },
      data: finalUpdate,
    });
  }

  async deleteCar(id: string, userId: string, isAdmin: boolean) {
    const car = await this.prisma.car.findUnique({
      where: { id },
    });

    if (!car) {
      throw new BadRequestException('Car not found');
    }

    if (!isAdmin) {
      const driver = await this.prisma.driver.findUnique({
        where: { userId },
      });
      if (!driver || car.driverId !== driver.id) {
        throw new BadRequestException('You do not have permission to delete this car');
      }
    }

    // Delete photos from Cloudinary
    if (car.photos && car.photos.length > 0) {
      const deletePromises = car.photos
        .map((url) => this.cloudinary.extractPublicIdFromUrl(url))
        .filter((id): id is string => id !== null)
        .map((publicId) => this.cloudinary.deleteImage(publicId));
      await Promise.all(deletePromises).catch(console.error);
    }

    return this.prisma.car.delete({
      where: { id },
    });
  }
}
