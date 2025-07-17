/*
  Warnings:

  - You are about to drop the `ReferralTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReferralTransaction" DROP CONSTRAINT "fk_referral_referred";

-- DropForeignKey
ALTER TABLE "ReferralTransaction" DROP CONSTRAINT "fk_referral_referrer";

-- DropTable
DROP TABLE "ReferralTransaction";
