import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id: Number(params.id) },
    include: {
      user: {
        select: { email: true, name: true }
      },
      items: true
    }
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status, ...updateData } = await request.json();

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: Number(params.id) },
      data: {
        status,
        ...updateData
      },
      include: { items: true }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json(
      { error: "Order update failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Сначала удаляем связанные элементы заказа
    await prisma.orderItem.deleteMany({
      where: { orderId: Number(params.id) }
    });

    // Затем удаляем сам заказ
    await prisma.order.delete({
      where: { id: Number(params.id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Order not found or could not be deleted" },
      { status: 404 }
    );
  }
}