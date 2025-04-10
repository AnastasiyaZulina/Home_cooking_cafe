import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';
import { z } from 'zod';
import { OrderFormSchema } from '@/app/admin/schemas/order-form-schema';
import { createPayment, sendEmail } from '@/shared/lib';
import { OrderCreatedTemplate, PayOrderTemplate } from '@/shared/components';
import { decrementProductStockAdmin } from '@/app/admin/lib/functions';
import { chooseAndSendEmail } from '@/shared/lib/choose-and-send-email';

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
      comment,
    } = parsed;

    // Создаём заказ
    const createdOrder = await prisma.order.create({
      data: {
        userId,
        name,
        email,
        phone,
        address,
        deliveryType,
        paymentMethod,
        deliveryCost: deliveryPrice || 0,
        paymentId,
        status,
        deliveryTime,
        bonusDelta,
        comment,
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

    // Обновляем бонусы пользователя
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          bonusBalance: {
            increment: bonusDelta,
          },
        },
      });
    }

    // Рассчитываем общую стоимость
    const totalAmount = items.reduce(
      (sum, item) => sum + (item.productPrice * item.quantity),
      0
    );


    // Отправка писем
    if (createdOrder.paymentMethod === 'OFFLINE') {
      chooseAndSendEmail(createdOrder, totalAmount);
      await sendEmail(
        createdOrder.email,
        `Скатерть-самобранка | Заказ #${createdOrder.id} принят`,
        Promise.resolve(OrderCreatedTemplate({
          orderId: createdOrder.id,
        }))
      );
    } else {
      const paymentData = await createPayment({
        amount: totalAmount + (createdOrder.deliveryCost || 0),
        orderId: createdOrder.id,
        description: 'Оплата заказа #' + createdOrder.id,
      });

      if (!paymentData) {
        throw new Error('Payment data not found');
      }

      await prisma.order.update({
        where: {
          id: createdOrder.id,
        },
        data: {
          paymentId: paymentData.id,
        },
      });

      const paymentUrl = paymentData.confirmation.confirmation_url;

      chooseAndSendEmail(createdOrder, totalAmount, paymentUrl);

      await sendEmail(
        createdOrder.email,
        `Скатерть-самобранка | Оплатите заказ #${createdOrder.id}`,
        Promise.resolve(PayOrderTemplate({
          orderId: createdOrder.id,
          totalPrice: totalAmount + (createdOrder.deliveryCost || 0),
          paymentUrl
        }))
      );
    }

    

    await decrementProductStockAdmin(
      items.map(({ productId, quantity }) => ({ productId, quantity }))
    );
    return NextResponse.json(createdOrder, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }

    console.error(err);
    return NextResponse.json({ error: 'Ошибка при создании заказа' }, { status: 500 });
  }
}

