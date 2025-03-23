-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('PICKUP', 'DELIVERY');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryCost" DOUBLE PRECISION,
ADD COLUMN     "deliveryTime" TIMESTAMP(3),
ADD COLUMN     "deliveryType" "DeliveryType" NOT NULL DEFAULT 'DELIVERY',
ALTER COLUMN "address" DROP NOT NULL;
