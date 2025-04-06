// app/api/admin/categories/[id]/route.ts
import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name } = await request.json();

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: Number(params.id) },
      data: { name },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json(
      { error: "Category update failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Удаляем категорию
    await prisma.category.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Category not found or could not be deleted" },
      { status: 404 }
    );
  }
}