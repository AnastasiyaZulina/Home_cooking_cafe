'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DeliveryType, PaymentMethod, OrderStatus } from '@prisma/client';
import { Controller, useFieldArray, useForm, useFormContext } from 'react-hook-form';
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
import { Slider } from '@/shared/components/ui/slider';
import { CHECKOUT_CONSTANTS } from '@/shared/constants';

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

const OrderFormSchema = z.object({
  userId: z.number().optional(),
  name: z.string().min(2, { message: 'Имя должно содержать не менее двух символов' }),
  email: z.string().email({ message: 'Введите корректную почту' }),
  phone: z.string().min(11, { message: 'Введите корректный номер телефона' }),
  address: z.string().optional(),
  deliveryType: z.nativeEnum(DeliveryType),
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliveryPrice: z.number().optional().default(0),
  paymentId: z.string().optional(),
  status: z.nativeEnum(OrderStatus),
  deliveryTime: z.date(),
  bonusDelta: z.number().default(0),
  items: z.array(
    z.object({
      productId: z.number().min(1, "Выберите товар"),
      quantity: z.number().min(1),
      productName: z.string(),
      stockQuantity: z.number(),
      productPrice: z.number()
    }).refine(data => data.quantity <= data.stockQuantity, {
      message: "Количество превышает доступный запас",
      path: ["quantity"]
    })
  ).nonempty("Добавьте хотя бы один товар")
});

type OrderFormValues = z.infer<typeof OrderFormSchema>;

