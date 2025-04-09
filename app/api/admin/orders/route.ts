import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';
import { z } from 'zod';
import { OrderFormSchema } from '@/app/admin/schemas/order-form-schema';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    include: {
      items: true,
    },
    orderBy: { id: 'desc' },
  });

  return NextResponse.json(orders);
}


export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = OrderFormSchema.parse(body);

    const {
      userId,
      name,
      email,
      phone,
      address,
      deliveryType,
      paymentMethod,
      deliveryPrice,
      paymentId,
      status,
      deliveryTime,
      bonusDelta,
      items,
    } = parsed;

    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          name,
          email,
          phone,
          address,
          deliveryType,
          paymentMethod,
          deliveryCost: deliveryPrice,
          paymentId,
          status,
          deliveryTime,
          bonusDelta,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              productQuantity: item.quantity,
              productPrice: item.productPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      if (userId) {
        await tx.user.update({
          where: { id: userId },
          data: {
            bonusBalance: {
              increment: bonusDelta,
            },
          },
        });
      }

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return order;
    });

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }

    console.error(err);
    return NextResponse.json({ error: 'Ошибка при создании заказа' }, { status: 500 });
  }
}
