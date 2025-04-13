// app/api/admin/categories/[id]/route.ts
import { prisma } from '@/prisma/prisma-client';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role == "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, isAvailable } = await request.json();

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: Number(id) },
      data: { name, isAvailable },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('error:', error);
    return NextResponse.json(
      { error: "Category update failed" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role == "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Удаляем категорию
    await prisma.category.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('error:', error);
    return NextResponse.json(
      { error: "Category not found or could not be deleted" },
      { status: 404 }
    );
  }
}