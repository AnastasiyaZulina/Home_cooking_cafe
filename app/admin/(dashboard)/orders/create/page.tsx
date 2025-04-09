'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DeliveryType, PaymentMethod } from '@prisma/client';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput, FormTextarea, WhiteBlock } from '@/shared/components';
import 'react-datetime/css/react-datetime.css';
import { FormProvider } from 'react-hook-form';
import { PhoneInput } from '@/shared/components/shared/phone-input';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { CHECKOUT_CONSTANTS } from '@/shared/constants';
import { UserSelect } from '@/app/admin/components/user-select';
import { ProductSelector } from '@/app/admin/components/product-selector';
import { OrderSummary } from '@/app/admin/components/order-summary';
import { OrderFormSchema, OrderFormValues } from '@/app/admin/schemas/order-form-schema';
import toast from 'react-hot-toast';

type Product = {
  id: number;
  name: string;
  stockQuantity: number;
  price: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bonusBalance: number;
  verified?: Date | null;
};

const CreateOrderPage = () => {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');
  const datetimeRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bonusOption, setBonusOption] = useState<'earn' | 'spend'>('earn');
  const [spentBonuses, setSpentBonuses] = useState(0);
  const [userBonuses, setUserBonuses] = useState(0);
  const [loading, setLoading] = useState(false);
  const Datetime = dynamic(
    () => import('react-datetime'),
    {
      ssr: false,
      loading: () => (
        <input
          className="form-input w-full p-2 border rounded"
          placeholder="Загрузка выбора даты..."
        />
      )
    }
  );

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(OrderFormSchema),
    defaultValues: {
      deliveryType: 'DELIVERY',
      paymentMethod: 'ONLINE',
      status: 'PENDING',
      deliveryPrice: 0,
      deliveryTime: new Date(),
      bonusDelta: 0,
    },
  });

  const { control, handleSubmit, setValue, watch, resetField } = form;
  const currentStatus = watch('status');
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products');
        if (!response.ok) throw new Error('Ошибка загрузки товаров');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Ошибка:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) throw new Error('Ошибка загрузки пользователей');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleUserSelect = (userId: number | undefined) => {
    setBonusOption('earn');
    setSpentBonuses(0);

    if (!userId) {
      resetField('name');
      resetField('email');
      resetField('phone');
      setUserBonuses(0);
      return;
    }

    const selectedUser = users.find(u => u.id === userId);
    if (selectedUser) {
      setValue('name', selectedUser.name);
      setValue('email', selectedUser.email);
      setValue('phone', selectedUser.phone || '');
      setUserBonuses(selectedUser.bonusBalance);
    }
  };

  const items = watch('items') || [];
  const totalAmount = items.reduce(
    (sum, item) => sum + (item.productPrice * item.quantity),
    0
  );

  const onSubmit = async (data: OrderFormValues) => {
    setLoading(true);
    const payload = {
      ...data,
      deliveryTime: new Date(data.deliveryTime),
      bonusDelta: data.userId === undefined || data.userId === null
        ? 0
        : bonusOption === 'earn'
          ? Math.round(totalAmount * CHECKOUT_CONSTANTS.BONUS_MULTIPLIER)
          : -spentBonuses,
      items: data.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        productName: item.productName,
        productPrice: item.productPrice,
        stockQuantity: item.stockQuantity
      }))
    };

    console.log('Order data:', payload);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        const err = await res.json();
        console.error('Ошибка:', err);
        return;
      }
      toast.success('Заказ успешно оформлен!', { icon: '✅' });
      setLoading(false);
      await new Promise(resolve => setTimeout(resolve, 2000));
      location.href = '/admin/orders';
    } catch (err) {
      console.error('Ошибка при отправке заказа:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Создание нового заказа</h1>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WhiteBlock title="Основная информация" className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Клиент</label>
                  <UserSelect
                    users={users}
                    onUserSelect={handleUserSelect}
                  />
                </div>

                <FormInput
                  name="name"
                  label="Имя"
                  placeholder="Введите имя"
                  required
                />

                <FormInput
                  name="email"
                  label="Email"
                  placeholder="Введите email"
                  type="email"
                  required
                />

                <PhoneInput
                  name="phone"
                  label="Телефон"
                  placeholder="+7(xxx)xxx-xx-xx"
                  required
                />
              </div>
            </WhiteBlock>

            <WhiteBlock title="Товары в заказе" className="mt-6">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <ProductSelector
                    key={field.id}
                    index={index}
                    products={products.filter(product =>
                      !fields.some((f, i) =>
                        i !== index &&
                        f.productId === product.id
                      )
                    )}
                    onRemove={() => remove(index)}
                  />
                ))}

                <Button
                  type="button"
                  onClick={() => append({
                    productId: 0,
                    quantity: 1,
                    productName: '',
                    stockQuantity: 0,
                    productPrice: 0
                  })}
                >
                  Добавить товар
                </Button>
              </div>
            </WhiteBlock>

            <WhiteBlock title="Доставка и оплата" className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Тип доставки</label>
                  <RadioGroup.Root
                    value={deliveryType}
                    onValueChange={(value: DeliveryType) => {
                      setDeliveryType(value);
                      setValue('deliveryType', value);
                      if (value === 'DELIVERY') {
                        setPaymentMethod('ONLINE');
                        setValue('paymentMethod', 'ONLINE');
                      } else {
                        resetField('address');
                        resetField('deliveryPrice');
                        resetField('status');
                      }
                    }}
                    className="flex gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroup.Item
                        value="DELIVERY"
                        id="DELIVERY"
                        className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center"
                      >
                        <RadioGroup.Indicator className="w-3 h-3 rounded-full bg-primary" />
                      </RadioGroup.Item>
                      <label htmlFor="DELIVERY">Доставка</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroup.Item
                        value="PICKUP"
                        id="PICKUP"
                        className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center"
                      >
                        <RadioGroup.Indicator className="w-3 h-3 rounded-full bg-primary" />
                      </RadioGroup.Item>
                      <label htmlFor="PICKUP">Самовывоз</label>
                    </div>
                  </RadioGroup.Root>
                </div>

                {deliveryType === 'DELIVERY' && (
                  <>
                    <FormInput
                      name="address"
                      label="Адрес доставки"
                      placeholder="Введите адрес"
                      required
                    />

                    <FormInput
                      name="deliveryPrice"
                      label="Стоимость доставки"
                      type="number"
                      placeholder="Введите стоимость"
                      required
                    />
                  </>
                )}
                <div className="space-y-4">
                  <label className="block text-sm font-medium mb-2">Дата и время доставки</label>
                  <div ref={datetimeRef}>
                    <Controller
                      name="deliveryTime"
                      control={control}
                      render={({ field }) => (
                        <Datetime
                          value={field.value ? moment(field.value) : moment()}
                          onChange={(momentDate) => {
                            if (moment.isMoment(momentDate)) {
                              field.onChange(momentDate.toDate());
                            }
                          }}
                          inputProps={{
                            className: "form-input w-full p-2 border rounded",
                            placeholder: "Выберите дату и время",
                            readOnly: true
                          }}
                          dateFormat="DD.MM.YYYY"
                          timeFormat="HH:mm:ss"
                          closeOnSelect={false}
                        />
                      )}
                    />
                  </div>
                </div>


                <div>
                  <label className="block text-sm font-medium mb-2">Способ оплаты</label>
                  <RadioGroup.Root
                    value={paymentMethod}
                    onValueChange={(value: PaymentMethod) => {
                      setPaymentMethod(value);
                      setValue('paymentMethod', value);
                    }}
                    className="flex gap-4"
                    disabled={deliveryType === 'DELIVERY'}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroup.Item
                        value="ONLINE"
                        id="ONLINE"
                        className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center"
                      >
                        <RadioGroup.Indicator className="w-3 h-3 rounded-full bg-primary" />
                      </RadioGroup.Item>
                      <label htmlFor="ONLINE">Онлайн</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroup.Item
                        value="OFFLINE"
                        id="OFFLINE"
                        className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center"
                        disabled={deliveryType === 'DELIVERY'}
                      >
                        <RadioGroup.Indicator className="w-3 h-3 rounded-full bg-primary" />
                      </RadioGroup.Item>
                      <label htmlFor="OFFLINE">При получении</label>
                    </div>
                  </RadioGroup.Root>
                </div>

                {paymentMethod === 'ONLINE' && (
                  <FormInput
                    name="paymentId"
                    label="Ключ платежа"
                    placeholder={
                      currentStatus === 'PENDING'
                        ? 'Будет сгенерирован после создания заказа'
                        : 'Введите ключ платежа'
                    }
                    disabled={currentStatus === 'PENDING'}
                  />
                )}
              </div>
            </WhiteBlock>
            <WhiteBlock title="Статус заказа" className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Статус заказа</label>
                  <div className="p-2 border rounded bg-gray-50">
                    {paymentMethod === 'ONLINE' ? 'Ожидает оплаты' : 'Принят'}
                  </div>
                  <input type="hidden" {...form.register('status')} value="PENDING" />
                </div>

                <FormTextarea
                  name="comment"
                  label="Комментарий к заказу"
                  placeholder="Введите комментарий"
                  rows={3}
                />
              </div>
            </WhiteBlock>
            <OrderSummary
              totalAmount={totalAmount}
              userBonuses={userBonuses}
              spentBonuses={spentBonuses}
              bonusOption={bonusOption}
              setSpentBonuses={setSpentBonuses}
              setBonusOption={setBonusOption}
            />
          </div>

          <div className="mt-6 flex justify-center">
            <Button type="submit" className="px-6 py-3" loading={loading}>
              Создать заказ
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default CreateOrderPage;