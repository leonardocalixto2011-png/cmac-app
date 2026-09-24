-- CreateEnum
CREATE TYPE "DropStatus" AS ENUM ('OPEN', 'CLOSED', 'ORDERED', 'SHIPPED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "dropId" TEXT;

-- CreateTable
CREATE TABLE "Drop" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "ordersOn" TIMESTAMP(3) NOT NULL,
    "status" "DropStatus" NOT NULL DEFAULT 'OPEN',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Drop_code_key" ON "Drop"("code");

-- CreateIndex
CREATE INDEX "Drop_status_closesAt_idx" ON "Drop"("status", "closesAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "Drop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

