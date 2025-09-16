/*
  Warnings:

  - You are about to drop the `RequestLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserLimit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_login_campaigns` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserLimit" DROP CONSTRAINT "UserLimit_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."daily_login_campaigns" DROP CONSTRAINT "daily_login_campaigns_userId_fkey";

-- DropTable
DROP TABLE "public"."RequestLog";

-- DropTable
DROP TABLE "public"."UserLimit";

-- DropTable
DROP TABLE "public"."daily_login_campaigns";
