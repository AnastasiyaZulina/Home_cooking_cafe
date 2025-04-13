'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';

export default function AdminContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
      {/* Боковое меню */}
      <div className="hidden md:flex flex-col w-64 gap-2 p-4 bg-white border-r shrink-0">
        <nav className="space-y-1">
          <Link
            href="/admin/categories"
            className={cn(
              'px-4 py-3 rounded-lg font-medium flex',
              pathname === '/admin/categories'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            Категории
          </Link>
          <Link
            href="/admin/products"
            className={cn(
              'px-4 py-3 rounded-lg font-medium flex',
              pathname === '/admin/products'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            Товары
          </Link>
          <Link
            href="/admin/orders"
            className={cn(
              'px-4 py-3 rounded-lg font-medium flex',
              pathname === '/admin/orders'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            Заказы
          </Link>
          <Link
            href="/admin/users"
            className={cn(
              'px-4 py-3 rounded-lg font-medium flex',
              pathname === '/admin/users'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            Пользователи
          </Link>
          <Link
            href="/admin/feedbacks"
            className={cn(
              'px-4 py-3 rounded-lg font-medium flex',
              pathname === '/admin/feedbacks'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            Отзывы
          </Link>
        </nav>
      </div>

      {/* Основной контент */}
      <div className="flex-1 p-6 min-w-0">
      <div className="bg-white rounded-lg shadow-sm p-6 h-full">
          {children}
        </div>
      </div>
    </div>
  );
}