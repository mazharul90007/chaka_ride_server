import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { QueryModule } from './query/query.module';
import { DriverModule } from './driver/driver.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CarModule } from './car/car.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    QueryModule,
    DriverModule,
    AdminModule,
    MailModule,
    CloudinaryModule,
    CarModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
