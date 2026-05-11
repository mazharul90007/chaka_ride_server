import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { jwt } from 'better-auth/plugins';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  baseURL: process.env.VERCEL === '1' 
    ? (process.env.BETTER_AUTH_URL || `https://${process.env.VERCEL_URL}/api/v1/auth`)
    : (process.env.BETTER_AUTH_URL || 'http://localhost:4000/api/v1/auth'),
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    'http://localhost:3000', 
    'https://chaka-ride.vercel.app',
    'https://chaka-ride-client.vercel.app',
    'https://chaka-ride-server.vercel.app'
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'PASSENGER',
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user.role === 'PASSENGER') {
            await prisma.passenger.create({
              data: { userId: user.id },
            });
          } else if (user.role === 'DRIVER') {
            await prisma.driver.create({
              data: { userId: user.id },
            });
          } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
            await prisma.admin.create({
              data: { userId: user.id },
            });
          }
        },
      },
    },
  },
  plugins: [jwt()],
});
