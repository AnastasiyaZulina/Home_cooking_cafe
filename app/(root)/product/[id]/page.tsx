import { Container, Title } from "@/shared/components/shared";
import { prisma } from "@/prisma/prisma-client";
import { notFound } from "next/navigation";

export default async function ProductPage({params: {id} }: {params:{id: string} }) {
    const product = await prisma.product.findFirst({where: {id: Number(id)}});
    if (!product) {
        return notFound();
    }

    if (!product.isAvailable) {
        return <p className="text-2xl font-bold mt-3">Товар не доступен для продажи!</p>
    }

    return (<Container className="flex flex-col my-10">
        <div className="flex flex-row gap-8">
            <div className="relative left-2 top-2 transition-all duration-300"></div>
            <img className="w-[500px] h-[500px]" src={product.image} alt={product.name}/>
            <div className="sticky top-5 w-[490px] bg-[#FCFCFC] p-7 ml-auto">
                <Title text={product.name} size="md" className="font extrabold mb-1"/>
                <p className="text-gray-400">{product.weight} г | {product.eValue} ккал</p>
                <p className="text-gray-400">{product.description}</p>
                <p className="text-2xl font-bold mt-3">{product.price} ₽</p>
                <div className="mt-5">
                    <button className="bg-primary text-white px-4 py-2 rounded-lg">Добавить в корзину</button>
                </div>
            </div>
        </div>
    </Container>
    );
}