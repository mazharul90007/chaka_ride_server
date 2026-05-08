import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
