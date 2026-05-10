import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { CarModule } from '../car/car.module';

@Module({
  imports: [CarModule],
  controllers: [AiController],
  providers: [AiService],
})
export class AiModule {}
