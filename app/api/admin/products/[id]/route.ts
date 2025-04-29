import { prisma } from "@/prisma/prisma-client";
import { authOptions } from "@/shared/constants/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";


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

    // Формируем полный URL файла в Blob
    const blobUrl = `${process.env.BLOB_URL}${product.image}`;

    // Удаляем файл из Blob
    await del([blobUrl]);

    // Удаляем запись из базы данных
    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ 
      success: true,
      message: "Product and associated image deleted successfully" 
    });

  } catch (error) {
    console.error('Error:', error);
    
    // Определяем тип ошибки
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error occurred';

    return NextResponse.json(
      { 
        error: "Internal server error",
        message: errorMessage
      },
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

  const productId = Number(id);
  let updatedProduct;
  let oldBlobUrl: string | null = null;
  let newBlobUrl: string | null = null;

  try {
    const formData = await request.formData();
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
      where: { id: productId },
    });

    if (!currentProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    oldBlobUrl = process.env.BLOB_URL + currentProduct.image;
    let newBlobPath = currentProduct.image; // Сохраняем текущее изображение по умолчанию

    // Обработка нового изображения
    if (image) {
      const image = formData.get('image') as File;
      const ext = image.type.split('/')[1] === 'svg+xml' ? 'svg' : image.type.split('/')[1];
      const basePath = `/images/items/product-${productId}`;
      const buffer = Buffer.from(await image.arrayBuffer());

      const { url, pathname } = await put(`${basePath}.${ext}`, buffer, {
        access: 'public',
        addRandomSuffix: true
      });

      newBlobUrl = url;
      newBlobPath = `/${pathname}`;
    }

    // Обновляем продукт
    updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price,
        weight,
        eValue,
        isAvailable,
        stockQuantity,
        categoryId,
        image: newBlobPath
      },
    });

    // Удаляем старое изображение только если было загружено новое
    if (newBlobPath !== currentProduct.image) {
      await del(oldBlobUrl);
    }

    return NextResponse.json(updatedProduct);

  } catch (error) {
    // Удаляем новое изображение при ошибке
    if (newBlobUrl) await del(newBlobUrl);
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Internal Server Error"},
      { status: 500 }
    );
  }
}