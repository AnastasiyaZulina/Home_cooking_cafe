import { cn } from '@/shared/lib/utils';
import React from 'react';
import { WhiteBlock } from '../white-block';
import { CheckoutItem } from '../checkout-item';
import { CartStateItem } from '@/shared/lib/get-cart-details';
import { Skeleton } from '../../ui';
import { CheckoutItemSkeleton } from './checkout-item-skeleton';



interface Props {
    items: CartStateItem[];
    className?: string;
    loading?: boolean;
    onClickCountButton: (id: number, quantity: number, type: 'plus' | 'minus') => void;
    removeCartItem: (id: number) => void;
}

export const CheckoutCart: React.FC<Props> = ({ className, loading, items, onClickCountButton, removeCartItem }) => {
    return (
        <WhiteBlock
            title="1. Корзина">
            <div className="flex flex-col gap-1 md:gap-5">
                {
                    loading ? [Array(4)].map((_, index) => <CheckoutItemSkeleton key={index} className="h-16 md:h-20" />) :

                        items.map((item) => (
                            <CheckoutItem key={item.id}
                                stockQuantity={item.stockQuantity}
                                id={item.id}
                                image={item.image}
                                name={item.name}
                                price={item.price}
                                weight={item.weight}
                                eValue={item.eValue}
                                quantity={item.quantity}
                                disabled={item.disabled}
                                onClickCountButton={(type) => onClickCountButton(item.id, item.quantity, type)}
                                onClickRemove={() => removeCartItem(item.id)}
                            />))
                }
            </div>
        </WhiteBlock>
    );
};