// app/api/admin/products/stock/route.ts
import { prisma } from "@/prisma/prisma-client";
import { authOptions } from "@/shared/constants/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role == "USER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { ids, quantity } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Не выбраны товары для обновления" },
        { status: 400 }
      );
    }

    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: "Некорректное количество" },
        { status: 400 }
      );
    }

    const result = await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { 
          stockQuantity: quantity,
          isAvailable: quantity > 0
        },
      });

    return NextResponse.json({
      success: true,
      updatedCount: result.count
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}