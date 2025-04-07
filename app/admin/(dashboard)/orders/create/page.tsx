'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DeliveryType, PaymentMethod, OrderStatus } from '@prisma/client';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Button } from '@/shared/components/ui/button';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { FormInput, FormTextarea, WhiteBlock } from '@/shared/components';
import 'react-datetime/css/react-datetime.css';
import { FormProvider } from 'react-hook-form';
import { PhoneInput } from '@/shared/components/shared/phone-input';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { Trash } from 'lucide-react';
type Product = {
  id: number;
  name: string;
  stockQuantity: number;
};
const OrderFormSchema = z.object({
  userId: z.number().optional(),
  firstname: z.string().min(2, { message: 'Имя должно содержать не менее двух символов' }),
  email: z.string().email({ message: 'Введите корректную почту' }),
  phone: z.string().min(11, { message: 'Введите корректный номер телефона' }),
  address: z.string().optional(),
  deliveryType: z.nativeEnum(DeliveryType),
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliveryPrice: z.number().optional().default(0),
  paymentKey: z.string().optional(),
  status: z.nativeEnum(OrderStatus),
  deliveryTime: z.date(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1, "Количество должно быть не менее 1"),
    productName: z.string(),
    stockQuantity: z.number()
  })).nonempty("Добавьте хотя бы один товар")
});

type OrderFormValues = z.infer<typeof OrderFormSchema>;

const CreateOrderPage = () => {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');
  const datetimeRef = useRef<HTMLDivElement>(null);

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
    },
  });

  const { control, handleSubmit, setValue, watch, resetField } = form;
  const [products, setProducts] = useState<Product[]>([]);
  const currentStatus = watch('status');
  const currentDeliveryType = watch('deliveryType');
  const currentPaymentMethod = watch('paymentMethod');
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  // Загрузка товаров при монтировании
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

  // Компонент для выбора товара
  const ProductSelector = ({ index }: { index: number }) => {
    const [open, setOpen] = useState(false);
    const selectedProductId = watch(`items.${index}.productId`);
    const selectedProduct = products.find(p => p.id === selectedProductId);
  
    return (
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <Controller
            name={`items.${index}.productId`}
            control={control}
            render={({ field }) => (
              <Select
                open={open}
                onOpenChange={setOpen}
                value={field.value ? String(field.value) : ""}
                onValueChange={(value) => {
                  const product = products.find(p => p.id === Number(value));
                  if (product) {
                    field.onChange(Number(value));
                    setValue(`items.${index}.productName`, product.name);
                    setValue(`items.${index}.stockQuantity`, product.stockQuantity);
                  }
                  setOpen(true);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите товар">
                    {selectedProduct ? `${selectedProduct.name}` : "Выберите товар"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {products.map(product => (
                    <SelectItem
                      key={product.id}
                      value={String(product.id)}
                    >
                      {product.name} (Доступно: {product.stockQuantity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
  
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">×</span>
          <FormInput
            name={`items.${index}.quantity`}
            type="number"
            min={1}
            max={selectedProduct?.stockQuantity || 1}
            required
            className="w-20"
          />
        </div>
  
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => remove(index)}
          className="text-destructive hover:text-destructive/80"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  // Очистка полей при изменении типа доставки
  useEffect(() => {
    resetField('status'); // Сбрасываем статус при изменении типа доставки
    if (currentDeliveryType === 'PICKUP') {
      resetField('address');
      resetField('deliveryPrice');
    }
  }, [currentDeliveryType, resetField]);

  // Очистка ключа платежа при изменении способа оплаты
  useEffect(() => {
    resetField('paymentKey');
  }, [currentPaymentMethod, resetField]);

  useEffect(() => {
    if (currentStatus === 'PENDING') {
      resetField('paymentKey');
    }
  }, [currentStatus, resetField]);

  // Обработчик клика вне компонента даты
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datetimeRef.current && !datetimeRef.current.contains(event.target as Node)) {
        const input = datetimeRef.current.querySelector('input');
        if (input) input.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSubmit = (data: OrderFormValues) => {
    console.log('Order data:', data);
    // Здесь будет логика отправки данных на сервер
  };

  const getAvailableStatuses = () => {
    if (deliveryType === 'DELIVERY' && paymentMethod === 'ONLINE') {
      return ['PENDING', 'SUCCEEDED', 'DELIVERY', 'COMPLETED'];
    } else if (deliveryType === 'PICKUP' && paymentMethod === 'ONLINE') {
      return ['PENDING', 'SUCCEEDED', 'READY', 'COMPLETED'];
    } else if (deliveryType === 'PICKUP' && paymentMethod === 'OFFLINE') {
      return ['PENDING', 'READY', 'COMPLETED'];
    }
    return [];
  };

  const getStatusLabel = (status: OrderStatus) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Создание нового заказа</h1>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Основная информация */}
            <WhiteBlock title="Основная информация" className="p-6">
              <div className="space-y-4">

                <FormInput
                  name="userId"
                  label="ID клиента"
                  type="number"
                  placeholder="Введите ID клиента"
                />

                <FormInput
                  name="firstname"
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

                <PhoneInput name="phone" label="Телефон" placeholder="+7(xxx)xxx-xx-xx" required />
              </div>
            </WhiteBlock>
            <WhiteBlock title="Товары в заказе" className="mt-6">
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <ProductSelector key={field.id} index={index} />
                ))}
                <Button
                  type="button"
                  onClick={() => append({
                    productId: 0,
                    quantity: 1,
                    productName: '',
                    stockQuantity: 0
                  })}
                >
                  Добавить товар
                </Button>
              </div>
            </WhiteBlock>
            {/* Доставка и оплата */}
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
                        resetField('status'); // Дополнительный сброс статуса
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
                    name="paymentKey"
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

            {/* Время доставки */}
            <WhiteBlock title="Время доставки" className="p-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium mb-2">Дата и время доставки</label>
                <div ref={datetimeRef}>
                  <Controller
                    name="deliveryTime"
                    control={control}
                    render={({ field }) => (
                      <div ref={datetimeRef}>
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
                      </div>
                    )}
                  />
                </div>
              </div>
            </WhiteBlock>
            {/* Статус заказа */}
            <WhiteBlock title="Статус заказа" className="p-6">
              <div className="space-y-4">
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableStatuses().map((status) => (
                          <SelectItem key={status} value={status}>
                            {getStatusLabel(status as OrderStatus)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                <FormTextarea
                  name="comment"
                  label="Комментарий к заказу"
                  placeholder="Введите комментарий"
                  rows={3}
                />
              </div>
            </WhiteBlock>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" className="px-6 py-3">
              Создать заказ
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default CreateOrderPage;