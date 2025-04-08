'use client';

import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button, FormInput } from '@/shared/components';
import { useFormContext } from 'react-hook-form';
import { Trash } from 'lucide-react';

type Product = {
  id: number;
  name: string;
  stockQuantity: number;
  price: number;
};

type ProductSelectorProps = {
  index: number;
  products: Product[];
  orderItems: {
    productId: number;
    productName: string;
    productQuantity: number;
    productPrice: number;
  }[];
  onRemove: () => void;
};


export const ProductSelector = ({ 
  index,
  products,
  onRemove
}: ProductSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { control, watch, setValue, formState: { errors } } = useFormContext();
  const selectedProductId = watch(`items.${index}.productId`);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex-1">
        <Controller
          name={`items.${index}.productId`}
          control={control}
          render={({ field }) => (
            <div>
              <Select
                open={open}
                onOpenChange={setOpen}
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => {
                  const product = products.find(p => p.id === Number(value));
                  if (product) {
                    field.onChange(Number(value));
                    setValue(`items.${index}.productName`, product.name);
                    setValue(`items.${index}.stockQuantity`, product.stockQuantity);
                    setValue(`items.${index}.productPrice`, product.price);
                  }
                  setOpen(true);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите товар">
                    {selectedProduct
                      ? `${selectedProduct.name} - ${selectedProduct.price} ₽`
                      : "Выберите товар"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem key={product.id} value={String(product.id)}>
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
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">×</span>
        <FormInput
          name={`items.${index}.quantity`}
          type="number"
          min={1}
          max={selectedProduct?.stockQuantity || 1}
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
    </div >
  );
};