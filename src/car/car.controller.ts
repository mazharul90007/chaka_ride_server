import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
  Patch,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CarService } from './car.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@Controller('car')
export class CarController {
  constructor(private readonly carService: CarService) { }

  @Post('category')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'categoryIcon', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
  ]))
  @ResponseMessage('Car category created successfully')
  async createCategory(
    @Body() data: any,
    @UploadedFiles() files: { categoryIcon?: Express.Multer.File[], photos?: Express.Multer.File[] }
  ) {
    return this.carService.createCategory(data, files);
  }

  @Get('categories')
  @ResponseMessage('Car categories fetched successfully')
  async getAllCategories() {
    return this.carService.getAllCategories();
  }

  @Get('category/:id')
  @ResponseMessage('Car category fetched successfully')
  async getCategoryById(@Param('id') id: string) {
    return this.carService.getCategoryById(id);
  }

  @Patch('category/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'categoryIcon', maxCount: 1 },
    { name: 'photos', maxCount: 10 },
  ]))
  @ResponseMessage('Car category updated successfully')
  async updateCategory(
    @Param('id') id: string,
    @Body() data: any,
    @UploadedFiles() files: { categoryIcon?: Express.Multer.File[], photos?: Express.Multer.File[] }
  ) {
    return this.carService.updateCategory(id, data, files);
  }

  @Delete('category/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ResponseMessage('Car category has been deleted successfully')
  async deleteCategory(@Param('id') id: string) {
    await this.carService.deleteCategory(id);
    return null;
  }
}
