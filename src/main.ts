import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { IncomingMessage, ServerResponse } from 'node:http';

/** Vercel Functions: allow longer cold starts (DB / Prisma). */
export const maxDuration = 60;

async function createNestExpressApp(): Promise<express.Express> {
  const expressApp = express();
  expressApp.set('trust proxy', 1);
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  app.setGlobalPrefix('api/v1', {
    exclude: ['/'],
  });

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://chaka-ride.vercel.app',
      'https://chaka-ride.vercel.app/en',
      'https://chaka-ride.vercel.app/bn',
    ],
    credentials: true,
  });

  await app.init();
  return expressApp;
}

const isVercel = process.env.VERCEL === '1';

async function bootstrapLocal(): Promise<void> {
  const expressApp = await createNestExpressApp();
  const port = Number(process.env.PORT) || 4000;
  expressApp.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
}

if (!isVercel) {
  void bootstrapLocal();
}

let cachedApp: express.Express;

/** Vercel invokes this with Node `req` / `res` (not AWS Lambda events). */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  if (!cachedApp) {
    cachedApp = await createNestExpressApp();
  }
  cachedApp(req, res);
}
