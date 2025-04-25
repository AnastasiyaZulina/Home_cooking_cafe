'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DeliveryType, PaymentMethod, OrderStatus, User } from '@prisma/client';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/components/ui/button';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { FormInput, FormTextarea, WhiteBlock } from '@/shared/components';
import { FormProvider } from 'react-hook-form';
import { PhoneInput } from '@/shared/components/shared/phone-input';
import moment from 'moment';
import dynamic from 'next/dynamic';
import { GLOBAL_CONSTANTS } from '@/shared/constants';
import { OrderSummary } from '@/app/admin/components/order-summary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ProductSelectorEdit } from '@/app/admin/components/product-selector-edit';
import toast from 'react-hot-toast';
import { OrderItem, OrderItemWithProduct } from '@/@types/orders';
import { Api } from '@/shared/services/api-clients';
import { Product } from '@/@types/product-types';
import { OrderUpdateFormSchema, OrderUpdateFormValues } from '@/shared/schemas/order-form-schema';

type OrderDetails = OrderUpdateFormValues & {
    id: number;
};

export default function EditOrderPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formloading, setFormLoading] = useState(true);
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [orderUser, setOrderUser] = useState<User | null>(null);
    const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
    const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
    const [bonusOption, setBonusOption] = useState<'earn' | 'spend'>('earn');
    const [spentBonuses, setSpentBonuses] = useState(0);
    const [userBonuses, setUserBonuses] = useState(0);
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');
    const [isEditingItems, setIsEditingItems] = useState(false);
    const datetimeRef = useRef<HTMLDivElement>(null);
    const [originalProductsStock, setOriginalProductsStock] = useState<Record<number, number>>({});

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

    const form = useForm<OrderUpdateFormValues>({
        resolver: zodResolver(OrderUpdateFormSchema),
        defaultValues: {
            status: 'SUCCEEDED',
            deliveryCost: 0,
            deliveryTime: new Date(),
            bonusDelta: 0,
            items: [],
        }
    });

    const { control, handleSubmit, setValue, watch, reset } = form;
    const currentStatus = watch('status');
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    });

    // Загрузка данных заказа
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderData = await Api.orders.getOrder(Number(id));

                if (orderData.userId) {
                    const userData = await Api.users.getUser(orderData.userId);
                    setOrderUser(userData);
                }

                const productsData = await Api.products.getProducts();

                const existingItems = orderData.items || [];
                const hasInvalidItems = existingItems.some((item: OrderItem) => item.productId == null);
                const allProductsExist = !hasInvalidItems && existingItems.every((item: OrderItem) =>
                    productsData.some((p: Product) => p.id === item.productId)
                );

                const isCancelledOrSucceeded = ['CANCELLED', 'COMPLETED'].includes(orderData.status);
                const editable = !isCancelledOrSucceeded && allProductsExist;

                if (!editable) { setFormLoading(false); return; }

                setOriginalProducts(productsData);
                setCurrentProducts(productsData);

                if (orderUser) {
                    setUserBonuses(orderUser.bonusBalance);
                }

                const deliveryTime = new Date(orderData.deliveryTime);

                const initialStock: Record<number, number> = {};
                orderData.items.forEach((item: OrderItemWithProduct) => {
                    initialStock[item.productId] = item.product.stockQuantity + item.productQuantity;
                });
                setOriginalProductsStock(initialStock);

                reset({
                    ...orderData,
                    deliveryTime,
                    items: orderData.items.map((item: OrderItemWithProduct) => ({
                        ...item,
                        productId: item.productId,
                        quantity: item.productQuantity,
                        productName: item.productName,
                        productPrice: item.productPrice,
                        stockQuantity: item.product.stockQuantity
                    }))
                });
                setDeliveryType(orderData.deliveryType);
                setPaymentMethod(orderData.paymentMethod);
                setOrder({
                    ...orderData,
                    deliveryTime,
                    items: orderData.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.productQuantity,
                        productName: item.productName,
                        productPrice: item.productPrice,
                        stockQuantity: item.product.stockQuantity,
                    })),
                });
                setSpentBonuses(Math.abs(orderData.bonusDelta));
                setBonusOption(orderData.bonusDelta >= 0 ? 'earn' : 'spend');
                setFormLoading(false);
            } catch (error) {
                console.error('Ошибка:', error);
                setFormLoading(false);
            }
        };

        fetchOrder();
    }, [id, reset]);

    const prevDeliveryTypeRef = useRef<DeliveryType>(deliveryType);

    // В эффекте изменения типа доставки
    useEffect(() => {
        if (deliveryType !== prevDeliveryTypeRef.current) {
            setValue('status', 'COMPLETED');
            prevDeliveryTypeRef.current = deliveryType;
        }
    }, [deliveryType, setValue]);

    const getAvailableStatuses = useCallback((): OrderStatus[] => {
        if (deliveryType === 'DELIVERY') {
            return ['PENDING', 'SUCCEEDED', 'DELIVERY', 'COMPLETED', 'CANCELLED'];
        }

        if (paymentMethod === 'ONLINE') {
            return ['PENDING', 'SUCCEEDED', 'READY', 'COMPLETED', 'CANCELLED'];
        }

        return ['PENDING', 'READY', 'COMPLETED', 'CANCELLED'];
    }, [deliveryType, paymentMethod]);

    useEffect(() => {
        const availableStatuses = getAvailableStatuses();
        if (!availableStatuses.includes(form.getValues('status'))) {
            setValue('status', availableStatuses[0]);
        }
    }, [getAvailableStatuses, deliveryType, paymentMethod, setValue, form]);

    const [originalItems, setOriginalItems] = useState<OrderUpdateFormValues['items']>([]);
    const handleEditItems = () => {
        const currentItems = form.getValues('items');
        setOriginalItems([...currentItems]);

        // Восстанавливаем оригинальные остатки только для товаров из заказа
        const updatedProducts = originalProducts.map(product => {
            if (originalProductsStock[product.id]) {
                return {
                    ...product,
                    stockQuantity: originalProductsStock[product.id]
                };
            }
            return product;
        });

        setCurrentProducts(updatedProducts);
        form.setValue('items', []);
        setIsEditingItems(true);
    };

    const handleCancelEditItems = () => {
        form.setValue('items', originalItems);
        setCurrentProducts(originalProducts);
        setIsEditingItems(false);
    };

    const handleSaveItems = async () => {
        const isValid = await form.trigger('items');

        if (!isValid) return;

        const formValues = form.getValues();
        setOriginalItems([...formValues.items]);
        toast('Список товаров успешно обновлён!👏');
        // Принудительно обновляем состояние формы
        reset({
            ...formValues,
            items: formValues.items.map(item => ({
                ...item,
                productName: item.productName,
                stockQuantity: item.stockQuantity,
                productPrice: item.productPrice
            }))
        });
    };

    const items = watch('items') || [];
    const totalAmount = items.reduce(
        (sum, item) => sum + (item.productPrice * item.quantity),
        0
    );

    const onSubmit = async (data: OrderUpdateFormValues) => {
        try {
            setLoading(true);
            if (!data.items || data.items.some(item => item.productId < 1) || data.items.length === 0) {
                toast.error('Пожалуйста, добавьте хотя бы один товар в заказ!');
                return;
            }
            if (data.status === 'PENDING') {
                form.setError('status', { message: 'Необходимо изменить статус заказа' });
                return;
            }
            const payload = {
                ...data,
                deliveryTime: new Date(data.deliveryTime),
                id: Number(id),
                bonusDelta: bonusOption === 'earn'
                    ? Math.round(totalAmount * GLOBAL_CONSTANTS.BONUS_MULTIPLIER)
                    : -spentBonuses,
                items: data.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    productName: item.productName,
                    productPrice: item.productPrice,
                    stockQuantity: item.stockQuantity
                }))
            };

            await Api.orders.updateOrder(Number(id), payload);
            toast.success('Заказ успешно обновлён!', { icon: '✅' });
            setLoading(false);
            await new Promise(resolve => setTimeout(resolve, 2000));
            location.href = '/admin/orders';
        } catch (err) {
            console.error('Ошибка при обновлении заказа:', err);
        }
    };


    if (formloading) return <div>Загрузка...</div>;
    if (!order) return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Редактирование заказа невозможно</h1>
            <div className="bg-white rounded-lg p-6 shadow">
                <p className="text-lg text-red-500">
                    Заказ не найден, завершён, отменён или содержит недоступные товары.
                </p>
                <Button
                    onClick={() => router.back()}
                    className="mt-4"
                >
                    Вернуться назад
                </Button>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Редактирование заказа #{order.id}</h1>
            <FormProvider {...form}>
                <form onSubmit={handleSubmit(onSubmit, (errors) => {
                    console.log('Validation errors:', errors);
                })}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <WhiteBlock title="Основная информация" className="p-6">
                            {orderUser && <><div className="text-sm">
                                <label className="block text-sm font-medium mb-2">Клиент</label>
                                <p>ID: #{orderUser?.id}</p>
                                <p>Имя: {orderUser?.name}</p>
                                <p>Email: {orderUser?.email}</p>
                                <p>Бонусы: {orderUser?.bonusBalance}</p>
                            </div><br /></>}

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
                        </WhiteBlock>

                        {!isEditingItems ? (
                            <WhiteBlock title="Товары в заказе" className="mt-6">
                                <div className="space-y-4">
                                    {fields.map((field) => (
                                        <div
                                            key={field.id}
                                            className="flex justify-between items-center p-3 border rounded-lg"
                                        >
                                            <div>
                                                <p className="font-medium">{field.productName}</p>
                                                <p className="text-sm text-gray-500">
                                                    {field.quantity} × {field.productPrice} ₽
                                                </p>
                                            </div>
                                            <p className="font-medium">
                                                {field.quantity * field.productPrice} ₽
                                            </p>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        onClick={handleEditItems}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Изменить список товаров
                                    </Button>
                                </div>
                            </WhiteBlock>
                        ) : (
                            <WhiteBlock title="Редактирование товаров" className="mt-6">
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <ProductSelectorEdit
                                            key={field.id}
                                            index={index}
                                            products={currentProducts.filter(product =>
                                                !fields.some((f, i) =>
                                                    i !== index && f.productId === product.id
                                                )
                                            )}
                                            onRemove={() => remove(index)}
                                        />
                                    ))}
                                    <Button
                                        type="button"
                                        onClick={() => append({
                                            productId: 0,
                                            quantity: 0,
                                            productName: '',
                                            stockQuantity: 0,
                                            productPrice: 0
                                        })}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Добавить товар
                                    </Button>
                                    <div className="flex gap-4 mt-4">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={handleCancelEditItems}
                                            className="flex-1"
                                        >
                                            Назад
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={handleSaveItems}
                                            className="flex-1"
                                        >
                                            Сохранить список товаров
                                        </Button>
                                    </div>
                                </div>
                            </WhiteBlock>
                        )}

                        <WhiteBlock title="Доставка и оплата" className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Тип доставки</label>
                                    <RadioGroup.Root
                                        value={deliveryType}
                                        onValueChange={(value: DeliveryType) => {
                                            const prevDeliveryType = deliveryType;
                                            setDeliveryType(value);
                                            setValue('deliveryType', value);

                                            if (value === 'DELIVERY') {
                                                setPaymentMethod('ONLINE');
                                                setValue('paymentMethod', 'ONLINE');
                                            } else {
                                                setValue('address', '');
                                                setValue('deliveryCost', 0);
                                            }

                                            // Принудительно обновляем статус
                                            if (value !== prevDeliveryType) {
                                                setValue('status', 'COMPLETED');
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
                                            name="deliveryCost"
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
                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field, fieldState }) => {
                                        // Функция для получения списка доступных статусов
                                        const availableStatuses = getAvailableStatuses();

                                        // Функция для получения названия статуса
                                        const getStatusLabel = (status: OrderStatus) => {
                                            switch (status) {
                                                case 'PENDING':
                                                    return paymentMethod === 'ONLINE' ? 'Ожидает оплаты' : 'Принят';
                                                case 'SUCCEEDED':
                                                    return deliveryType === 'DELIVERY'
                                                        ? 'Оплачен, готовится к отправке'
                                                        : 'Оплачен, готовится';
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
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Статус заказа</label>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        {fieldState.error && (
                                                            <span className="text-red-500 mr-2">⚠</span>
                                                        )}
                                                        <SelectValue placeholder="Выберите статус">
                                                            {getStatusLabel(field.value as OrderStatus)}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableStatuses.map((status) => (
                                                            <SelectItem
                                                                key={status}
                                                                value={status}
                                                                disabled={status === 'PENDING' && field.value !== 'PENDING'}
                                                            >
                                                                {getStatusLabel(status)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {fieldState.error && (
                                                    <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
                                                )}
                                            </div>
                                        );
                                    }}
                                />

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

                    <div className="mt-6 flex justify-center gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Назад
                        </Button>
                        <Button type="submit" className="px-6 py-3" loading={loading}>
                            Сохранить изменения
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}