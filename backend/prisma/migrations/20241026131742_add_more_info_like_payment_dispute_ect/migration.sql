/*
  Warnings:

  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `zipCode` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referralCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `condition` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "ProductSize" AS ENUM ('XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'OTHER');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPENED', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "DisputeReason" AS ENUM ('ITEM_NOT_RECEIVED', 'ITEM_NOT_AS_DESCRIBED', 'DAMAGED_ITEM', 'WRONG_ITEM', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'PAYPAL', 'APPLE_PAY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billingAddressId" INTEGER,
ADD COLUMN     "shippingAddressId" INTEGER,
ADD COLUMN     "shippingCost" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "color" TEXT,
ADD COLUMN     "condition" "ProductCondition" NOT NULL,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isNegotiable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isReserved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "size" "ProductSize",
ADD COLUMN     "weight" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "zipCode",
ADD COLUMN     "referralCode" TEXT;

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "provider" "PaymentProvider" NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dispute" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "buyerId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "reason" "DisputeReason" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPENED',
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" SERIAL NOT NULL,
    "referrerId" INTEGER NOT NULL,
    "referredId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referredId_fkey" FOREIGN KEY ("referredId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
