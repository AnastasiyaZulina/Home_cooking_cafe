import { prisma } from '@/prisma/prisma-client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role === "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const feedback = await prisma.feedback.findUnique({
      where: { id: Number(id) },
      include: { user: true }
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Отзыв не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role === "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    // Валидация данных
    if (!body.feedbackStatus || !['PENDING', 'APPROVED', 'REJECTED'].includes(body.feedbackStatus)) {
      return NextResponse.json(
        { error: "Некорректный статус отзыва" },
        { status: 400 }
      );
    }

    const updatedFeedback = await prisma.feedback.update({
      where: { id: Number(id) },
      data: {
        feedbackText: body.feedbackText,
        feedbackStatus: body.feedbackStatus,
        isVisible: Boolean(body.isVisible)
      },
      include: { user: true }
    });

    return NextResponse.json(updatedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json(
      { error: "Ошибка обновления отзыва" },
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
  
  if (!session?.user || session.user.role === "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.feedback.delete({
      where: { id: Number(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { error: "Отзыв не найден или не может быть удален" },
      { status: 404 }
    );
  }
}