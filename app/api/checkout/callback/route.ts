import { PaymentCallbackData } from "@/@types/yookassa";
import { prisma } from "@/prisma/prisma-client";
import { chooseAndSendEmail } from "@/shared/components/shared/email-templates/choose-and-send-email";
import { OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as PaymentCallbackData;

        const order = await prisma.order.findFirst({
            where: { id: Number(body.object.metadata.order_id) },
            include: { items: true }, // Включаем связанные OrderItem
          });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' });
        };

        const isSucceeded = body.object.status === 'succeeded';

        const updatedOrder = await prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                status: isSucceeded ? OrderStatus.SUCCEEDED : OrderStatus.CANCELLED,
            },
            include: { items: true },
        });

        const items = order?.items || [];
        
        const totalAmount = items.reduce(
            (sum, item) => sum + (item.productPrice * item.productQuantity),
            0
          );

        if (isSucceeded) { 
            chooseAndSendEmail(updatedOrder, totalAmount);
        }
        else {
            for (const item of updatedOrder.items) {
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
            chooseAndSendEmail(updatedOrder, totalAmount);
        }
    } catch (error) {
        console.log('[Checkout Callback] Error', error);
        return NextResponse.json({ error: 'Server error' });
    }
    return new Response(null, {
        status: 200,
      });
}