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
  isAvailable: boolean;
};

type ProductSelectorProps = {
  index: number;
  products: Product[];
  onRemove: () => void;
  allowEmpty?: boolean;
};

export const ProductSelectorEdit = ({
  index,
  products,
  onRemove,
  allowEmpty = false
}: ProductSelectorProps) => {
  const [open, setOpen] = useState(false);
  const { control, watch, setValue, getValues, formState: { errors } } = useFormContext();

  // Получаем все выбранные productId из формы
  const allSelectedIds = getValues('items').map((item: any) => item.productId);
  const selectedProductId = watch(`items.${index}.productId`);
  const selectedProduct = products.find(p => p.id === selectedProductId);

  // Фильтруем продукты, исключая уже выбранные в других селектах
  const filteredProducts = products.filter(product =>
    product.stockQuantity > 0 &&
    (product.id === selectedProductId || !allSelectedIds.includes(product.id))
  );

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
                    
                    // Получаем текущее значение количества
                    const currentQuantity = getValues(`items.${index}.quantity`);
                    // Корректируем значение если нужно
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
              {(errors.items as any)?.[index]?.quantity && (
                <p className="text-sm text-red-500">
                  {(errors.items as any)[index].quantity.message}
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