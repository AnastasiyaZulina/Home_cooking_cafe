'use client';

import React from 'react';
import { User } from '@prisma/client';
import { ProfileForm } from './profile-form';
import { Container } from './container';
import { Title } from './title';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { MyOrders } from './my-orders';

interface ProfileLayoutProps {
  user: User;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({ user }) => {
  const pathname = usePathname();

  return (
    <Container className="my-6 md:my-10 px-4 ">
      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        {/* Боковое меню - видно только на десктопе */}
        <div className="hidden md:flex flex-col w-64 gap-2">
          <Link
            href="/profile"
            className={cn(
              'px-4 py-3 rounded-lg font-medium',
              pathname === '/profile' ? 'bg-primary text-white' : 'hover:bg-gray-100'
            )}
          >
            Мои заказы
          </Link>
          <Link
            href="/profile/data"
            className={cn(
              'px-4 py-3 rounded-lg font-medium',
              pathname === '/profile/data' ? 'bg-primary text-white' : 'hover:bg-gray-100'
            )}
          >
            Данные профиля
          </Link>
        </div>

        {/* Основное содержимое */}
        <div className="flex-1">
          {pathname === '/profile' && (
            <div>
              <Title text="Мои заказы" size="md" className="font-bold text-center mb-2" />
              <MyOrders />
            </div>
          )}

          {pathname === '/profile/data' && <ProfileForm data={user} />}
        </div>
      </div>
    </Container>
  );
};