import { Module } from '@nestjs/common';
import { ViewerService } from './viewer.service';
import { ViewerController } from './viewer.controller';

@Module({
  providers: [ViewerService],
  controllers: [ViewerController],
})
export class ViewerModule {}
