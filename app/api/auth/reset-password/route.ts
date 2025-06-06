import { prisma } from "@/prisma/prisma-client";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { sendEmail } from "@/shared/lib";
import { ResetPasswordTemplate } from "@/shared/components/email-templates/reset-password";


export async function POST(req: Request) {
  const { email } = await req.json();

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false });
    }

    const token = randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 минут

    // Обновляем или создаем новый токен
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: {
        token,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        token,
        expiresAt,
        userId: user.id,
      },
    });

    const resetLink = `https://skatert-samobranka.shop/reset-password?token=${token}`;

    await sendEmail(user.email, 'Скатерть-самобранка | 📝 Сброс пароля', Promise.resolve(ResetPasswordTemplate({ resetLink })));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}