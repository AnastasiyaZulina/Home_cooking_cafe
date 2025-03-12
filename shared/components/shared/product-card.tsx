import Link from 'next/link';
import React from 'react';
import { Title } from './title';
import { Button } from '../ui';
import { Plus } from 'lucide-react';


interface Props {
    id: number;
    name: string;
    price: number;
    image: string;
    isAvailable: boolean;
    className?: string;
}

export const ProductCard: React.FC<Props> = ({ id, name, price, image, className, isAvailable }) => {
    if (!isAvailable) {
        return (
            <div className="p-6 text-center text-xl font-bold text-red-500">
                Товар не доступен для продажи
            </div>
        );
    }

    return (
        <div className={className}>
            <Link href={`/product/${id}`}>
            <div className="flex justify-center p-6 bg-secondary rounded-lg h-[250px]">
                <img className="w-[215px] h-[215px]" src={image} alt={name}/>
            </div>

            <Title text={name} size="sm" className="mb-1 mt-3 font-bold"/>

            <div className="flex justify-between items-center mt-4">
                <span className="text-[20px] ">{price} ₽</span>
                <Button variant="secondary"><Plus size="20px" className="mr-1"/>Добавить</Button>
            </div>
            </Link>
        </div>
    );
};