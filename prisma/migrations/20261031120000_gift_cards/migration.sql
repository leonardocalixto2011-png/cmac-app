-- CreateEnum
CREATE TYPE "GiftCardStatus" AS ENUM ('PENDING', 'ACTIVE', 'USED', 'CANCELLED');

-- CreateTable
CREATE TABLE "GiftCard" (
    "id" TEXT NOT NULL,
    "status" "GiftCardStatus" NOT NULL DEFAULT 'PENDING',
    "amountCents" INTEGER NOT NULL,
    "balanceCents" INTEGER NOT NULL,
    "code" TEXT,
    "stripePromotionCodeId" TEXT,
    "buyerEmail" TEXT,
    "buyerName" TEXT,
    "fromName" TEXT,
    "toName" TEXT,
    "toEmail" TEXT,
    "message" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "sendAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "receiptSentAt" TIMESTAMP(3),
    "balanceNoticeTo" TEXT,
    "uses" JSONB NOT NULL DEFAULT '[]',
    "stripeCheckoutSessionId" TEXT,
    "stripePaymentIntentId" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GiftCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_code_key" ON "GiftCard"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GiftCard_stripePromotionCodeId_key" ON "GiftCard"("stripePromotionCodeId");

-- CreateIndex
CREATE INDEX "GiftCard_status_idx" ON "GiftCard"("status");
