-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "bonusDelta" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bonusBalance" INTEGER NOT NULL DEFAULT 0;
