import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';

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
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    // Валидация обязательных полей
    if (!body.name || !body.email || !body.phone || !body.deliveryType || !body.paymentMethod) {
      return NextResponse.json(
        { error: "Не заполнены обязательные поля" },
        { status: 400 }
      );
    }

    const newOrder = await prisma.order.create({
      data: {
        status: 'PENDING',
        paymentMethod: body.paymentMethod,
        deliveryType: body.deliveryType,
        deliveryTime: new Date(body.deliveryTime),
        name: body.name,
        email: body.email,
        phone: body.phone,
        comment: body.comment,
        paymentId: body.paymentId,
        items: {
          create: body.items || [],
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}