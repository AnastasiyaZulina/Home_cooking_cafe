import { prisma } from "@/prisma/prisma-client";
import { authOptions } from "@/shared/constants/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
interface UpdateData {
  name?: string;
  email?: string;
  role?: 'USER' | 'ADMIN' | 'SUPERADMIN';
  bonusBalance?: number;
  phone?: string | null;
  verified?: Date | null;
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role == "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Запрещаем удаление своего аккаунта
    if (Number(id) === session.user.id) {
      return NextResponse.json(
        { error: "Нельзя удалить свой аккаунт" },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: "User not found or could not be deleted" },
      { status: 500 }
    );
  }
}
  
  export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role == "USER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const targetUserId = Number(id);
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  // Проверка прав доступа
  if (currentUser?.role === 'ADMIN') {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId }
    });

    if (targetUser?.role !== 'USER') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (targetUserId === session.user.id) {
    return NextResponse.json(
      { error: "Нельзя редактировать свой аккаунт" },
      { status: 403 }
    );
  }
  
    const {
      name,
      email,
      role,
      bonusBalance,
      phone,
      isVerified
    } = await request.json();
  
    try {
      const currentUser = await prisma.user.findUnique({
        where: { id: Number(id) },
      });
  
      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      const updateData: UpdateData = {
        name,
        email,
        role,
        bonusBalance,
        phone,
      };
  
      const wasVerified = !!currentUser.verified;
      const verificationChanged = isVerified !== wasVerified;
  
      if (verificationChanged) {
        updateData.verified = isVerified ? new Date() : null;
      }
  
      // Обновляем только если есть изменения
      const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: updateData,
      });
  
      return NextResponse.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: "User update failed" },
        { status: 400 }
      );
    }
  }

  export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
  
    if (!session?.user || session.user.role == "USER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  
    try {
      const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        include: {
          verificationCode: true
        }
      });
  
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      return NextResponse.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }
  }