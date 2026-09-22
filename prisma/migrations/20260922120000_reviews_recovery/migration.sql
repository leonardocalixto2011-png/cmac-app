-- Reviews (verified buyers, moderated) + abandoned-checkout reminder + review request tracking

CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "Order" ADD COLUMN "recoveryEmailSentAt" TIMESTAMP(3),
ADD COLUMN "reviewToken" TEXT,
ADD COLUMN "reviewRequestSentAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "Order_reviewToken_key" ON "Order"("reviewToken");

ALTER TABLE "Customer" ADD COLUMN "reviewEmailsOptOut" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productSlug" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "incentivized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Review_orderId_productSlug_key" ON "Review"("orderId", "productSlug");
CREATE INDEX "Review_productSlug_status_idx" ON "Review"("productSlug", "status");

ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
