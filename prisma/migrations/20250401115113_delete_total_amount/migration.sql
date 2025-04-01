/*
  Warnings:

  - You are about to drop the column `totalAmount` on the `Cart` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cart" DROP COLUMN "totalAmount";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "totalAmount";
