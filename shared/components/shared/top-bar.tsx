'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Container } from './container';
import { Categories } from './categories';
import { Category } from '@prisma/client';
import { cn } from '@/shared/lib/utils';
import { ProfileButton } from './profile-button';
import { CartButton } from './cart-button';
import { useScrollDirection } from '@/hooks/use-scroll-direction';
import { useBreakpoint } from '@/hooks';

interface Props {
  categories: Category[];
  className?: string;
}

export const TopBar: React.FC<Props> = ({ categories, className }) => {
  const isHeaderVisible = useScrollDirection();
  const [categoriesWidth, setCategoriesWidth] = useState('100%');
  const buttonsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLargeScreen = useBreakpoint('lg');

  const updateCategoriesWidth = useCallback(() => {
    setTimeout(() => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const buttonsWidth = buttonsRef.current?.offsetWidth ?? 0;
        // Увеличиваем отступ для мобильных устройств
        const gap = window.innerWidth < 640 ? 20 : 40;
        const availableWidth = containerWidth - buttonsWidth - gap;
        setCategoriesWidth(`${availableWidth}px`);
      }
    }, 0);
  }, []);

  useEffect(() => {
    updateCategoriesWidth();
  }, [isHeaderVisible]);

  useEffect(() => {
    window.addEventListener('resize', updateCategoriesWidth);
    return () => window.removeEventListener('resize', updateCategoriesWidth);
  }, [updateCategoriesWidth]);

  return (
    <div className={cn(
      'sticky top-0 bg-white shadow-lg shadow-black/5 z-10',
      'py-3 sm:py-5 -mt-1 sm:mt-0',
      className
    )}>
      <Container ref={containerRef} className="flex items-center justify-between gap-2 sm:gap-5">
        <div className="flex items-center gap-2 sm:gap-5 w-full">
          <div style={{ width: categoriesWidth }} className="overflow-x-auto">
            <Categories items={categories} />
          </div>
          {!isHeaderVisible && isLargeScreen && (
            <div ref={buttonsRef} className="flex items-center gap-2 sm:gap-3 shrink-0">
              <CartButton />
              <ProfileButton />
            </div>
          )}
        </div>
      </Container>
    </div>
);
};