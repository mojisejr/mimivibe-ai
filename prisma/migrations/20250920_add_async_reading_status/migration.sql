-- CreateEnum
CREATE TYPE "reading_status" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- AlterTable
ALTER TABLE "readings" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "processingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "processingStartedAt" TIMESTAMP(3),
ADD COLUMN     "status" "reading_status" NOT NULL DEFAULT 'completed';

-- CreateIndex
CREATE INDEX "readings_status_idx" ON "readings"("status");

-- CreateIndex
CREATE INDEX "readings_userId_status_idx" ON "readings"("userId", "status");