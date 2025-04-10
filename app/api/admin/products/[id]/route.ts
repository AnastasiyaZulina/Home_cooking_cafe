import { prisma } from "@/prisma/prisma-client";
import { authOptions } from "@/shared/constants/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import fs from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const productId = Number(id);
  let updatedProduct;
  
  try {
    const formData = await request.formData();
    
    // Извлекаем данные
    const name = formData.get('name')?.toString();
    const description = formData.get('description')?.toString();
    const price = Number(formData.get('price'));
    const weight = Number(formData.get('weight'));
    const eValue = Number(formData.get('eValue'));
    const isAvailable = formData.get('isAvailable') === 'true';
    const stockQuantity = Number(formData.get('stockQuantity'));
    const categoryId = Number(formData.get('categoryId'));
    const image = formData.get('image') as File | null;

    // Получаем текущий продукт
    const currentProduct = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let imagePath = currentProduct.image;
    
    // Обработка нового изображения
    if (image) {
      // Удаляем старое изображение
      try {
        const oldImagePath = path.join(
          process.cwd(),
          'public',
          ...currentProduct.image.split('/').filter(Boolean)
        );
        await fs.rm(path.dirname(oldImagePath), { recursive: true, force: true });
      } catch (fsError) {
        console.error('Error deleting old image:', fsError);
      }

      // Сохраняем новое изображение
      const ext = image.type.split('/')[1] === 'svg+xml' ? 'svg' : image.type.split('/')[1];
      const uploadDir = path.join(process.cwd(), 'public', 'images', 'items', String(productId));
      const filename = `product-${productId}.${ext}`;
      const fullPath = path.join(uploadDir, filename);

      await fs.mkdir(uploadDir, { recursive: true });
      const buffer = Buffer.from(await image.arrayBuffer());
      await fs.writeFile(fullPath, buffer);
      
      imagePath = `/images/items/${productId}/${filename}`;
    }

    // Обновляем продукт
    updatedProduct = await prisma.product.update({
      where: { id: Number(productId) },
      data: {
        name,
        description,
        price,
        weight,
        eValue,
        isAvailable,
        stockQuantity,
        categoryId,
        image: imagePath
      },
    });

    return NextResponse.json(updatedProduct);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Internal Server Error"},
      { status: 500 }
    );
  }
}