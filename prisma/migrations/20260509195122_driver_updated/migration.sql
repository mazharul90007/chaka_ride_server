/*
  Warnings:

  - You are about to drop the column `vehicleType` on the `driver` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "driver" DROP COLUMN "vehicleType",
ADD COLUMN     "vehicleCategoryId" TEXT;

-- AddForeignKey
ALTER TABLE "driver" ADD CONSTRAINT "driver_vehicleCategoryId_fkey" FOREIGN KEY ("vehicleCategoryId") REFERENCES "car_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
