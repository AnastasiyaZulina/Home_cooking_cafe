'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DeliveryType, PaymentMethod, OrderStatus } from '@prisma/client';
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
import { CHECKOUT_CONSTANTS } from '@/shared/constants';
import { UserSelect } from '@/app/admin/components/user-select';
import { OrderSummary } from '@/app/admin/components/order-summary';
import { OrderFormSchema, OrderUpdateFormSchema, OrderUpdateFormValues } from '@/app/admin/schemas/order-form-schema';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { ProductSelectorEdit } from '@/app/admin/components/product-selector-edit';

type Product = {
    id: number;
    name: string;
    stockQuantity: number;
    price: number;
    isAvailable: boolean;
};

type OrderItem = {
    productId: number;
    quantity: number;
    productName: string;
    stockQuantity: number;
    productPrice: number;
};

type User = {
    id: number;
    name: string;
    email: string;
    phone?: string;
    bonusBalance: number;
    verified?: Date | null;
};

const Datetime = dynamic(
    () => import('react-datetime'),
    { ssr: false }
);

type OrderDetails = OrderUpdateFormValues & {
    id: number;
};

export default function EditOrderPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
    const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [bonusOption, setBonusOption] = useState<'earn' | 'spend'>('earn');
    const [spentBonuses, setSpentBonuses] = useState(0);
    const [userBonuses, setUserBonuses] = useState(0);
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('DELIVERY');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE');
    const [isEditingItems, setIsEditingItems] = useState(false);
    const datetimeRef = useRef<HTMLDivElement>(null);
    const [originalProductsStock, setOriginalProductsStock] = useState<Record<number, number>>({});

    const form = useForm<OrderUpdateFormValues>({
        resolver: zodResolver(OrderUpdateFormSchema),
        defaultValues: {
            deliveryType: 'DELIVERY',
            paymentMethod: 'ONLINE',
            status: 'PENDING',
            deliveryPrice: 0,
            deliveryTime: new Date(),
            bonusDelta: 0,
            items: [],
            updatedAt: new Date()
        }
    });

    const { control, handleSubmit, setValue, watch, reset, resetField } = form;
    const currentStatus = watch('status');
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    });

    // Загрузка данных заказа
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/admin/orders/${id}`);
                if (!response.ok) throw new Error('Ошибка загрузки заказа');
                const data = await response.json();

                const deliveryTime = new Date(data.deliveryTime);

                const initialStock: Record<number, number> = {};
                data.items.forEach((item: any) => {
                    initialStock[item.productId] = item.product.stockQuantity + item.productQuantity;
                });
                setOriginalProductsStock(initialStock);

                reset({
                    ...data,
                    deliveryTime,
                    items: data.items.map((item: any) => ({
                        ...item,
                        productId: item.productId,
                        quantity: item.productQuantity,
                        productName: item.productName,
                        productPrice: item.productPrice,
                        stockQuantity: item.product.stockQuantity
                    }))
                });

                setOrder(data);
                setSpentBonuses(Math.abs(data.bonusDelta));
                setBonusOption(data.bonusDelta >= 0 ? 'earn' : 'spend');
                setLoading(false);
            } catch (error) {
                console.error('Ошибка:', error);
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, reset]);

    // Загрузка продуктов и пользователей
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, usersRes] = await Promise.all([
                    fetch(`/api/admin/orders/${id}/edit/products`),
                    fetch('/api/admin/users')
                ]);

                if (!productsRes.ok || !usersRes.ok) throw new Error('Ошибка загрузки данных');

                const [productsData, usersData] = await Promise.all([
                    productsRes.json(),
                    usersRes.json()
                ]);

                setOriginalProducts(productsData);
                setCurrentProducts(productsData);
                setUsers(usersData);
            } catch (error) {
                console.error('Ошибка:', error);
            }
        };

        fetchData();
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

    const [originalItems, setOriginalItems] = useState<OrderItem[]>([]);
    const handleEditItems = () => {
        // Сохраняем оригинальные товары
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
        // Восстанавливаем оригинальные товары
        form.setValue('items', originalItems);

        // Восстанавливаем оригинальные продукты
        setCurrentProducts(originalProducts);
        setIsEditingItems(false);
    };
    
    const handleSaveItems = async () => {
        const isValid = await form.trigger('items');

        if (!isValid) return;

        // Обновляем оригинальные товары
        const currentItems = form.getValues('items');
        setOriginalItems([...currentItems]);
        setIsEditingItems(false);
    };

    const items = watch('items') || [];
    const totalAmount = items.reduce(
        (sum, item) => sum + (item.productPrice * item.quantity),
        0
    );

    const onSubmit = async (data: z.infer<typeof OrderUpdateFormSchema>) => {
        try {
            const payload = {
                ...data,
                id: Number(id),
                bonusDelta: bonusOption === 'earn'
                    ? Math.round(totalAmount * CHECKOUT_CONSTANTS.BONUS_MULTIPLIER)
                    : -spentBonuses,
                items: data.items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            };

            const response = await fetch(`/api/admin/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Ошибка обновления заказа');

            router.push('/admin/orders');
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };

    if (loading) return <div>Загрузка...</div>;
    if (!order) return <div>Заказ не найден</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Редактирование заказа #{order.id}</h1>
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

                        {!isEditingItems ? (
                            <WhiteBlock title="Товары в заказе" className="mt-6">
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
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
                                            Отмена
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
                                                {['PENDING', 'SUCCEEDED', 'DELIVERY', 'READY', 'COMPLETED', 'CANCELLED'].map((status) => (
                                                    <SelectItem key={status} value={status}>
                                                        {status === 'PENDING' && 'Ожидает оплаты'}
                                                        {status === 'SUCCEEDED' && 'Оплачен'}
                                                        {status === 'DELIVERY' && 'В пути'}
                                                        {status === 'READY' && 'Готов к получению'}
                                                        {status === 'COMPLETED' && 'Завершён'}
                                                        {status === 'CANCELLED' && 'Отменён'}
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
                        <Button type="submit" className="px-6 py-3">
                            Сохранить изменения
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}