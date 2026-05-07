/*
  Warnings:

  - Added the required column `email` to the `query` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "query" ADD COLUMN     "email" TEXT NOT NULL;
