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
    return <div className={cn(className, 'flex flex-1')}>
        <div className="flex items-center justify-center flex-1 relative w-full">
        <img src={image} alt={name} className="relative left-2 top-2 transition-all z-10 duration-300 w-[400px] h-[400px]"/>
        </div>
        <div className="w-[490px] bg-[#FCFCFC] p-7">
            <Title text={name} size="md" className="font extrabold mb-1"/>
            <p className="text-gray-400">{weight} г | {eValue} ккал</p>
            <p className="text-gray-400">{description}</p>
            <Button loading={loading} onClick={onSubmit} className="h-[55px px-10 text-base rounded-[18px] w-full mt-10">Добавить в корзину за {price} ₽</Button>
        </div>
    </div>;
};