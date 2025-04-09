'use client';

import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button, FormInput } from '@/shared/components';
import { Trash } from 'lucide-react';
import type { FieldErrors } from 'react-hook-form';

type Product = {
  id: number;
  name: string;
  stockQuantity: number;
  price: number;
  isAvailable: boolean;
};

type OrderItemForm = {
  productId: number;
  quantity: number;
  productName: string;
  stockQuantity: number;
  productPrice: number;
};

type ProductSelectorProps = {
  index: number;
  products: Product[];
  onRemove: () => void;
  allowEmpty?: boolean;
};

type FormErrors = FieldErrors<{
  items: OrderItemForm[];
}>;

export const ProductSelectorEdit = ({
  index,
  products,
  onRemove,
}: ProductSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { control, watch, setValue, getValues, formState: { errors } } = useFormContext<{ items: OrderItemForm[] }>();

  const allSelectedIds = getValues('items').map((item) => item.productId);
  const selectedProductId = watch(`items.${index}.productId`);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  const filteredProducts = products.filter(product =>
    product.stockQuantity > 0 &&
    (product.id === selectedProductId || !allSelectedIds.includes(product.id))
  );

  const itemsErrors = (errors as FormErrors).items?.[index];

  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="flex-1">
        <Controller
          name={`items.${index}.productId`}
          control={control}
          rules={{
            required: "Выберите товар",
            validate: (value) => value !== 0 || "Выберите товар"
          }}
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
                    
                    const currentQuantity = getValues(`items.${index}.quantity`);
                    const clampedValue = Math.min(
                      Math.max(currentQuantity, 1), 
                      product.stockQuantity
                    );
                    setValue(`items.${index}.quantity`, clampedValue);
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
                  {filteredProducts.map(product => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.name} (Доступно: {product.stockQuantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {itemsErrors?.productId && (
                <p className="text-sm text-red-500 mt-1">
                  {itemsErrors.productId.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">×</span>
        <Controller
          name={`items.${index}.quantity`}
          control={control}
          rules={{
            required: "Введите количество",
            min: {
              value: 1,
              message: "Минимальное количество 1"
            },
            max: {
              value: selectedProduct?.stockQuantity ?? 0,
              message: "Превышает доступное количество"
            }
          }}
          render={({ field }) => (
            <div>
              <FormInput
                {...field}
                type="number"
                min={1}
                max={selectedProduct?.stockQuantity}
                className="w-20"
                onChange={(e) => {
                  const value = Number(e.target.value);
                  const maxStock = selectedProduct?.stockQuantity || 1;
                  const clampedValue = Math.min(Math.max(value, 1), maxStock);
                  field.onChange(clampedValue);
                }}
                disabled={!selectedProductId}
                value={field.value}
              />
              {itemsErrors?.quantity && (
                <p className="text-sm text-red-500">
                  {itemsErrors.quantity.message}
                </p>
              )}
            </div>
          )}
        />
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