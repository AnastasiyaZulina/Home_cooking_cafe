'use client';

import React, { useState } from 'react';
import { OrderStatus, DeliveryType, Order, PaymentMethod } from '@prisma/client';
import { cn } from '@/shared/lib/utils';
import { MyOrdersBlock } from './my-orders-block';
import { Button } from '../ui';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks';

interface MyOrdersProps {
  orders: Order[];
}

export const MyOrders = ({ orders }: MyOrdersProps) => {
  const { addCartItem, fetchCartItems } = useCart(false);
  const [isReordering, setIsReordering] = useState<Record<number, boolean>>({});

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

  const handleRepeatOrder = async (orderId: number, items: any[]) => {
    setIsReordering(prev => ({ ...prev, [orderId]: true }));
    
    const toastId = toast.loading('Добавляем товары в корзину...');
    let successCount = 0;
    const failedProducts: string[] = [];
  
    try {
      for (const item of items) {
        const productId = item.product?.id || item.productId;
        const productName = item.product?.name || item.name;
        
        try {
          // Проверяем доступность товара
          const checkResponse = await fetch(`/api/products/${productId}`);
          if (!checkResponse.ok) {
            failedProducts.push(productName);
            continue;
          }
  
          const product = await checkResponse.json();
          if (!product.isAvailable) {
            failedProducts.push(productName);
            continue;
          }
  
          // Используем метод из стора вместо прямого fetch
          await addCartItem({
            productId: product.id,
            quantity: item.quantity || 1
          });
          
          successCount++;
        } catch (error) {
          console.error(`Error adding product ${productId} to cart:`, error);
          failedProducts.push(productName);
        }
      }
  
      // Формируем финальное уведомление
      if (successCount > 0 && failedProducts.length > 0) {
        toast.success(
          `Успешно добавлено ${successCount} товаров. Не добавлено: ${failedProducts.join(', ')}`,
          { id: toastId }
        );
      } else if (successCount > 0) {
        toast.success(`Все товары (${successCount}) успешно добавлены в корзину`, { id: toastId });
      } else {
        toast.error(`Не удалось добавить товары: ${failedProducts.join(', ')}`, { id: toastId });
      }
    } catch (error) {
      console.error('Error repeating order:', error);
      toast.error('Произошла ошибка при добавлении товаров', { id: toastId });
    } finally {
      setIsReordering(prev => ({ ...prev, [orderId]: false }));
      // Обновляем данные корзины после всех операций
      fetchCartItems();
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
            {order.status === 'COMPLETED' && (
              <div className="border-t border-gray-100 pt-4">
                <Button
                  onClick={() => handleRepeatOrder(order.id, items)}
                  disabled={isReordering[order.id]}
                  className="w-full"
                  variant="default"
                >
                  {isReordering[order.id] ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Добавление...
                    </span>
                  ) : (
                    'Повторить заказ'
                  )}
                </Button>
              </div>
            )}
          </MyOrdersBlock>
        );
      })}
    </div>
  );
};