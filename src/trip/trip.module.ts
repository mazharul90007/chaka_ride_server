import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';

@Module({
  imports: [PrismaModule],
  providers: [TripService],
  controllers: [TripController]
})
export class TripModule {}
