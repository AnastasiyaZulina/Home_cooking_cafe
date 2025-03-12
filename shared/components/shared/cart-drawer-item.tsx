import { cn } from '@/shared/lib/utils';
import React from 'react';
import * as CartItem from './cart-item-details';
import { CartItemProps } from './cart-item-details/cart-item-details.types';
import { CountButton } from './count-button';
import { Trash2Icon } from 'lucide-react';


interface Props extends CartItemProps{
    onClickCountButton?: (type: 'plus' | 'minus') => void;
    onClickRemove?: () => void;
    className?: string;
}

export const CartDrawerItem: React.FC<React.PropsWithChildren<Props>> = ({
    image,
    name,
    price,
    weight,
    eValue,
    quantity,
    className,
    onClickCountButton,
    onClickRemove
}) => {
    return (
    <div className={cn('flex bg-white p-5 gap-6', className)}>
        <CartItem.Image src={image}/>

        <div className="flex-1">
            <CartItem.Info name={name} weight={weight} eValue={eValue}/>

            <hr className="my-3" />

            <div className="flex justify-between items-center">
                <CountButton onClick={onClickCountButton} value={quantity} />

                <div className="flex items-center gap-3">
                    <CartItem.Price value={price} />
                    <Trash2Icon onClick={onClickRemove} className="text-gray-400 cursor-pointer hover:text-gray-600" size={16} />
                </div>
            </div>
        </div>
    </div>
    );
};