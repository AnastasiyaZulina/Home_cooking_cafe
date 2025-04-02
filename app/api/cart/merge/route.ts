// app/api/cart/merge/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { getUserSession } from '@/shared/lib/get-user-session';

export async function POST(req: Request) {
  console.log('[MERGE] Starting merge process...');
  const user = await getUserSession();
  const { cartToken } = await req.json();
  console.log('[MERGE] cartToken:', cartToken);
  console.log('[MERGE] Session user ID:', user?.id);
  if (!user?.id || !cartToken) {
    return NextResponse.json(
      { error: 'Неверные параметры' },
      { status: 400 }
    );
  }

  try {
    console.log('[MERGE] Starting merge process...');
    const result = await prisma.$transaction(async (tx) => {
      const [userCart, guestCart] = await Promise.all([
        tx.cart.findUnique({ where: { userId: user.id } }),
        tx.cart.findUnique({
          where: { token: cartToken },
          include: { items: true }
        })
      ]);

      if (!guestCart) return null;

      // Сценарий 1: Удаляем гостевую корзину
      if (userCart) {
        await tx.cartItem.deleteMany({ where: { cartId: guestCart.id } });
        await tx.cart.delete({ where: { id: guestCart.id } });
        return userCart;
      }

      // Сценарий 2: Привязываем корзину
      return tx.cart.update({
        where: { id: guestCart.id },
        data: {
          userId: user.id,
          token: null
        },
        include: { items: true }
      });
    });
    console.log('[MERGE] Cart merged successfully');
    return NextResponse.json(result);

  } catch (error) {
    console.error('[CART_MERGE] Error:', error);
    return NextResponse.json(
      { error: 'Merge failed' },
      { status: 500 }
    );
  }
}