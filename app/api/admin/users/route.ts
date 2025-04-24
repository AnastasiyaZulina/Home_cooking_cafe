import { prisma } from '@/prisma/prisma-client';
import { VerificationUserTemplate } from '@/shared/components';
import { ResetPasswordTemplate } from '@/shared/components/shared/email-templates/reset-password';
import { authOptions } from '@/shared/constants/auth-options';
import { sendEmail } from '@/shared/lib';
import { Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role === "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const whereClause: Prisma.UserWhereInput = {};

    if (session.user.role === 'SUPERADMIN') {
      whereClause.NOT = {
        id: session.user.id
      };
    } else if (session.user.role === 'ADMIN') {
      whereClause.role = 'USER';
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { id: 'asc' },
      include: { verificationCode: true }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role == "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, email, role, bonusBalance, phone, isVerified } = await request.json();

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        bonusBalance,
        phone,
        password: null,
        verified: isVerified ? new Date() : null
      },
    });

    if (isVerified) {
    const token = randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут
    await prisma.passwordResetToken.upsert({
      where: { userId: newUser.id },
      update: {
        token,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        token,
        expiresAt,
        userId: newUser.id,
      },
    });
      const resetLink = `https://skatert-samobranka.shop/reset-password?token=${token}`;
      await sendEmail(newUser.email, 'Скатерть-самобранка | 📝 Сброс пароля', Promise.resolve(ResetPasswordTemplate({ resetLink })));
    }
    else {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      await prisma.verificationCode.create({
        data: {
          code,
          userId: newUser.id,
        },
      });
      await sendEmail(newUser.email, 'Скатерть-самобранка | 📝 Подтверждение регистрации', Promise.resolve(VerificationUserTemplate({ code })));
    }

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: "User creation failed" },
      { status: 400 }
    );
  }
}