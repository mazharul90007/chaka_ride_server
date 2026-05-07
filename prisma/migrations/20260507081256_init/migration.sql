/*
  Warnings:

  - The values [USER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `driver_profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('PASSENGER', 'DRIVER', 'ADMIN', 'SUPER_ADMIN');
ALTER TABLE "public"."user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'PASSENGER';
COMMIT;

-- DropForeignKey
ALTER TABLE "driver_profile" DROP CONSTRAINT "driver_profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_profile" DROP CONSTRAINT "user_profile_userId_fkey";

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'PASSENGER';

-- DropTable
DROP TABLE "driver_profile";

-- DropTable
DROP TABLE "user_profile";

-- CreateTable
CREATE TABLE "passenger" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "licenseNumber" TEXT,
    "vehicleType" TEXT,
    "vehicleModel" TEXT,
    "vehicleNumber" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "passenger_userId_key" ON "passenger"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "driver_userId_key" ON "driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admin_userId_key" ON "admin"("userId");

-- AddForeignKey
ALTER TABLE "passenger" ADD CONSTRAINT "passenger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver" ADD CONSTRAINT "driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
