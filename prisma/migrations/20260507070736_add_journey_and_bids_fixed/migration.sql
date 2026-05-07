-- CreateEnum
CREATE TYPE "TripType" AS ENUM ('ONE_WAY', 'ROUND_TRIP');

-- CreateEnum
CREATE TYPE "JourneyStatus" AS ENUM ('PENDING', 'ACCEPTED', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "user_profile" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "driver_profile" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "licenseNumber" TEXT,
    "vehicleType" TEXT,
    "vehicleModel" TEXT,
    "vehicleNumber" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "driver_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journey" (
    "id" TEXT NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "tripType" "TripType" NOT NULL DEFAULT 'ONE_WAY',
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "pickupTime" TEXT NOT NULL,
    "fare" DOUBLE PRECISION,
    "isNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "otherDetails" TEXT,
    "status" "JourneyStatus" NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "selectedBidId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "journey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bid" (
    "id" TEXT NOT NULL,
    "bidAmount" DOUBLE PRECISION NOT NULL,
    "message" TEXT,
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "journeyId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bid_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_userId_key" ON "user_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "driver_profile_userId_key" ON "driver_profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "journey_selectedBidId_key" ON "journey"("selectedBidId");

-- AddForeignKey
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "driver_profile" ADD CONSTRAINT "driver_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journey" ADD CONSTRAINT "journey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bid" ADD CONSTRAINT "bid_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bid" ADD CONSTRAINT "bid_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
