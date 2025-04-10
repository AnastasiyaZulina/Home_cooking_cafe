import { prisma } from "@/prisma/prisma-client";
import { authOptions } from "@/shared/constants/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Получаем продукт для проверки существования
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Формируем путь к папке с изображением
    const imagePath = path.join(
      process.cwd(),
      'public',
      ...product.image.split('/').filter(Boolean)
    );

    // Удаляем папку с изображением
    try {
      await fs.rm(path.dirname(imagePath), {
        recursive: true,
        force: true,
      });
    } catch (fsError) {
      console.error('Error deleting image folder:', fsError);
      // Продолжаем удаление даже если не удалилась папка
    }

    // Удаляем запись из базы данных
    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Internal server error"},
      { status: 500 }
    );
  }
}