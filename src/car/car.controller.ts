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
  Req,
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

  // --- Car Management ---

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photos', maxCount: 10 }]))
  @ResponseMessage('Car created successfully')
  async createCar(
    @Req() req: any,
    @Body() data: any,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
  ) {
    return this.carService.createCar(req.user.id, data, files);
  }

  @Get('my-cars')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER)
  @ResponseMessage('Your cars fetched successfully')
  async getMyCars(@Req() req: any) {
    return this.carService.getDriverCars(req.user.id);
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ResponseMessage('All cars fetched successfully')
  async getAllCars() {
    return this.carService.getAllCars();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ResponseMessage('Car fetched successfully')
  async getCarById(@Param('id') id: string, @Req() req: any) {
    const isAdmin =
      req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN;
    return this.carService.getCarById(id, req.user.id, isAdmin);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'photos', maxCount: 10 }]))
  @ResponseMessage('Car updated successfully')
  async updateCar(
    @Param('id') id: string,
    @Req() req: any,
    @Body() data: any,
    @UploadedFiles() files: { photos?: Express.Multer.File[] },
  ) {
    const isAdmin =
      req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN;
    return this.carService.updateCar(id, req.user.id, data, files, isAdmin);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.DRIVER, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ResponseMessage('Car deleted successfully')
  async deleteCar(@Param('id') id: string, @Req() req: any) {
    const isAdmin =
      req.user.role === UserRole.ADMIN || req.user.role === UserRole.SUPER_ADMIN;
    await this.carService.deleteCar(id, req.user.id, isAdmin);
    return null;
  }
}
