import { prisma } from "@/prisma/prisma-client";
import { authOptions } from "@/shared/constants/auth-options";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
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