/*
  Warnings:

  - You are about to drop the `booking` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "QueryStatus" AS ENUM ('PENDING', 'CONTACTED', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "booking" DROP CONSTRAINT "booking_userId_fkey";

-- DropTable
DROP TABLE "booking";

-- DropEnum
DROP TYPE "BookingStatus";

-- CreateTable
CREATE TABLE "query" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "whatsAppNumber" TEXT NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "carType" TEXT NOT NULL,
    "tripType" "TripType" NOT NULL DEFAULT 'ONE_WAY',
    "pickupDate" TEXT NOT NULL,
    "pickupTime" TEXT NOT NULL,
    "status" "QueryStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "query_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "query" ADD CONSTRAINT "query_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
