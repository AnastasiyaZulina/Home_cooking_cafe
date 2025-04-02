import { prisma } from "@/prisma/prisma-client";
import { getUserSession } from "@/shared/lib/get-user-session";
import { NextRequest, NextResponse } from "next/server";

// PATCH-роут
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Добавляем Promise
) {
  try {
    const { id } = await params;
    const user = await getUserSession();
    const token = req.cookies.get('cartToken')?.value;
    const data = await req.json();

    // Получаем полную информацию о корзине
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: Number(id) },
      include: {
        cart: {
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Элемент не найден' },
        { status: 404 }
      );
    }

    // Проверка прав доступа
    if (
      (user?.id && cartItem.cart.userId !== user.id) ||
      (!user?.id && cartItem.cart.token !== token)
    ) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Обновление элемента
    await prisma.cartItem.update({
      where: { id: Number(id) },
      data: { quantity: data.quantity }
    });

    // Возвращаем полную корзину
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cartItem.cart.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(updatedCart);

  } catch (error) {
    console.error('[CART_PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Добавляем Promise
) {
  try {
    const { id } = await params;
    const user = await getUserSession();
    const token = req.cookies.get('cartToken')?.value;
    const numericId = Number(id);

    // Получаем элемент корзины с информацией о корзине
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: numericId },
      include: {
        cart: {
          include: {
            items: true
          }
        }
      }
    });

    if (!cartItem) {
      return NextResponse.json(
        { error: 'Элемент корзины не найден' },
        { status: 404 }
      );
    }

    // Проверка прав доступа
    if (
      (user?.id && cartItem.cart.userId !== user.id) ||
      (!user?.id && cartItem.cart.token !== token)
    ) {
      return NextResponse.json(
        { error: 'Доступ запрещен' },
        { status: 403 }
      );
    }

    // Удаляем элемент и проверяем корзину в транзакции
    const result = await prisma.$transaction(async (tx) => {
      // Удаляем элемент
      await tx.cartItem.delete({
        where: { id: numericId }
      });

      // Проверяем оставшиеся элементы
      const remainingItems = await tx.cartItem.count({
        where: { cartId: cartItem.cartId }
      });

      // Если корзина пустая - удаляем её
      if (remainingItems === 0) {
        await tx.cart.delete({
          where: { id: cartItem.cartId }
        });
        return null;
      }

      // Возвращаем обновленную корзину
      return tx.cart.findUnique({
        where: { id: cartItem.cartId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    });

    return NextResponse.json(result || { message: 'Корзина удалена' });

  } catch (error) {
    console.error('[CART_DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления' },
      { status: 500 }
    );
  }
}