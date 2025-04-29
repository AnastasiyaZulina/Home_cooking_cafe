import { PaymentCallbackData } from "@/@types/yookassa";
import { prisma } from "@/prisma/prisma-client";
import { chooseAndSendEmail } from "@/shared/components/email-templates/choose-and-send-email";
import { OrderStatus } from "@prisma/client";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import CIDRMatcher from 'cidr-matcher';

const YOOKASSA_CIDRS = [
  '185.71.76.0/27',
  '185.71.77.0/27',
  '77.75.153.0/25',
  '77.75.156.11/32',
  '77.75.156.35/32',
  '77.75.154.128/25',
  '2a02:5180::/32'
];

const matcher = new CIDRMatcher(YOOKASSA_CIDRS);

export async function POST(req: NextRequest) {
    try {
      const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0].trim();

      if (!clientIP || !matcher.contains(clientIP)) {
        console.error('Invalid IP:', clientIP);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

        const body = (await req.json()) as PaymentCallbackData;
        const paymentId = body.object.id;

        const { data: yookassaPayment } = await axios.get(
          `https://api.yookassa.ru/v3/payments/${paymentId}`,
          {
            auth: {
              username: process.env.YOOKASSA_SHOP_ID!,
              password: process.env.YOOKASSA_API_KEY!,
            }
          }
        );

        if (body.object.status !== yookassaPayment.status) {
          console.error('Status mismatch:', {
            webhookStatus: body.object.status,
            apiStatus: yookassaPayment.status
          });
          return NextResponse.json({ error: 'Status mismatch' }, { status: 400 });
        }

        const order = await prisma.order.findFirst({
            where: { id: Number(body.object.metadata.order_id) },
            include: { items: true },
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
              if (item.productId){
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