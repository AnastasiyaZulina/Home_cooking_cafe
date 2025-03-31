'use client';

import React from 'react';
import { X } from 'lucide-react';
import { CartItemProps } from './cart-item-details/cart-item-details.types';
import * as CartItemDetails from './cart-item-details';
import { cn } from '@/shared/lib/utils';
import { useCartStore } from '@/shared/store';

interface Props extends CartItemProps {
  onClickCountButton?: (type: 'plus' | 'minus') => void;
  onClickRemove?: () => void;
  className?: string;
}

export const CheckoutItem: React.FC<Props> = ({
  id,
  name,
  weight,
  eValue,
  price,
  image,
  quantity,
  stockQuantity,
  className,
  disabled,
  onClickCountButton,
  onClickRemove,
}) => {
  const { updatingItems } = useCartStore();
  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0',
      {'opacity-50 pointer-events-none': disabled},
      className
    )}>
      <div className="flex items-center gap-3 sm:gap-5 flex-1">
        <CartItemDetails.Image src={image} className="w-12 h-12 sm:w-16 sm:h-16" />
        <CartItemDetails.Info 
          name={name} 
          weight={weight} 
          eValue={eValue}
          className="text-sm sm:text-base"
        />
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 w-full sm:w-auto">
        <CartItemDetails.Price value={price} className="text-base sm:text-lg" />
        
        <div className="flex items-center gap-3 sm:gap-5">
          <CartItemDetails.CountButton 
            isLoading={updatingItems[id]}
            max={stockQuantity}
            onClick={onClickCountButton} 
            value={quantity} 
            size="sm"
          />
          <button type="button" onClick={onClickRemove}>
            <X className="text-gray-400 cursor-pointer hover:text-gray-600" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};