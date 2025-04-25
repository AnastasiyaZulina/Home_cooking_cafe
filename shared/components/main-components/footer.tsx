'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from './container';
import { cn } from '@/shared/lib/utils';
import { ArrowUp, Phone, MapPin } from 'lucide-react';
import { GLOBAL_CONSTANTS } from '@/shared/constants';
import { getOrderAcceptanceTime, getWorkingTime } from '@/shared/lib/calc-time';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const workingTime = getWorkingTime();
  const orderAcceptanceTime = getOrderAcceptanceTime();
  
  return (
    <footer className={cn('bg-white border-t mt-10 relative', className)}>
      <Container className="py-10 px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-gray-600">
        {/* Логотип и описание */}
        <div>
          <Link href="/" className="flex items-center gap-3 mb-4">
            <Image
              src="/logobig.png"
              alt="Logo"
              width={40}
              height={40}
              className="w-10 h-10"
            />
            <span className="font-bold uppercase text-lg">Скатерть-самобранка</span>
          </Link>
          <p className="mb-3">По-домашнему вкусно с доставкой на дом. Натуральные продукты, традиционные рецепты, забота о каждом клиенте.</p>
          <p>© {new Date().getFullYear()} Скатерть-самобранка. Все права защищены.</p>
        </div>

        {/* Навигация */}
        <div>
          <h3 className="font-semibold mb-3">Навигация</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="hover:text-primary transition-colors">О нас</Link>
            </li>
            <li>
              <Link href="/delivery" className="hover:text-primary transition-colors">Доставка</Link>
            </li>
            <li>
              <Link href="/feedback" className="hover:text-primary transition-colors">Отзывы</Link>
            </li>
            <li>
              <Link href="/bonus" className="hover:text-primary transition-colors">Бонусы</Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-primary transition-colors">Политика конфиденциальности</Link>
            </li>
          </ul>
        </div>

        {/* Время работы */}
        <div>
          <h3 className="font-semibold mb-3">Время работы</h3>
          <ul className="space-y-2">
            <li>Режим работы: {workingTime}</li>
            <li>Приём заказов: {orderAcceptanceTime}</li>
          </ul>
        </div>

        {/* Контакты */}
        <div>
          <h3 className="font-semibold mb-3">Контакты</h3>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              <a href={`tel:${GLOBAL_CONSTANTS.CONTACTS.PHONE}`}>{GLOBAL_CONSTANTS.CONTACTS.PHONE}</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-7 h-7 text-primary" />
              <p>{GLOBAL_CONSTANTS.CONTACTS.ADRESS}</p>
            </li>
          </ul>
        </div>
        <div className="col-span-full relative mt-8">
          <button
            onClick={handleScrollToTop}
            className="absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center gap-1 text-gray-600 hover:text-primary transition-colors"
            title="Наверх"
          >
            <span className="text-sm">Наверх</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </Container>
    </footer>
  );
};