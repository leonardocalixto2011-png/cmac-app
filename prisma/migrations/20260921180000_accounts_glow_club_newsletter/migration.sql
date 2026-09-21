-- Customer accounts + Glow Club loyalty ledger + CASL newsletter (double opt-in, campaigns) + rate limits.
-- Hand-written from `prisma migrate diff`; the Subscriber backfill keeps existing rows as PENDING.

-- CreateEnum
CREATE TYPE "LoyaltyReason" AS ENUM ('ORDER_CREDIT', 'ORDER_REVERSAL', 'REDEEM', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "RewardKind" AS ENUM ('POINTS', 'BIRTHDAY');

-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM ('PENDING', 'CONFIRMED', 'UNSUBSCRIBED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discountCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "newsletterOptIn" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "birthDay" INTEGER,
ADD COLUMN     "birthMonth" INTEGER,
ADD COLUMN     "birthdayRewardYear" INTEGER,
ADD COLUMN     "lifetimeSpendCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Subscriber" ADD COLUMN     "confirmToken" TEXT,
ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "consentAt" TIMESTAMP(3),
ADD COLUMN     "consentSource" TEXT,
ADD COLUMN     "consentText" TEXT,
ADD COLUMN     "status" "SubscriberStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "unsubscribeToken" TEXT,
ADD COLUMN     "unsubscribedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Existing subscribers never confirmed (no double opt-in existed): they stay PENDING (column default)
-- and are kept. Record what they agreed to, give each a one-click unsubscribe token.
UPDATE "Subscriber"
SET "unsubscribeToken" = replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
    "consentAt" = "createdAt",
    "consentSource" = 'legacy',
    "consentText" = 'By joining you agree to receive emails from CMAC Beauty. Unsubscribe any time.'
WHERE "unsubscribeToken" IS NULL;

ALTER TABLE "Subscriber" ALTER COLUMN "unsubscribeToken" SET NOT NULL;

-- CreateTable
CREATE TABLE "LoyaltyEntry" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT,
    "points" INTEGER NOT NULL,
    "spendCents" INTEGER NOT NULL DEFAULT 0,
    "reason" "LoyaltyReason" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoyaltyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardCode" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "kind" "RewardKind" NOT NULL,
    "code" TEXT NOT NULL,
    "stripePromotionCodeId" TEXT NOT NULL,
    "amountOffCents" INTEGER,
    "percentOff" INTEGER,
    "pointsSpent" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "redeemedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "subjectEn" TEXT NOT NULL,
    "subjectFr" TEXT NOT NULL,
    "preheaderEn" TEXT,
    "preheaderFr" TEXT,
    "bodyEn" TEXT NOT NULL,
    "bodyFr" TEXT NOT NULL,
    "productSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'SENDING',
    "recipients" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "LoyaltyEntry_customerId_createdAt_idx" ON "LoyaltyEntry"("customerId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyEntry_orderId_reason_key" ON "LoyaltyEntry"("orderId", "reason");

-- CreateIndex
CREATE UNIQUE INDEX "RewardCode_code_key" ON "RewardCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RewardCode_stripePromotionCodeId_key" ON "RewardCode"("stripePromotionCodeId");

-- CreateIndex
CREATE INDEX "RewardCode_customerId_idx" ON "RewardCode"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_confirmToken_key" ON "Subscriber"("confirmToken");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_unsubscribeToken_key" ON "Subscriber"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "Subscriber_status_idx" ON "Subscriber"("status");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyEntry" ADD CONSTRAINT "LoyaltyEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyEntry" ADD CONSTRAINT "LoyaltyEntry_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardCode" ADD CONSTRAINT "RewardCode_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

