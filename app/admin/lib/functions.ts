import { prisma } from '@/prisma/prisma-client';

type OrderItemInput = {
  productId: number;
  quantity: number;
};

export async function decrementProductStockAdmin(items: OrderItemInput[]) {
  for (const item of items) {
    try {
      const updatedProduct = await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
        select: {
          id: true,
          stockQuantity: true,
        },
      });

      if (updatedProduct.stockQuantity < 0) {
        throw new Error(
          `Ошибка: остаток товара (ID: ${item.productId}) стал отрицательным после вычитания. Проверь начальные данные.`
        );
      }

      if (updatedProduct.stockQuantity === 0) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            isAvailable: false,
          },
        });
      }

    } catch (err) {
      console.error(`Не удалось обновить товар с ID: ${item.productId}`, err);
      throw new Error(`Ошибка обновления склада для товара ${item.productId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
