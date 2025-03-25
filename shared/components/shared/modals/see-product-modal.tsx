'use client';

import React, { useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Dialog, DialogContent, DialogTitle } from '../../ui/dialog';
import { useRouter } from 'next/navigation';
import { TProduct } from '@/@types/prisma';
import { cn } from '@/shared/lib/utils';
import { ProductForm } from '../product-form';


interface Props {
  product: TProduct;
  className?: string;
}

export const SeeProductModal: React.FC<Props> = ({ product, className }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onCloseModal = () => {
    if (!isSubmitting) {
      router.back();
    }
  };

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
    <VisuallyHidden>
      <DialogTitle>{product.name}</DialogTitle>
    </VisuallyHidden>

    <ProductForm 
      product={product} 
      onAddProduct={() => router.back()}
      onSubmitStarted={() => setIsSubmitting(true)}
      onSubmitFinished={() => setIsSubmitting(false)}
    />
  </DialogContent>
</Dialog>

  );
};
