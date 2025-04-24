'use client'

import Link from 'next/link';
import React, { useState } from 'react';
import { Title } from './title';
import { Button } from '../ui';
import { Plus } from 'lucide-react';
import { useCartStore } from '@/shared/store';
import toast from 'react-hot-toast';
import { CountButtonProduct } from './count-button-product';

interface CartItem {
    id: number;
    productId: number;
    quantity: number;
    stockQuantity: number;
    disabled?: boolean;
}

interface Props {
    id: number;
    name: string;
    price: number;
    image: string;
    weight: number;
    isAvailable: boolean;
    className?: string;
}

export const ProductCard: React.FC<Props> = ({
    id: productId,
    name,
    price,
    image,
    className,
    isAvailable,
    weight,
}) => {
    const { updatingItems, items, loading, initialized, addCartItem, updateItemQuantity, removeCartItem } = useCartStore();
    const [localLoading, setLocalLoading] = useState(false);

    const cartItem: CartItem | undefined = items.find(item => item.productId === productId);

    const isUpdating = cartItem ?
        updatingItems[cartItem.id] || cartItem.disabled
        : false;

    const showSkeleton = !initialized && loading;
    if (showSkeleton) {
        return (
            <div className={className}>
                <div className="animate-pulse bg-gray-200 h-[350px] sm:h-[300px] rounded-lg" />
                <div className="mt-4 h-4 bg-gray-200 w-3/4 rounded mx-3" />
                <div className="mt-4 flex justify-end px-3 sm:px-4">
                    <div className="h-10 w-24 bg-gray-200 rounded-md" />
                </div>
            </div>
        );
    }

    const handleReachZero = async () => {
        if (!cartItem) return;

        try {
            await removeCartItem(cartItem.id);
        } catch (error) {
            toast.error('Не удалось удалить товар');
        }
    };


    if (!isAvailable) {
        return (
            <div className="p-6 text-center text-base sm:text-xl font-bold text-red-500">
                Товар не доступен для продажи
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="flex justify-center items-center p-6 bg-secondary rounded-lg h-[350px] sm:h-[300px]"
                style={{
                    clipPath: `polygon(
                    /* Top edge waves */
                    8% 0%, 15% 3%, 22% 0%, 29% 3%, 36% 0%, 43% 3%, 50% 0%, 57% 3%, 64% 0%, 71% 3%, 78% 0%, 85% 3%, 92% 0%,
                    /* Right edge waves */
                    100% 8%, 97% 15%, 100% 22%, 97% 29%, 100% 36%, 97% 43%, 100% 50%, 97% 57%, 100% 64%, 97% 71%, 100% 78%, 97% 85%, 100% 92%,
                    /* Bottom edge waves */
                    92% 100%, 85% 97%, 78% 100%, 71% 97%, 64% 100%, 57% 97%, 50% 100%, 43% 97%, 36% 100%, 29% 97%, 22% 100%, 15% 97%, 8% 100%,
                    /* Left edge waves */
                    0% 92%, 3% 85%, 0% 78%, 3% 71%, 0% 64%, 3% 57%, 0% 50%, 3% 43%, 0% 36%, 3% 29%, 0% 22%, 3% 15%, 0% 8%
                )`
                }}>
                <Link href={`/product/${productId}`} className="relative w-full h-full">
                    <img
                        className="absolute inset-0 w-full h-full object-contain"
                        src={image}
                        alt={name}
                    />
                </Link>
            </div>

            <Title
                text={name}
                size="sm"
                className="mb-1 mt-2 sm:mt-3 font-bold line-clamp-2 px-3 sm:px-4"
            />

            <div className="flex justify-between items-center mt-3 sm:mt-4 px-3 sm:px-4">
                <span className="text-[18px] block 2xl:hidden">
                    {price} ₽ &nbsp;|&nbsp; {weight} г.
                </span>

                <span className="text-[18px] hidden 2xl:block">
                    {price} ₽ <br /> {weight} г.
                </span>
                {cartItem ? (
                    <CountButtonProduct
                        value={cartItem.quantity}
                        onClick={(type) => {
                            if (!cartItem) return;

                            const newQuantity = type === 'plus'
                                ? cartItem.quantity + 1
                                : cartItem.quantity - 1;

                            // Проверка на максимальное количество
                            if (type === 'plus' && cartItem.stockQuantity !== undefined && newQuantity > cartItem.stockQuantity) {
                                toast.error('Больше порций добавить нельзя');
                                return;
                            }

                            updateItemQuantity(cartItem.id, newQuantity);
                        }}
                        onReachZero={handleReachZero}
                        isLoading={isUpdating}
                        max={cartItem.stockQuantity}
                    />
                ) : (
                    <Button
                        variant="secondary"
                        onClick={async () => {
                            try {
                                setLocalLoading(true);
                                await addCartItem({ productId });
                            } finally {
                                setLocalLoading(false);
                            }
                        }}
                        loading={localLoading}
                    >
                        <Plus size={16} className="mr-2" />
                        {localLoading ? 'Добавляем...' : 'Добавить'}
                    </Button>
                )}
            </div>
        </div>
    );
};