import { prisma } from '@/prisma/prisma-client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';
import { chooseAndSendEmail } from '@/shared/components/shared/email-templates/choose-and-send-email';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role == "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('error:', error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role == "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.orderItem.deleteMany({
      where: { orderId: Number(id) },
    });

    await prisma.order.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('error:', error);
    return NextResponse.json(
      { error: "Order not found or could not be deleted" },
      { status: 404 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role == "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
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
      comment,
      items,
    } = body;

    interface OrderItem {
      productId: number;
      productName: string;
      quantity: number;
      productPrice: number;
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(id) },
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
          deleteMany: {},
          create: items.map((item: OrderItem) => ({
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

    const totalAmount = items.reduce(
      (sum: number, item: { productPrice: number; quantity: number }) => sum + (item.productPrice * item.quantity),
      0
    );

    chooseAndSendEmail(updatedOrder, totalAmount);
    if (updatedOrder.status === 'CANCELLED') {
      // Возврат товаров в наличие при отмене заказа
      for (const item of updatedOrder.items) {
        if (item.productId) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                increment: item.productQuantity,
              },
              isAvailable: true,
            },
          });
        }
      }
      if (updatedOrder.userId && updatedOrder.bonusDelta !== 0) {
        await prisma.user.update({
          where: { id: updatedOrder.userId },
          data: {
            bonusBalance: {
              decrement: updatedOrder.bonusDelta,
            },
          },
        });
      }
    } else {
      // Обработка изменений в бонусах
      const bonusDeltaDiff = bonusDelta - existingOrder.bonusDelta;
      if (userId && bonusDeltaDiff !== 0) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            bonusBalance: {
              increment: bonusDeltaDiff,
            },
          },
        });
      }

      // Обработка изменений в количестве товаров
      const oldItemsMap = new Map<number, number>();
      for (const item of existingOrder.items) {
        if (item.productId) {
          oldItemsMap.set(item.productId, item.productQuantity);
        }
      }

      // Обновляем количество для новых и измененных товаров
      for (const newItem of updatedOrder.items) {
        if (newItem.productId) {
          const oldQty = oldItemsMap.get(newItem.productId) || 0;
          const diff = newItem.productQuantity - oldQty;

          if (diff !== 0) {
            const updatedProduct = await prisma.product.update({
              where: { id: newItem.productId },
              data: {
                stockQuantity: {
                  decrement: diff,
                },
              },
              select: {
                stockQuantity: true,
              },
            });

            if (updatedProduct.stockQuantity === 0) {
              await prisma.product.update({
                where: { id: newItem.productId },
                data: {
                  isAvailable: false,
                },
              });
            }
          }

          oldItemsMap.delete(newItem.productId);
        }
      }

      // Возвращаем в наличие удаленные товары
      for (const [productId, quantity] of oldItemsMap.entries()) {
        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: {
            stockQuantity: {
              increment: quantity,
            },
            isAvailable: true, // мы точно знаем, что он доступен, если количество увеличилось
          },
          select: {
            stockQuantity: true,
          },
        });

        if (updatedProduct.stockQuantity === 0) {
          await prisma.product.update({
            where: { id: productId },
            data: {
              isAvailable: false,
            },
          });
        }
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (err) {
    console.error('Error updating order:', err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}