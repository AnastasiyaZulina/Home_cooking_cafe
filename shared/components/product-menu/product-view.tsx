'use client';

import { Container, SeeProductForm } from "@/shared/components";
import { TProduct } from "@/@types/prisma";

interface ProductViewProps {
    product: TProduct;
}

export const ProductView = ({ product }: ProductViewProps) => {
    return (
        <Container className="flex flex-col my-10">
        <SeeProductForm 
          image={product.image}
          name={product.name}
          description={product.description ?? ''}
          price={product.price}
          weight={product.weight}
          eValue={product.eValue}
          productId={product.id}
        />
        </Container>
    );
};