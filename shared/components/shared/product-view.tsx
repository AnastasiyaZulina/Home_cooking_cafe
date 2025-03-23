'use client';

import { Container, ProductForm } from "@/shared/components/shared";
import { TProduct } from "@/@types/prisma";

interface ProductViewProps {
    product: TProduct;
}

export const ProductView = ({ product }: ProductViewProps) => {
    return (
        <Container className="flex flex-col my-10">
            <ProductForm 
                product={product}
                onSubmitStarted={() => {}}
                onSubmitFinished={() => {}}
            />
        </Container>
    );
};