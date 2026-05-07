import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { auth } from '../src/auth/auth.lib';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const superAdminEmail = "superadmin@gmail.com";

  const existingUser = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingUser) {
    console.log("Seeding Super Admin...");

    // Create the user via Better Auth API
    await auth.api.signUpEmail({
      body: {
        email: superAdminEmail,
        password: "pass123456",
        name: "Super Admin",
      },
    });

    // Update the role to SUPER_ADMIN and verify email
    // We use 'as any' here to bypass IDE type-caching issues with Prisma 7 enums
    await prisma.user.update({
      where: { email: superAdminEmail },
      data: {
        role: "SUPER_ADMIN",
        emailVerified: true,
      } as any,
    });

    console.log("Super Admin seeded successfully.");
  } else {
    console.log("Super Admin already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
