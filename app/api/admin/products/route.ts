import { prisma } from "@/prisma/prisma-client";
import { authOptions } from "@/shared/constants/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import path from 'path';
import fs from 'fs/promises';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role == "USER") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const products = await prisma.product.findMany({
        orderBy: { name: 'asc' },
        include: {
          category: true,
        },
      });

    return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role == "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let newProduct;
  try {
    const formData = await req.formData();

    // Извлечение данных
    const name = formData.get('name')?.toString();
    const description = formData.get('description')?.toString() || '';
    const price = Number(formData.get('price'));
    const weight = Number(formData.get('weight'));
    const eValue = Number(formData.get('eValue'));
    const isAvailable = formData.get('isAvailable') === 'true';
    const stockQuantity = Number(formData.get('stockQuantity'));
    const categoryId = Number(formData.get('categoryId'));
    const image = formData.get('image') as File;

    // Валидация
    const allowedMimeTypes = ['image/svg+xml', 'image/jpeg', 'image/png', 'image/webp'];
    if (!image || !allowedMimeTypes.includes(image.type)) {
      return NextResponse.json({ error: "Недопустимый формат изображения" }, { status: 400 });
    }

    // Создаем продукт временно без изображения
    newProduct = await prisma.product.create({
      data: {
        name: name!,
        description,
        price,
        weight,
        eValue,
        isAvailable,
        stockQuantity,
        category: { connect: { id: categoryId } },
        image: "" // Временное значение
      }
    });

    // Создаем структуру папок
    const productId = newProduct.id;
    const ext = image.type.split('/')[1] === 'svg+xml' ? 'svg' : image.type.split('/')[1];
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'items', productId.toString());
    const filename = `product-${productId}.${ext}`;
    const fullPath = path.join(uploadDir, filename);

    // Сохраняем изображение
    await fs.mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await image.arrayBuffer());
    await fs.writeFile(fullPath, buffer);

    // Обновляем продукт с новым путем
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        image: `/images/items/${productId}/${filename}`
      }
    });

    return NextResponse.json(updatedProduct);

  } catch (error) {
    // Удаляем продукт при ошибке
    if (newProduct) {
      await prisma.product.delete({ where: { id: newProduct.id } });
    }
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json(
      { 
        error: 'Внутренняя ошибка сервера',
        message: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}
