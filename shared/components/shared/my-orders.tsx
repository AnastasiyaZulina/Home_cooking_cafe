'use client';

import React, { useState } from 'react';
import { OrderStatus, DeliveryType, Order, PaymentMethod, OrderItem } from '@prisma/client';
import { cn } from '@/shared/lib/utils';
import { GrayBlock } from './gray-block';
import { Button } from '../ui';
import toast from 'react-hot-toast';
import { useCart } from '@/hooks';
import { Title } from './title';

interface MyOrdersProps {
  orders: (Order & {
    items: OrderItem[];
  })[];
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

  const handleRepeatOrder = async (orderId: number, items: OrderItem[]) => {
    setIsReordering(prev => ({ ...prev, [orderId]: true }));
  
    const toastId = toast.loading('Добавляем товары в корзину...');
    let successCount = 0;
    const failedProducts: string[] = [];
    const adjustedProducts: {name: string, originalQty: number, newQty: number}[] = [];
  
    try {
      for (const item of items) {
        try {
          // Проверяем доступность товара
          const checkResponse = await fetch(`/api/products/${item.productId}`);
          if (!checkResponse.ok) {
            failedProducts.push(item.productName);
            continue;
          }
  
          const product = await checkResponse.json();
          if (!product.isAvailable) {
            failedProducts.push(item.productName);
            continue;
          }
  
          // Проверяем доступное количество
          const availableQuantity = product.stockQuantity;
          const quantityToAdd = Math.min(item.productQuantity, availableQuantity);
  
          // Если количество пришлось уменьшить, добавляем в список скорректированных
          if (quantityToAdd < item.productQuantity) {
            adjustedProducts.push({
              name: item.productName,
              originalQty: item.productQuantity,
              newQty: quantityToAdd
            });
          }

          if (item.productId){
          // Добавляем товар с учетом доступного количества
          await addCartItem({
            productId: item.productId,
            quantity: quantityToAdd
          });
          }
          successCount++;
        } catch (error) {
          console.error(`Error adding product ${item.productId} to cart:`, error);
          failedProducts.push(item.productName);
        }
      }
  
      // Показываем уведомления о скорректированных количествах
      if (adjustedProducts.length > 0) {
        adjustedProducts.forEach(adj => {
          toast.error(
            `Количество "${adj.name}" уменьшено с ${adj.originalQty} до ${adj.newQty} (максимально доступное)`,
            { id: `adjusted-${adj.name}`, duration: 5000 }
          );
        });
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

  return (
    <div className="space-y-4">
      <Title text="Мои заказы" size="md" className="font-bold text-center mb-2" />
      {orders.map((order) => {
        const items = order.items;
        const totalItemsAmount = items.reduce(
          (sum: number, item: OrderItem) => sum + item.productPrice * item.productQuantity,
          0
        );

        return (
          <GrayBlock key={order.id} className="p-6">
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
                  <span>{order.name}</span>
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
                  {items.map((item: OrderItem, index: number) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.productName}</span>
                      <span>
                        {item.productPrice} ₽ × {item.productQuantity} шт.
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
                  <span>{totalItemsAmount + (order.deliveryCost || 0)} ₽</span>
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
          </GrayBlock>
        );
      })}
    </div>
  );
};