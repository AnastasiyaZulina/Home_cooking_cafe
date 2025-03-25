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
    weight: number;
    isAvailable: boolean;
    className?: string;
}

export const ProductCard: React.FC<Props> = ({ id, name, price, image, className, isAvailable, weight }) => {
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
                <Link href={`/product/${id}`} className="relative w-full h-full">
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

                {/* Вариант для больших экранов (цена и вес на разных строках) */}
                <span className="text-[18px] hidden 2xl:block">
                    {price} ₽ <br /> {weight} г.
                </span>
                <Button
                    variant="secondary"
                    className="text-sm sm:text-base px-3 sm:px-4 py-2"
                >
                    <Plus size={16} className="mr-1 sm:mr-2" />
                    Добавить
                </Button>
            </div>
        </div>
    );
};