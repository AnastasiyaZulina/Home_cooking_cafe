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

export const Categories: React.FC<Props> = ({ items, className }) => {
    const categoryActiveId = useCategoryStore((state) => state.activeId);

    const isMobile = window.innerWidth < 640; // Если ширина экрана меньше 640px (sm)

    const content = (
        <div className="flex gap-2 px-1 text-[15px] sm:text-[16px] h-10 sm:h-13">
            {items.map(({ name, id }, index) => (
                <a
                    className={cn(
                        'flex items-center font-bold h-8 sm:h-11 rounded-2xl px-3 sm:px-5 shrink-0',
                        categoryActiveId === id && 'bg-white shadow-md shadow-gray-200 text-primary'
                    )}
                    key={index}
                    href={`/#${name}`}
                >
                    <button>{name}</button>
                </a>
            ))}
        </div>
    );

    return (
        <div
            className={cn(
                'flex bg-gray-50 rounded-2xl',
                className
            )}
            style={{ padding: '4px', overflowY: isMobile ? 'auto' : 'hidden' }}  // Для мобильных экранов добавляем авто-скролл
        >
            {isMobile ? (
                content
            ) : (
                <SimpleBar autoHide={false} style={{ maxHeight: '100vh', width: '100%' }}>
                    {content}
                </SimpleBar>
            )}
        </div>
    );
};
