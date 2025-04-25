import {ProductView } from "@/shared/components";
import { prisma } from "@/prisma/prisma-client";
import { notFound } from "next/navigation";


export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const product = await prisma.product.findFirst({
        where: {
            id: Number(id),
        },
        include: {
            category: {
                include:{
                    products: true
                },
            },
        },
    });

    if (!product) {
        return notFound();
    }

    if (!product.isAvailable) {
        return <p className="text-2xl font-bold mt-3">Товар не доступен для продажи!</p>;
    }

    return <ProductView product={product} />;
}