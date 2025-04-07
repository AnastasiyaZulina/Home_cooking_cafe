import { prisma } from '@/prisma/prisma-client';
import { authOptions } from '@/shared/constants/auth-options';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
        where: {
          verified: { not: null }
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          bonusBalance: true
        },
        orderBy: { id: 'desc' }
      });

    return NextResponse.json(users);
}