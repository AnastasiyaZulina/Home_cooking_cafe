import { PaymentCallbackData } from "@/@types/yookassa";
import { prisma } from "@/prisma/prisma-client";
import { OrderSuccessTemplate } from "@/shared/components/shared/email-templates/order-success";
import { sendEmail } from "@/shared/lib";
import { CartItemDTO } from "@/shared/services/dto/cart.dto";
import { OrderStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
    name: string;
  }

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as PaymentCallbackData;

        const order = await prisma.order.findFirst({
            where: {
                id: Number(body.object.metadata.order_id),
            },
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

        const items: CartItemDTO[] = JSON.parse(order?.items as string).map((item: OrderItem) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            name: item.name
        }));

        //const items = order?.items as any as CartItemDTO[];
        
        const html = Promise.resolve(OrderSuccessTemplate({
            orderId: order.id,
            items,
        }));

        if (isSucceeded) { await sendEmail(order.email, 'Скатерть-самобранка / Ваш заказ оплачен!', html); console.log('Оплата удалась');}
        else {
            console.log('Оплата не удалась');
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