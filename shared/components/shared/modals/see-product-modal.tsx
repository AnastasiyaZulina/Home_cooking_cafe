'use client';

import React from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Dialog, DialogContent, DialogTitle } from '../../ui/dialog';
import { useRouter } from 'next/navigation';
import { TProduct } from '@/@types/prisma';
import { SeeProductForm } from '../see-product-form';
import { cn } from '@/shared/lib/utils';


interface Props {
  product: TProduct;
  className?: string;
}

export const SeeProductModal: React.FC<Props> = ({ product, className }) => {
    const router = useRouter();

    const onCloseModal = () => {
        router.back();
    };

  return (
    <Dialog open={Boolean(product)} onOpenChange={onCloseModal}>
      <DialogContent className={cn("p-0 w-[1060px] max-w-[2060px] min-h-[500px] bg-white overflow-hidden", className)}>
        <VisuallyHidden>
          <DialogTitle>{product.name}</DialogTitle>
        </VisuallyHidden>
          <SeeProductForm image={product.image} name={product.name} description={product.description ?? ''} price={product.price} />
      </DialogContent>
    </Dialog>
  );
};
