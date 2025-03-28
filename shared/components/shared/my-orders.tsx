'use client';

import React from 'react';
import { OrderStatus, DeliveryType, Order, PaymentMethod } from '@prisma/client';
import { cn } from '@/shared/lib/utils';
import { MyOrdersBlock } from './my-orders-block';

interface MyOrdersProps {
  orders: Order[];
}

export const MyOrders = ({ orders }: MyOrdersProps) => {
  const getStatusText = (status: OrderStatus, deliveryType: DeliveryType, paymentMethod: PaymentMethod) => {
    switch (status) {
      case 'PENDING':
        return paymentMethod === 'ONLINE' ? 'Ожидает оплаты' : 'Принят';
      case 'SUCCEEDED':
        return deliveryType === 'DELIVERY' ? 'Оплачен, готовится к отправке' : 'Оплачен, готовится';
      case 'DELIVERY':
        return 'В пути';
      case 'READY':
        return 'Готов к получению';
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
      case 'SUCCEEDED':
      case 'READY':
        return 'text-blue-600';
      case 'DELIVERY':
        return 'text-purple-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'CANCELLED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDeliveryInfo = (deliveryType: DeliveryType) => {
    return deliveryType === 'DELIVERY' ? 'Доставка' : 'Самовывоз';
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return 'Не указано';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parseOrderItems = (items: any) => {
    try {
      if (typeof items === 'string') {
        return JSON.parse(items);
      }
      return items || [];
    } catch (e) {
      console.error('Error parsing order items', e);
      return [];
    }
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const items = parseOrderItems(order.items);
        const totalItemsAmount = items.reduce(
          (sum: number, item: any) => sum + (item.product?.price || item.price || 0) * (item.quantity || 1),
          0
        );

        return (
          <MyOrdersBlock key={order.id} className="p-6">
            <div className="space-y-4">
              {/* Заголовок заказа */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">Заказ #{order.id}</h3>
                  <p className="text-sm text-gray-500">{getDeliveryInfo(order.deliveryType)}</p>
                </div>
                <span className={cn('text-sm font-medium', getStatusColor(order.status))}>
                  {getStatusText(order.status, order.deliveryType, order.paymentMethod)}
                </span>
              </div>

              {/* Информация о клиенте */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Клиент:</span>
                  <span>{order.fullName}</span>
                </div>
                {order.deliveryType === 'DELIVERY' && order.address && (
                  <div className="flex justify-between">
                    <span className="font-medium">Адрес:</span>
                    <span className="text-right">{order.address}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{order.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Телефон:</span>
                  <span>{order.phone}</span>
                </div>
                {order.comment && (
                  <div className="flex justify-between">
                    <span className="font-medium">Комментарий:</span>
                    <span className="text-right">{order.comment}</span>
                  </div>
                )}
              </div>

              {/* Состав заказа */}
              <div className="border-t border-gray-100 pt-3">
                <h4 className="font-medium mb-2">Состав заказа:</h4>
                <ul className="space-y-2">
                  {items.map((item: any, index: number) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.product?.name || item.name}</span>
                      <span>
                        {item.product?.price || item.price} ₽ × {item.quantity} шт.
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Итоговая информация */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Способ оплаты:</span>
                  <span>{order.paymentMethod === 'ONLINE' ? 'Онлайн' : 'При получении'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Стоимость товаров:</span>
                  <span>{totalItemsAmount} ₽</span>
                </div>
                {order.deliveryType === 'DELIVERY' && order.deliveryCost !== null && (
                  <div className="flex justify-between">
                    <span>Доставка:</span>
                    <span>{order.deliveryCost} ₽</span>
                  </div>
                )}
                {order.bonusDelta !== 0 && (
                  <div className="flex justify-between">
                    <span>Бонусы:</span>
                    <span className={order.bonusDelta > 0 ? 'text-green-600' : 'text-red-600'}>
                      {order.bonusDelta > 0 ? '+' : ''}{order.bonusDelta} ₽
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Итого:</span>
                  <span>{order.totalAmount} ₽</span>
                </div>
              </div>

              {/* Даты */}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Дата создания:</span>
                  <span>{formatDateTime(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">
                    {order.deliveryType === 'DELIVERY' ? 'Доставка к:' : 'Самовывоз к:'}
                  </span>
                  <span>{formatDateTime(order.deliveryTime)}</span>
                </div>
              </div>
            </div>
          </MyOrdersBlock>
        );
      })}
    </div>
  );
};