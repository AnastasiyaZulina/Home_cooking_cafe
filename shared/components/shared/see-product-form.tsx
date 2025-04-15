'use client'

import React, { useState } from 'react';
import { Title } from './title';
import { Button } from '../ui';
import { cn } from '@/shared/lib/utils';
import { useCartStore } from '@/shared/store';
import toast from 'react-hot-toast';
import { CountButtonProduct } from './count-button-product';

interface Props {
    className?: string;
    image: string;
    name: string;
    description: string;
    price: number;
    weight: number;
    eValue: number;
    productId: number;
}

export const SeeProductForm: React.FC<Props> = ({
    className,
    image,
    name,
    description,
    price,
    weight,
    eValue,
    productId,
}) => {
    const { items, addCartItem, updateItemQuantity, removeCartItem, updatingItems } = useCartStore();
    const [localLoading, setLocalLoading] = useState(false);

    const cartItem = items.find(item => item.productId === productId);

    const handleReachZero = async () => {
        if (!cartItem) return;

        try {
            await removeCartItem(cartItem.id);
        } catch (error) {
            toast.error('Не удалось удалить товар');
        }
    };

    const handleQuantityChange = (type: 'plus' | 'minus') => {
        if (!cartItem || cartItem.disabled) return;

        const newQuantity = type === 'plus'
            ? cartItem.quantity + 1
            : cartItem.quantity - 1;

        // Проверка на превышение лимита
        if (type === 'plus' && newQuantity > cartItem.stockQuantity) {
            toast.error('Больше порций добавить нельзя');
            return;
        }

        if (newQuantity === 0) {
            removeCartItem(cartItem.id);
            return;
        }

        updateItemQuantity(cartItem.id, newQuantity);
    };

    const isUpdating = cartItem ?
        updatingItems[cartItem.id] || cartItem.disabled
        : false;

    const handleAdd = async () => {
        try {
            setLocalLoading(true);
            await addCartItem({ productId });
            toast.success('Добавлено в корзину!');
        } catch (e) {
            toast.error('Ошибка добавления!');
        } finally {
            setLocalLoading(false);
        }
    };


    return (
        <div className={cn(className, "flex flex-col xl:flex-row items-center sm:mt-5 xl:mt-0 xl:ml-5")}>
            {/* Блок с картинкой */}
            <div className="flex items-center justify-center w-full xl:w-[50%] mb-4 xl:mb-0">
                <img
                    src={image}
                    alt={name}
                    className="relative transition-all z-10 duration-300 w-full max-w-[400px] h-auto"
                />
            </div>

            {/* Блок с информацией */}
            <div className="w-full xl:w-[50%] p-7">
                <Title text={name} size="md" className="font-extrabold mb-1" />
                <p className="text-gray-400">{weight} г. | {eValue} ккал</p>
                <p className="text-gray-400">{description}</p>

                {/* Кнопка с шириной по тексту */}
                <div className="w-full mt-2 text-center sm:text-left">
                    {cartItem ? (
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <CountButtonProduct
                                value={cartItem.quantity}
                                onClick={handleQuantityChange}
                                onReachZero={handleReachZero}
                                isLoading={isUpdating}
                                max={cartItem.stockQuantity}
                            />
                            <span className="text-lg font-bold">
                                {price * cartItem.quantity} ₽
                            </span>
                        </div>
                    ) : (
                        <Button
                            variant="secondary"
                            onClick={handleAdd}
                            loading={localLoading}
                            className="h-12 px-8 text-base"
                        >
                            {localLoading ? 'Добавление...' : `Добавить за ${price} ₽`}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};