const CreateOrderPage = () => {
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');
  const datetimeRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [bonusOption, setBonusOption] = useState<'earn' | 'spend'>('earn');
  const [spentBonuses, setSpentBonuses] = useState(0);
  const [userBonuses, setUserBonuses] = useState(0);

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
    setSelectedUserId(userId || null);
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

  const ProductSelector = ({ index }: { index: number }) => {
    const [open, setOpen] = useState(false);
    const selectedProductId = watch(`items.${index}.productId`);
    const selectedProduct = products.find(p => p.id === selectedProductId);
    const { formState: { errors } } = useFormContext<OrderFormValues>();

    return (
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1">
          <Controller
            name={`items.${index}.productId`}
            control={control}
            render={({ field }) => (
              <div>
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
                      setValue(`items.${index}.productPrice`, product.price);
                    }
                    setOpen(true);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите товар">
                      {selectedProduct ?
                        `${selectedProduct.name} - ${selectedProduct.price} ₽`
                        : "Выберите товар"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={String(product.id)}>
                        {product.name} (Доступно: {product.stockQuantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(errors.items as any)?.[index]?.productId && (
                  <p className="text-sm text-red-500 mt-1">
                    {(errors.items as any)[index].productId.message}
                  </p>
                )}
              </div>
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
          {(errors.items as any)?.[index]?.quantity && (
            <p className="text-sm text-red-500">
              {(errors.items as any)[index].quantity.message}
            </p>
          )}
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

  const UserSelect = () => (
    <Controller
      name="userId"
      control={control}
      render={({ field }) => (
        <Select
          value={field.value !== undefined ? String(field.value) : "unselected"}
          onValueChange={(value) => {
            const userId = value !== "unselected" ? parseInt(value) : undefined;
            field.onChange(userId);
            handleUserSelect(userId);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Выберите клиента" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unselected">Не выбрано</SelectItem>
            {users.map(user => (
              <SelectItem key={user.id} value={String(user.id)}>
                #{user.id} - {user.name} ({user.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );

  const BonusOptions = () => {
    const { watch } = useFormContext<OrderFormValues>();
    const items = watch('items') || [];
    const totalAmount = items.reduce(
      (sum, item) => sum + (item.productPrice * item.quantity),
      0
    );
    const maxAvailableToSpend = Math.min(userBonuses, totalAmount);

    return (
      <div className="mb-4">
        <RadioGroup.Root
          value={bonusOption}
          onValueChange={(value: 'earn' | 'spend') => setBonusOption(value)}
          className="flex items-center gap-4 mb-4"
        >
          <div className="flex items-center gap-2">
            <RadioGroup.Item
              value="earn"
              id="earnBonuses"
              className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-400"
            >
              <RadioGroup.Indicator className="w-4 h-4 rounded-full bg-primary" />
            </RadioGroup.Item>
            <label htmlFor="earnBonuses">
              Начислить бонусы (+{Math.round(totalAmount * CHECKOUT_CONSTANTS.BONUS_MULTIPLIER)} ₽)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <RadioGroup.Item
              value="spend"
              id="spendBonuses"
              className={`flex items-center justify-center w-6 h-6 rounded-full border ${userBonuses <= 0 ? 'border-gray-300 opacity-50' : 'border-gray-400'
                }`}
              disabled={userBonuses <= 0}
            >
              <RadioGroup.Indicator className="w-4 h-4 rounded-full bg-primary" />
            </RadioGroup.Item>
            <label
              htmlFor="spendBonuses"
              className={userBonuses <= 0 ? 'opacity-50' : ''}
            >
              Списать бонусы {userBonuses > 0 && `(до ${maxAvailableToSpend} ₽)`}
            </label>
          </div>
        </RadioGroup.Root>

        {bonusOption === 'spend' && userBonuses > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Списать: {spentBonuses} ₽</span>
              <span>Доступно: {userBonuses} ₽</span>
            </div>

            <Slider
              value={[spentBonuses]}
              max={maxAvailableToSpend}
              step={1}
              onValueChange={(value) => setSpentBonuses(value[0])}
            />
          </div>
        )}
      </div>
    );
  };

  const OrderSummary = () => {
    const { watch } = useFormContext<OrderFormValues>();
    const items = watch('items') || [];
    const deliveryPrice = watch('deliveryPrice') || 0;
    const userId = watch('userId');

    const totalAmount = items.reduce(
      (sum, item) => sum + (item.productPrice * item.quantity),
      0
    );

    const { totalPrice, bonusDelta } = bonusOption === 'earn'
      ? {
        totalPrice: totalAmount + deliveryPrice,
        bonusDelta: userId ? Math.round(totalAmount * CHECKOUT_CONSTANTS.BONUS_MULTIPLIER) : 0
      }
      : {
        totalPrice: totalAmount + deliveryPrice - spentBonuses,
        bonusDelta: -spentBonuses
      };

    return (
      <WhiteBlock title="Итоговая информация" className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>Стоимость товаров:</span>
            <span>{totalAmount} ₽</span>
          </div>

          <div className="flex justify-between">
            <span>Стоимость доставки:</span>
            <span>{deliveryPrice} ₽</span>
          </div>

          {userId && <BonusOptions />}

          <div className="flex justify-between font-bold border-t pt-3">
            <span>Итого:</span>
            <span>{totalPrice} ₽</span>
          </div>

          {userId && (
            <div className="flex justify-between text-sm text-primary">
              <span>Изменение бонусов:</span>
              <span>{bonusDelta > 0 ? '+' : ''}{bonusDelta} ₽</span>
            </div>
          )}
        </div>
      </WhiteBlock>
    );
  };

  const onSubmit = (data: OrderFormValues) => {
    const totalAmount = data.items.reduce(
      (sum, item) => sum + (item.productPrice * item.quantity),
      0
    );

    const payload = {
      ...data,
      bonusDelta: bonusOption === 'earn'
        ? Math.round(totalAmount * CHECKOUT_CONSTANTS.BONUS_MULTIPLIER)
        : -spentBonuses,
      items: data.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        productName: item.productName, // Добавляем название
        productPrice: item.productPrice // Добавляем цену
      }))
    };

    console.log('Order data:', payload);
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
                  <UserSelect />
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
                  <ProductSelector key={field.id} index={index} />
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
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберите статус" />
                      </SelectTrigger>
                      <SelectContent>
                        {['PENDING', 'SUCCEEDED', 'DELIVERY', 'READY', 'COMPLETED'].map((status) => (
                          <SelectItem key={status} value={status}>
                            {status === 'PENDING' && 'Ожидает оплаты'}
                            {status === 'SUCCEEDED' && 'Оплачен'}
                            {status === 'DELIVERY' && 'В пути'}
                            {status === 'READY' && 'Готов к получению'}
                            {status === 'COMPLETED' && 'Завершён'}
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
            <OrderSummary />
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