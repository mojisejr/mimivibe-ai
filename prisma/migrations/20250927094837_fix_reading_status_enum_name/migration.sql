/*
  Warnings:

  - The `status` column on the `readings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ReadingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- DropIndex
DROP INDEX "public"."readings_status_idx";

-- AlterTable
ALTER TABLE "public"."readings" ALTER COLUMN "answer" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."ReadingStatus" NOT NULL DEFAULT 'COMPLETED';

-- DropEnum
DROP TYPE "public"."reading_status";

-- CreateIndex
CREATE INDEX "readings_status_createdAt_idx" ON "public"."readings"("status", "createdAt");

-- CreateIndex
CREATE INDEX "readings_userId_status_idx" ON "public"."readings"("userId", "status");
