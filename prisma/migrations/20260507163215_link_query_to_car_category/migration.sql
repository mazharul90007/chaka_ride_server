/*
  Warnings:

  - You are about to drop the column `carType` on the `query` table. All the data in the column will be lost.
  - Added the required column `carCategoryId` to the `query` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "query" DROP COLUMN "carType",
ADD COLUMN     "carCategoryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "query" ADD CONSTRAINT "query_carCategoryId_fkey" FOREIGN KEY ("carCategoryId") REFERENCES "car_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
