import { prisma } from "@/prisma/prisma-client";
import { authOptions } from "@/shared/constants/auth-options";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { del, put } from "@vercel/blob";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role == "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const isAvailable = searchParams.get('isAvailable') === 'true';
  const stockQuantityGt = Number(searchParams.get('stockQuantity[gt]'));

  const where: Prisma.ProductWhereInput = {};
  if (isAvailable) {
    where.isAvailable = true;
  }
  if (!isNaN(stockQuantityGt)) {
    where.stockQuantity = { gt: stockQuantityGt };
  }

  const products = await prisma.product.findMany({
    orderBy: { name: 'asc' },
    include: {
      category: true,
    },
  });

  const productsWithBlobUrls = products.map(product => ({
    ...product,
    image: process.env.BLOB_URL + product.image
  }));

  return NextResponse.json(productsWithBlobUrls);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role == "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let newProduct;
  let newBlobUrl: string | null = null;
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
    const ext = image.type.split('/')[1] === 'svg+xml' ? 'svg' : image.type.split('/')[1];
    const basePath = `/images/items/product-${newProduct.id}`;
    const buffer = Buffer.from(await image.arrayBuffer());

    const { url, pathname } = await put(`${basePath}.${ext}`, buffer, {
      access: 'public',
      addRandomSuffix: true // Генерирует уникальный суффикс
    });

    newBlobUrl = url;

    // Обновляем продукт с новым путем
    const updatedProduct = await prisma.product.update({
      where: { id: newProduct.id },
      data: { image: `/${pathname}` } // Сохраняем путь с суффиксом
    });

    return NextResponse.json({
      ...updatedProduct,
      image: url // Возвращаем полный URL
    });

  } catch (error) {
    // Удаляем продукт при ошибке
    if (newProduct) await prisma.product.delete({ where: { id: newProduct.id }});
    if (newBlobUrl) await del(newBlobUrl);

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
