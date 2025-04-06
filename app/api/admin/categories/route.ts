import { prisma } from '@/prisma/prisma-client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from '@/shared/constants/auth-options';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const categories = await prisma.category.findMany({
    orderBy: {
      id: 'asc',
    },
  });

  const data = categories.map(category => ({
    id: category.id,
    name: category.name,
  }));

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name } = await request.json();

  try {
    // Проверяем, существует ли уже категория с таким именем
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
      data: { name },
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка при создании категории" },
      { status: 500 }
    );
  }
}