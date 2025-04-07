import { prisma } from "@/prisma/prisma-client";
import { authOptions } from "@/shared/constants/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// app/api/admin/products/route.ts 
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const products = await prisma.product.findMany({
        where: {
          isAvailable: true,
          stockQuantity: { gt: 0 }
        },
        orderBy: { name: 'asc' }, // Сортировка по имени
      });

    return NextResponse.json(products);
}