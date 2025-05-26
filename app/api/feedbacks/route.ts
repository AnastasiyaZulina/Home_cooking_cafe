import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';
import { Prisma } from '@prisma/client';
import { FeedbackFormSchema } from '@/shared/schemas/feedback';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isVisible = searchParams.get('isVisible');
    const feedbackStatus = searchParams.get('feedbackStatus');

    const where: Prisma.FeedbackWhereInput = {};
    
    if (isVisible !== null) {
      where.isVisible = isVisible === 'true';
    }
    if (feedbackStatus) {
      where.feedbackStatus = feedbackStatus as Prisma.EnumFeedbackStatusFilter; // Cast to enum type
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
  if (!session?.user?.id || session.user.role !== 'USER') {
    return NextResponse.json(
      { error: "Для отправки отзыва необходимо авторизоваться как пользователь" },
      { status: 401 }
    );
  }

  try {
    const rawData = await request.json();
    
    const validationResult = FeedbackFormSchema.safeParse(rawData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }

    const { feedbackText } = validationResult.data;

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