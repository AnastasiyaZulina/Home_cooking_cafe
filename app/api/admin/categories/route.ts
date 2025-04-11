import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, isAvailable } = await request.json();

    // Валидация данных
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: "Некорректное название категории" },
        { status: 400 }
      );
    }

    // Проверяем существование категории
    const existingCategory = await prisma.category.findFirst({
      where: { name },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Категория с таким названием уже существует" },
        { status: 400 }
      );
    }

    // Создаем новую категорию
    const newCategory = await prisma.category.create({
      data: { 
        name,
        isAvailable: Boolean(isAvailable) // Явное преобразование в boolean
      },
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const categories = await prisma.category.findMany({
    orderBy: { id: 'asc' },
  });

  return NextResponse.json(categories);
}