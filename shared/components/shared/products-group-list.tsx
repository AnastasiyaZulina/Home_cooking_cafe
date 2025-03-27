'use client';

import React from 'react';
import {useIntersection} from 'react-use';
import { Title } from './title';
import { ProductCard } from './product-card';
import { useCategoryStore } from '@/shared/store/category';
import { cn } from '@/shared/lib/utils';


interface Props {
    title: string;
    items: {
        id: number;
        name: string;
        weight: number;
        image: string;
        price: number;
        isAvailable: boolean;
    }[];
    className?: string;
    listClassName?: string;
    categoryId: number;
}

export const ProductsGroupList: React.FC<Props> = ({
    title,
    items,
    listClassName,
    categoryId,
    className,
  }) => {
    const setActiveCategoryId = useCategoryStore((state) => state.setActiveId);
    const intersectionRef = React.useRef(null!);

    const intersection = useIntersection(intersectionRef, {
        threshold: 0.3,
    });

    React.useEffect(() => {
        if (intersection?.isIntersecting) {
            setActiveCategoryId(categoryId);
            // Добавьте это для обновления URL
            window.history.replaceState(null, '', `/#${title}`);
        }
    }, [categoryId, intersection?.isIntersecting, title]);

    return (
        <div className={className} id={title} ref={intersectionRef}>
            <Title 
                text={title} 
                size="lg" 
                className="font-extrabold mb-3 sm:mb-5"
            />
            <div className={cn(
                'grid gap-4 sm:gap-[50px]',
                'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
                listClassName
            )}>
                {items
                    .filter(product => product.isAvailable)
                    .map((product, i) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            image={product.image}
                            price={product.price}
                            weight={product.weight}
                            isAvailable={product.isAvailable}
                        />
                    ))}
            </div>
        </div>
    );
};