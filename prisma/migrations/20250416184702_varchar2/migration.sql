/*
  Warnings:

  - You are about to alter the column `name` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "name" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "image" SET DATA TYPE TEXT;
