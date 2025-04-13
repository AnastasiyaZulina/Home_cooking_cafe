import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role === "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const feedbacks = await prisma.feedback.findMany({
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