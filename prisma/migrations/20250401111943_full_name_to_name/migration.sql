/*
  Warnings:

  - You are about to drop the column `fullName` on the `Order` table. All the data in the column will be lost.
  - You are about to alter the column `deliveryCost` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - Added the required column `name` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "fullName",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "deliveryCost" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fullName",
ADD COLUMN     "name" TEXT NOT NULL;
