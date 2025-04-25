import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isVisible = searchParams.get('isVisible');
    const feedbackStatus = searchParams.get('feedbackStatus');

    const where: any = {};
    if (isVisible !== null) {
      where.isVisible = isVisible === 'true';
    }
    if (feedbackStatus) {
      where.feedbackStatus = feedbackStatus;
    }

    const feedbacks = await prisma.feedback.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Проверка авторизации
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Для отправки отзыва необходимо авторизоваться" },
      { status: 401 }
    );
  }

  try {
    const { feedbackText } = await request.json();

    const newFeedback = await prisma.feedback.create({
      data: { 
        feedbackText,
        userId: Number(session.user.id),
        feedbackStatus: 'PENDING',
        isVisible: false
      },
    });

    return NextResponse.json(newFeedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    return NextResponse.json(
      { error: "Не удалось отправить отзыв" },
      { status: 500 }
    );
  }
}