'use client'

import { cn } from '@/shared/lib/utils';
import { useCategoryStore } from '@/shared/store/category';
import { Category } from '@prisma/client';
import React from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';

interface Props {
    className?: string;
    items: Category[];
}

export const Categories: React.FC<Props> = ({items, className }) => {
    const categoryActiveId = useCategoryStore((state) => state.activeId);

    return (
        <SimpleBar 
            autoHide={false} 
            className={cn(
                'flex bg-gray-50 rounded-2xl', 
                className
            )}
            style={{ padding: '4px' }}
        >
            <div className="flex gap-2 px-1 text-[15px] sm:text-[16px] h-10 sm:h-13">
                {items.map(({name, id}, index) => (
                    <a 
                        className={cn(
                            'flex items-center font-bold h-8 sm:h-11 rounded-2xl px-3 sm:px-5 shrink-0',
                            categoryActiveId === id && 'bg-white shadow-md shadow-gray-200 text-primary',
                        )}
                        href={`/#${name}`}
                        key={index}
                    >
                        <button>{name}</button>
                    </a>
                ))}
            </div>
        </SimpleBar>
    );
};