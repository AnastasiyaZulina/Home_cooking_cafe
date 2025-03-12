import { prisma } from "@/prisma/prisma-client";
import { SeeProductModal } from "@/shared/components/shared";
import { notFound } from "next/navigation";

export default async function ProductModalPage({ params }: { params: { id: string } }) {
    // Ожидание params перед использованием
    const { id } = await Promise.resolve(params);

    if (!id) {
        return notFound();
    }

    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
        return notFound();
    }

    const product = await prisma.product.findFirst({ where: { id: productId } });

    if (!product) {
        return notFound();
    }

    return <SeeProductModal product={product} />;
}
