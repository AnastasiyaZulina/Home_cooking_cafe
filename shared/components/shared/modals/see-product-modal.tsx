'use client';

import React, { useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Dialog, DialogContent, DialogTitle } from '../../ui/dialog';
import { useRouter } from 'next/navigation';
import { TProduct } from '@/@types/prisma';
import { cn } from '@/shared/lib/utils';
import { X } from 'lucide-react';
import { SeeProductForm } from '../see-product-form';


interface Props {
  product: TProduct;
  className?: string;
}

export const SeeProductModal: React.FC<Props> = ({ product, className }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onCloseModal = () => {
    router.back();
  };
  if (!product) return null;
  return (
    <Dialog
      open={Boolean(product)}
      onOpenChange={onCloseModal}
    >
      <DialogContent
        className={cn(
          "p-0 w-[90vw] max-w-[1060px] min-h-[500px] max-h-[90vh] bg-white overflow-auto",
          "sm:w-[80vw] md:w-[70vw] lg:w-[60vw]",
          className
        )}
      >

        <button
          onClick={onCloseModal}
          className="absolute top-4 right-4 z-50 rounded-full w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          aria-label="Закрыть модальное окно"
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <VisuallyHidden>
          <DialogTitle>{product.name}</DialogTitle>
        </VisuallyHidden>

        <SeeProductForm 
          image={product.image}
          name={product.name}
          description={product.description ?? ''}
          price={product.price}
          weight={product.weight}
          eValue={product.eValue}
          productId={product.id}
        />
      </DialogContent>
    </Dialog>
  );
};
