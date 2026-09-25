-- AlterEnum
ALTER TYPE "LoyaltyReason" ADD VALUE 'REFERRAL_BONUS';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referralPromoId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "referredById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_referralCode_key" ON "Customer"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_referralPromoId_key" ON "Customer"("referralPromoId");

-- CreateIndex
CREATE INDEX "Order_referredById_idx" ON "Order"("referredById");
