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
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { email: true, name: true }
      },
      items: true
    }
  });

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orderData = await request.json();

  try {
    const newOrder = await prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: orderData.items
        }
      },
      include: { items: true }
    });

    return NextResponse.json(newOrder);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при создании заказа" },
      { status: 500 }
    );
  }
}