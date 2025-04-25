import { cn } from '@/shared/lib/utils';
import React from 'react';
import { CartItemProps } from './cart-item-details/cart-item-details.types';
import { Trash2Icon } from 'lucide-react';
import { useCartStore } from '@/shared/store';
import { CartItemDetailsImage, CartItemDetailsPrice, CartItemInfo } from './cart-item-details';
import { CountButton } from '../buttons';


interface Props extends CartItemProps{
    onClickCountButton?: (type: 'plus' | 'minus') => void;
    onClickRemove?: () => void;
    className?: string;
}

export const CartDrawerItem: React.FC<React.PropsWithChildren<Props>> = ({
    id,
    image,
    name,
    price,
    weight,
    eValue,
    quantity,
    className,
    disabled,
    stockQuantity,
    onClickCountButton,
    onClickRemove
}) => {
    const { updatingItems } = useCartStore();
    
    return (
    <div className={cn('flex bg-white p-5 gap-6', {'opacity-50 pointer-events-none': disabled}, className)}>
        <CartItemDetailsImage src={image}/>

        <div className="flex-1">
            <CartItemInfo name={name} weight={weight} eValue={eValue}/>

            <hr className="my-3" />

            <div className="flex justify-between items-center">
                <CountButton onClick={onClickCountButton} value={quantity} isLoading={updatingItems[id]} max={stockQuantity}/>

                <div className="flex items-center gap-3">
                    <CartItemDetailsPrice value={price} />
                    <Trash2Icon onClick={onClickRemove} className="text-gray-400 cursor-pointer hover:text-gray-600" size={16} />
                </div>
            </div>
        </div>
    </div>
    );
};