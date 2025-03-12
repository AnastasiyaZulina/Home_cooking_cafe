'use client';

import React from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Dialog, DialogContent, DialogTitle } from '../../ui/dialog';
import { useRouter } from 'next/navigation';
import { TProduct } from '@/@types/prisma';
import { SeeProductForm } from '../see-product-form';
import { cn } from '@/shared/lib/utils';
import { useCartStore } from '@/shared/store';
import toast from 'react-hot-toast';


interface Props {
  product: TProduct;
  className?: string;
}

export const SeeProductModal: React.FC<Props> = ({ product, className }) => {
    
  const router = useRouter();
  const addCartItem = useCartStore(state => state.addCartItem);
  const loading = useCartStore(state => state.loading);

  const onCloseModal = () => {
        router.back();
    };

    const onAddProduct = async () => {
      try{
        await addCartItem ({
          productId: product.id,
        })
        toast.success('Добавлено в корзину!');  
        router.back();    
      }
      catch (e){
        toast.error('Не удалось добавить в корзину!');
        console.error(e);
      }
    };

    return (
      <Dialog open={Boolean(product)} onOpenChange={onCloseModal}>
        <DialogContent
          className={cn(
            "p-0 w-[1060px] max-w-[2060px] min-h-[500px] bg-white overflow-hidden",
            className
          )}
        >
          <VisuallyHidden>
            <DialogTitle>{product.name}</DialogTitle>
          </VisuallyHidden>
  
          {product.isAvailable ? (
            <SeeProductForm 
              image={product.image} 
              name={product.name} 
              description={product.description ?? ''} 
              weight={product.weight} 
              eValue={product.eValue} 
              price={product.price}
              loading={loading} 
              onSubmit={onAddProduct}
            />
          ) : (
            <div className="p-6 text-center text-xl font-bold text-red-500">
              Товар не доступен для продажи
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };
