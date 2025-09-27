-- DropIndex
DROP INDEX "public"."readings_status_createdAt_idx";

-- CreateIndex
CREATE INDEX "readings_status_idx" ON "public"."readings"("status");
