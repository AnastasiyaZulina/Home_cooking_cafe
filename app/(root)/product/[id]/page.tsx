import { Container, ProductForm } from "@/shared/components/shared";
import { prisma } from "@/prisma/prisma-client";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params; // Дождаться params перед использованием

    const product = await prisma.product.findFirst({
        where: {
            id: Number(id), // Приводим ID к числу
        },
        include: {
            //TODO: Вынести отдельным useEffect
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

    return (
        <Container className="flex flex-col my-10">
        {product.isAvailable ? (
            <ProductForm product={product}/>
        ) : (
            <div className="p-6 text-center text-xl font-bold text-red-500">Товар не доступен для продажи</div>
        )}
        </Container>
    );
}
