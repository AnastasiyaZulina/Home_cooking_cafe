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
            <div className="p-4 sm:p-6 text-center text-base sm:text-xl font-bold text-red-500">
                Товар не доступен для продажи
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="flex justify-center p-4 sm:p-6 bg-secondary rounded-lg h-[200px] sm:h-[250px]">
                <Link href={`/product/${id}`}>
                    <img 
                        className="w-[175px] h-[175px] sm:w-[215px] sm:h-[215px] object-contain" 
                        src={image} 
                        alt={name}
                    />
                </Link>
            </div>

            <Title 
                text={name} 
                size="sm" 
                className="mb-1 mt-2 sm:mt-3 font-bold line-clamp-2"
            />

            <div className="flex justify-between items-center mt-3 sm:mt-4">
                <span className="text-[16px] sm:text-[20px]">{price} ₽</span>
                <Button 
                    variant="secondary" 
                    className="text-sm sm:text-base px-3 sm:px-4 py-2"
                >
                    <Plus size={16} className="mr-1 sm:mr-2"/>
                    Добавить
                </Button>
            </div>
        </div>
    );
};