import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/prisma-client';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role === "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
