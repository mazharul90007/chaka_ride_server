import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsUUID } from 'class-validator';
import { TripType } from '@prisma/client';

export class CreateTripDto {
  @IsString()
  fullName: string;

  @IsString()
  whatsAppNumber: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  pickupLocation: string;

  @IsString()
  destination: string;

  @IsEnum(TripType)
  @IsOptional()
  tripType?: TripType;

  @IsString()
  pickupDate: string;

  @IsString()
  pickupTime: string;

  @IsString()
  @IsUUID()
  carCategoryId: string;

  @IsNumber()
  @IsOptional()
  requestedPrice?: number;

  @IsString()
  @IsOptional()
  @IsUUID()
  passengerId?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  driverIds: string[];
}
