import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export enum DriverTripResponse {
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export class RespondTripDto {
  @IsEnum(DriverTripResponse)
  action: DriverTripResponse;

  @IsNumber()
  @IsOptional()
  offeredPrice?: number;
}
