import React from 'react';
import { Title } from './title';
import { Button } from '../ui';
import { cn } from '@/shared/lib/utils';

interface Props {
    className?: string;
    image: string;
    name: string;
    description: string;
    price: number;
    weight: number;
    eValue: number;
    loading?: boolean;
    onSubmit?: VoidFunction
}

export const SeeProductForm: React.FC<Props> = ({ 
    className,
    image,
    name,
    description,
    price,
    weight,
    eValue,
    loading,
    onSubmit
}) => {
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
                <div className="w-full text-center sm:text-left">
                    <Button 
                        loading={loading} 
                        onClick={onSubmit} 
                        className="h-[40px] sm:h-[55px] px-5 sm:px-10 text-base rounded-[18px] w-auto mt-10"
                    >
                        Добавить в корзину за {price} ₽
                    </Button>
                </div>
            </div>
        </div>
    );
};


