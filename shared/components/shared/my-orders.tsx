'use client';

import React from 'react';
import { OrderStatus } from '@prisma/client';
import { cn } from '@/shared/lib/utils';
import { MyOrdersBlock } from './my-orders-block';

// Mock данные заказа
const mockOrders = [
  {
    id: 1,
    status: 'COMPLETED' as OrderStatus,
    items: [
      { name: 'Пицца Маргарита', price: 450, quantity: 1 },
      { name: 'Салат Цезарь', price: 320, quantity: 2 },
    ],
    totalAmount: 1090,
    deliveryCost: 250,
    bonusDelta: 54, // +54 бонуса
    createdAt: '2023-10-15T14:30:00Z',
  },
  {
    id: 2,
    status: 'DELIVERY' as OrderStatus,
    items: [
      { name: 'Ролл Филадельфия', price: 380, quantity: 3 },
      { name: 'Суп Том Ям', price: 280, quantity: 1 },
    ],
    totalAmount: 1420,
    deliveryCost: 250,
    bonusDelta: -100, // -100 бонусов
    createdAt: '2023-10-10T18:15:00Z',
  },
];

export const MyOrders = () => {
  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Обрабатывается';
        case 'SUCCEEDED':
            return 'Оплачен';
        case 'COMPLETED':
            return 'Завершён';
      case 'CANCELLED':
        return 'Отменён';
      default:
        return status;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {mockOrders.map((order) => (
        <MyOrdersBlock key={order.id} className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold">Заказ #{order.id}</h3>
              <span className={cn('text-sm font-medium', getStatusColor(order.status))}>
                {getStatusText(order.status)}
              </span>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <h4 className="font-medium mb-2">Состав заказа:</h4>
              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.name}</span>
                    <span>
                      {item.price} ₽ × {item.quantity} шт.
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between">
                <span>Стоимость товаров:</span>
                <span>{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Доставка:</span>
                <span>{order.deliveryCost} ₽</span>
              </div>
              <div className="flex justify-between">
                <span>Бонусы:</span>
                <span className={order.bonusDelta > 0 ? 'text-green-600' : 'text-red-600'}>
                  {order.bonusDelta > 0 ? '+' : ''}{order.bonusDelta} ₽
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2">
                <span>Итого:</span>
                <span>{order.totalAmount} ₽</span>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </MyOrdersBlock>
      ))}
    </div>
  );
};