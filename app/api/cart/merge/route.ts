// app/api/cart/merge/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/shared/constants/auth-options';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const { cartToken } = await req.json();

    console.log('Merge request received. Session:', session?.user?.id);
    console.log('Cart token:', cartToken);
    console.log('мы в merge');

    if (!session?.user?.id || !cartToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  
    try {
      const result = await prisma.$transaction(async (tx) => {
        const guestCart = await tx.cart.findUnique({
          where: { token: cartToken },
          include: { items: true }
        });
  
        if (!guestCart) return null;
  
        // Всегда удаляем старую пользовательскую корзину
        await tx.cart.deleteMany({
          where: { userId: session.user.id }
        });
  console.log('Deleted existing user carts');
        // Привязываем гостевую корзину
        return tx.cart.update({
          where: { id: guestCart.id },
          data: {
            userId: session.user.id,
            token: null
          },
          include: { items: true }
        });
      });
    console.log('Cart updated:');
      return NextResponse.json(result);
  
    } catch (error) {
      console.error('[CART_MERGE] Error:', error);
      return NextResponse.json(
        { error: 'Merge failed' },
        { status: 500 }
      );
    }
  }