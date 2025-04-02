/*
  Warnings:

  - You are about to drop the column `token` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cart" ALTER COLUMN "token" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "token";
