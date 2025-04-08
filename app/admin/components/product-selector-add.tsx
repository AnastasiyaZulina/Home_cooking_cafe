'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import { Trash } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Button, FormInput } from '@/shared/components';

type Product = {
  id: number;
  name: string;
  stockQuantity: number;
  price: number;
};

type ProductSelectorProps = {
  index: number;
  products: Product[];
  onRemove: () => void;
};

export const ProductSelectorAdd = ({ 
  index,
  products,
  onRemove
}: ProductSelectorProps) => {
  const { control, watch, setValue, formState: { errors } } = useFormContext();
  const items = watch('items') || [];
  
  // Рассчёт доступного количества с учётом выбранных товаров
  const availableProducts = products.map(product => {
    const usedQuantity = items
      .filter((item: any) => item.productId === product.id)
      .reduce((sum: number, item: any) => sum + item.quantity, 0);
      
    return {
      ...product,
      stockQuantity: product.stockQuantity - usedQuantity
    };
  });

  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex-1">
        <Controller
          name={`items.${index}.productId`}
          control={control}
          render={({ field }) => {
            const selectedProduct = availableProducts.find(p => p.id === field.value);
            
            return (
              <div>
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => {
                    const product = availableProducts.find(p => p.id === Number(value));
                    if (product) {
                      field.onChange(Number(value));
                      setValue(`items.${index}.productName`, product.name);
                      setValue(`items.${index}.stockQuantity`, product.stockQuantity);
                      setValue(`items.${index}.productPrice`, product.price);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите товар">
                      {selectedProduct
                        ? `${selectedProduct.name} - ${selectedProduct.price} ₽ (Доступно: ${selectedProduct.stockQuantity})`
                        : "Выберите товар"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableProducts
                      .filter(p => p.stockQuantity > 0)
                      .map(product => (
                        <SelectItem 
                          key={product.id} 
                          value={String(product.id)}
                          disabled={product.stockQuantity <= 0}
                        >
                          {product.name} (Доступно: {product.stockQuantity})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {(errors.items as any)?.[index]?.productId && (
                  <p className="text-sm text-red-500 mt-1">
                    {(errors.items as any)[index].productId.message}
                  </p>
                )}
              </div>
            );
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">×</span>
        <FormInput
          name={`items.${index}.quantity`}
          type="number"
          min={1}
          max={availableProducts.find(p => p.id === watch(`items.${index}.productId`))?.stockQuantity || 1}
          required
          className="w-20"
        />
        {(errors.items as any)?.[index]?.quantity && (
          <p className="text-sm text-red-500">
            {(errors.items as any)[index].quantity.message}
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-destructive hover:text-destructive/80"
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};