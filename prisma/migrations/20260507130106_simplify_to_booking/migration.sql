/*
  Warnings:

  - You are about to drop the `bid` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `journey` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONTACTED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- DropForeignKey
ALTER TABLE "bid" DROP CONSTRAINT "bid_driverId_fkey";

-- DropForeignKey
ALTER TABLE "bid" DROP CONSTRAINT "bid_journeyId_fkey";

-- DropForeignKey
ALTER TABLE "journey" DROP CONSTRAINT "journey_userId_fkey";

-- AlterTable
ALTER TABLE "driver" ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "bid";

-- DropTable
DROP TABLE "journey";

-- DropEnum
DROP TYPE "BidStatus";

-- DropEnum
DROP TYPE "JourneyStatus";

-- CreateTable
CREATE TABLE "booking" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "whatsAppNumber" TEXT NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "carType" TEXT NOT NULL,
    "tripType" "TripType" NOT NULL DEFAULT 'ONE_WAY',
    "pickupDate" TEXT NOT NULL,
    "pickupTime" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jwks" (
    "id" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "privateKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jwks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
