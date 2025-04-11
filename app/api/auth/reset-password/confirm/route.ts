import { prisma } from "@/prisma/prisma-client";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  try {
    // 1. Найти токен в базе
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    // 2. Проверка валидности
    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Недействительный или просроченный токен" },
        { status: 400 }
      );
    }

    // 3. Хеширование пароля
    const hashedPassword = await hash(password, 10);

    // 4. Обновление пользователя
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // 5. Удаление токена
    await prisma.passwordResetToken.delete({ 
      where: { id: resetToken.id } 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}