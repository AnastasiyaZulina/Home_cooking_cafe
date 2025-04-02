import { PaymentCallbackData } from "@/@types/yookassa";
import { updateProductStock } from "@/app/actions";
import { prisma } from "@/prisma/prisma-client";
import { OrderSuccessTemplate } from "@/shared/components/shared/email-templates/order-success";
import { sendEmail } from "@/shared/lib";
import { OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as PaymentCallbackData;
        const cartId = Number(body.object.metadata.cartId);

        const order = await prisma.order.findFirst({
            where: { id: Number(body.object.metadata.order_id) },
            include: { items: true }, // Включаем связанные OrderItem
          });

        if (!order) {
            return NextResponse.json({ error: 'Order not found' });
        };

        const isSucceeded = body.object.status === 'succeeded';

        await prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                status: isSucceeded ? OrderStatus.SUCCEEDED : OrderStatus.CANCELLED,
            },
        });

        const items = order?.items || [];
        
        const html = Promise.resolve(OrderSuccessTemplate({
            orderId: order.id,
            items: items.map((item: { 
              productName: string; 
              productPrice: number; 
              productQuantity: number 
            }) => ({
              productName: item.productName,
              productPrice: item.productPrice,
              productQuantity: item.productQuantity,
            })),
        }));

        if (isSucceeded) { 
            await updateProductStock(cartId);
            await sendEmail(order.email, 'Скатерть-самобранка / Ваш заказ оплачен!', html);
        }
        else {
            return NextResponse.json({ error: 'Server error' });
        }
    } catch (error) {
        console.log('[Checkout Callback] Error', error);
        return NextResponse.json({ error: 'Server error' });
    }
    return new Response(null, {
        status: 200,
      });
}