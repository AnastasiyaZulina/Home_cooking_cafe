'use client';

import React, { useEffect, useRef } from 'react';
import { Title } from '@/shared/components';
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
    const intersectionRef = React.useRef<HTMLDivElement>(null);
    const isIntersectingRef = useRef(false);

    const checkCenterIntersection = React.useCallback(() => {
        if (!intersectionRef.current) return false;
        
        const rect = intersectionRef.current.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        
        return rect.top <= viewportCenter && rect.bottom >= viewportCenter;
    }, []);

    const handleIntersection = React.useCallback((entry: IntersectionObserverEntry) => {
        // Устанавливаем ID только если элемент входит в область видимости
        if (entry.isIntersecting && !isIntersectingRef.current) {
            isIntersectingRef.current = true;
            setActiveCategoryId(categoryId);
            if (checkCenterIntersection()) {
                window.history.replaceState(null, '', `/#${title}`);
            }
        } else if (!entry.isIntersecting) {
            isIntersectingRef.current = false;
        }
    }, [categoryId, title, checkCenterIntersection, setActiveCategoryId]);

    // Сбрасываем состояние при размонтировании
    useEffect(() => {
        return () => {
            isIntersectingRef.current = false;
        };
    }, []);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(handleIntersection);
            },
            {
                threshold: 0,
                rootMargin: '-50% 0px -50% 0px'
            }
        );

        if (intersectionRef.current) {
            observer.observe(intersectionRef.current);
        }

        return () => {
            if (intersectionRef.current) {
                observer.unobserve(intersectionRef.current);
            }
        };
    }, [handleIntersection]);

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
                    .map((product) => (
                        <ProductCard
                            key={product.id}
                            {...product}
                        />
                    ))}
            </div>
        </div>
    );
};