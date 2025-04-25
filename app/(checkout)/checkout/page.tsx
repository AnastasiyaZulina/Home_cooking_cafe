'use client';

import { CheckoutAddressForm, CheckoutCart, CheckoutItemDetails, CheckoutPersonalForm, Container, Title, WhiteBlock } from "@/shared/components";
import { useCart } from '@/hooks/use-cart';
import { Button, Skeleton } from "@/shared/components/ui";
import { ArrowRight, Package, Truck } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/shared/lib/utils";
import { createOrderUser, validateCart } from "@/app/actions";
import toast from "react-hot-toast";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Api } from "@/shared/services/api-clients";
import { DeliveryType, PaymentMethod } from "@prisma/client";
import { useRouter } from "next/navigation";
import { PaymentMethodOptions } from "@/shared/components/shared/payment-method-options";
import { BonusOptions } from "@/shared/components/shared/bonus-options";
import { GLOBAL_CONSTANTS } from '@/shared/constants';
import { DeliveryTimePicker, generateTimeSlots } from "@/shared/components/shared/delivery-time-picker";
import { CheckoutFormSchema, CheckoutFormValues } from "@/shared/schemas/checkout-form-schema";

export default function CheckoutPage() {
    const { items, loading, fetchCartItems } = useCart();
    const router = useRouter();
    const [isInitialLoad, setIsInitialLoad] = React.useState(true);

    React.useEffect(() => {
        const validateAndNotify = async () => {
            try {
                const { adjustments } = await validateCart();

                if (adjustments.length > 0) {
                    // Группируем изменения по типу
                    const removedItems = adjustments.filter(a => a.type === 'removed');
                    const reducedItems = adjustments.filter(a => a.type === 'reduced');

                    // Уведомление об удаленных товарах
                    if (removedItems.length > 0) {
                        const productNames = removedItems.map(i => i.productName).join(', ');
                        toast(
                            <div className="flex items-start">
                                <span>
                                    ⚠️Некоторые товары закончились и были удалены из корзины: <strong>{productNames}</strong>
                                </span>
                            </div>,
                            { duration: 5000 }
                        );
                    }

                    // Уведомления об уменьшенных количествах
                    reducedItems.forEach(item => {
                        toast(
                            <div className="flex items-start">
                                <span>
                                    ⚠️Количество <strong>{item.productName}</strong> уменьшено до {item.newQuantity} (максимально доступное)
                                </span>
                            </div>,
                            { duration: 5000 }
                        );
                    });

                    await fetchCartItems();
                }
            } catch (error) {
                console.error('Cart validation failed:', error);
            } finally {
                if (!items || items.length === 0) {
                    router.push('/checkout-empty');
                } else {
                    setIsInitialLoad(false);
                }
            }
        };

        if (!loading) {
            validateAndNotify();
        }
    }, [items, loading, router, fetchCartItems]);

    if (isInitialLoad && loading) {
        return <div className="p-4 text-center">Загрузка...</div>;
    }

    if (!items || items.length === 0) {
        return null;
    }

    return <CheckoutContent />;
}

function CheckoutContent() {
    const { totalAmount, updateItemQuantity, items, removeCartItem, loading } = useCart();
    const [submitting, setSubmitting] = React.useState(false);
    const { data: session } = useSession();
    const [spentBonuses, setSpentBonuses] = React.useState(0);
    const timeSlots = React.useMemo(() => generateTimeSlots(), []);
    const isWorkingHours = timeSlots.length > 0;
    const [deliveryPrice, setDeliveryPrice] = useState(0);
    const [lastDeliveryPrice, setLastDeliveryPrice] = useState(0);
    const minTotalAmount = GLOBAL_CONSTANTS.MIN_DELIVERY_TOTAL_AMOUNT;

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(CheckoutFormSchema),
        defaultValues: {
            email: '',
            name: '',
            phone: '',
            address: '',
            comment: '',
            deliveryType: 'DELIVERY' as DeliveryType,
            paymentMethod: 'ONLINE',
            deliveryTime: undefined,
            deliveryPrice: 0,
        }
    });

    React.useEffect(() => {
        async function fetchUserInfo() {
            const data = await Api.auth.getMe();
            const name = data.name;

            form.setValue('name', name);
            form.setValue('email', data.email);
            form.setValue('phone', data.phone || '');
        }

        if (session) {
            fetchUserInfo();
        }
    }, [session, form])

    const [deliveryType, setDeliveryType] = React.useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
    const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('ONLINE');
    const [isDeliveryAllowed, setIsDeliveryAllowed] = useState(true);

    React.useEffect(() => {
        if (!isDeliveryAllowed && deliveryType === 'DELIVERY') {
            toast.error('Сюда мы не доставляем');
            setDeliveryPrice(0);
            form.setValue('deliveryPrice', 0);
        }
    }, [form, isDeliveryAllowed, deliveryType]);

    React.useEffect(() => {
        if (deliveryType === 'PICKUP') {
            setLastDeliveryPrice(deliveryPrice); // Сохраняем текущую цену перед сбросом
            setDeliveryPrice(0);
            form.setValue('deliveryPrice', 0);
        } else {
            setDeliveryPrice(lastDeliveryPrice); // Восстанавливаем последнюю цену
            form.setValue('deliveryPrice', lastDeliveryPrice);
        }
    }, [deliveryType, form, deliveryPrice, lastDeliveryPrice]);

    const handleDeliveryPriceChange = (price: number) => {
        setDeliveryPrice(price);
        if (deliveryType === 'DELIVERY') {
            setLastDeliveryPrice(price);
        }
        form.setValue('deliveryPrice', price);
    };

    const currentDeliveryPrice = deliveryType === 'DELIVERY' ? deliveryPrice : 0;

    const onDeliveryTypeChange = (type: DeliveryType) => {
        setDeliveryType(type);
        form.setValue('deliveryType', type);

        if (type === 'DELIVERY') {
            setPaymentMethod('ONLINE');
        }
    };

    const onPaymentMethodChange = (method: PaymentMethod) => {
        setPaymentMethod(method);
        form.setValue('paymentMethod', method);
    };

    const onClickCountButton = (id: number, quantity: number, type: 'plus' | 'minus') => {
        const newQuantity = type === 'plus' ? quantity + 1 : quantity - 1;
        updateItemQuantity(id, newQuantity);
    }

    const [bonusOption, setBonusOption] = React.useState<'earn' | 'spend'>('earn');
    const [userBonuses, setUserBonuses] = React.useState(0);

    React.useEffect(() => {
        async function loadUserBonuses() {
            if (session) {
                try {
                    const userData = await Api.auth.getMe();
                    setUserBonuses(userData.bonusBalance || 0);
                } catch (error) {
                    console.error('Failed to load user bonuses', error);
                }
            }
        }
        loadUserBonuses();
    }, [session]);

    React.useEffect(() => {
        if (bonusOption === 'earn') {
            setSpentBonuses(0);
        } else {
            setSpentBonuses(Math.min(userBonuses, totalAmount));
        }
    }, [bonusOption, userBonuses, totalAmount]);

    // Расчет итоговой суммы
    const calculateTotal = () => {
        const isAuthenticated = !!session;
        if (!isAuthenticated || bonusOption === 'earn') {
            return {
                totalPrice: totalAmount + currentDeliveryPrice,
                bonusDelta: isAuthenticated ? Math.round(totalAmount * GLOBAL_CONSTANTS.BONUS_MULTIPLIER) : 0,
            };
        } else {
            return {
                totalPrice: totalAmount + currentDeliveryPrice - spentBonuses,
                bonusDelta: -spentBonuses,
            };
        }
    };

    const { totalPrice, bonusDelta } = calculateTotal();

    const handleBonusOptionChange = (value: string) => {
        if (!session) {
            toast.error('Для работы с бонусами необходимо авторизоваться');
            return;
        }
        setBonusOption(value as 'earn' | 'spend');
    };

    const [deliveryTime, setDeliveryTime] = React.useState<Date | null>(null);
    React.useEffect(() => {
    }, [deliveryTime]);

    const onSubmit = async (data: CheckoutFormValues) => {
        try {
            if (!deliveryTime) {
                toast.error('Пожалуйста, выберите время доставки/самовывоза');
                return;
            }
            if (deliveryType === 'DELIVERY' && totalAmount < minTotalAmount) {
                toast.error(`Минимальная сумма заказа для доставки: ${minTotalAmount} ₽`);
                return;
            }
            if (deliveryType === 'DELIVERY' && !isDeliveryAllowed) {
                toast.error('Выберите доступный адрес доставки');
                return;
            }
            setSubmitting(true);

            const formData = {
                ...data,
                address: data.deliveryType === 'PICKUP' ? undefined : data.address,
                deliveryPrice: data.deliveryPrice,
                paymentMethod,
                bonusDelta,
                deliveryTime,
            };

            const url = await createOrderUser(formData);

            if (url) {
                if (paymentMethod == "ONLINE") {
                    toast.success('Заказ успешно оформлен! 📝 Переходим на оплату...', { icon: '✅' });
                    location.href = url;
                } else {
                    toast.success('Заказ успешно оформлен!', { icon: '✅' });
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    location.href = url;
                }
            }

        } catch (err) {
            setSubmitting(false);

            if (err instanceof Error) {
                if (err.message.includes('закончились') ||
                    err.message.includes('уменьшено до') ||
                    err.message.includes('недостаточно')) {

                    toast.error(err.message, {
                        duration: 2000,
                        icon: '⚠️'
                    });
                    setTimeout(() => window.location.reload(), 2000);
                } else {
                    toast.error(err.message || 'Не удалось создать заказ', {
                        icon: '❌'
                    });
                }
            } else {
                toast.error('Произошла неизвестная ошибка', { icon: '❌' });
            }
        }
    };

    return (
        <Container className="mt-6 md:mt-10 px-4 sm:px-6">
            <Title
                text="Оформление заказа"
                className="font-extrabold mb-6 md:mb-8 text-2xl sm:text-3xl md:text-[36px] text-center sm:text-left"
            />
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-10">
                        <div className="flex flex-col gap-4 md:gap-6 lg:gap-10 flex-1 mb-6 md:mb-10 lg:mb-20">
                            <CheckoutCart
                                onClickCountButton={onClickCountButton}
                                removeCartItem={removeCartItem}
                                items={items}
                                loading={loading}
                            />

                            <CheckoutPersonalForm className={cn({ 'opacity-40 pointer-events-none': loading })} />

                            <CheckoutAddressForm
                                className={cn({ 'opacity-40 pointer-events-none': loading })}
                                deliveryType={deliveryType}
                                onDeliveryTypeChange={onDeliveryTypeChange}
                                onDeliveryPriceChange={handleDeliveryPriceChange}
                                onDeliveryAvailabilityChange={(isAllowed) => setIsDeliveryAllowed(isAllowed)}
                            />
                        </div>

                        <div className="w-full lg:w-[450px] -mt-6 lg:mt-0">
                            <WhiteBlock className='p-4 sm:p-6 lg:sticky lg:top-4'>
                                <div className="flex flex-col gap-1">
                                    <span className="text-lg md:text-xl">Итого:</span>
                                    {
                                        loading ? <Skeleton className="h-8 md:h-11 w-32 md:w-48" /> :
                                            <span className="h-8 md:h-11 text-2xl md:text-[34px] font-extrabold">{`${totalPrice} ₽`}</span>
                                    }
                                </div>

                                <CheckoutItemDetails title={
                                    <>
                                        <div className="flex items-center">
                                            <Package size={16} className="mr-2 text-gray-400" />
                                            <span className="text-sm md:text-base">Стоимость товаров:</span>
                                        </div>
                                    </>
                                }
                                    value={
                                        loading ? <Skeleton className="h-5 md:h-6 w-12 md:w-16 rounded-[6px]" /> : `${totalAmount} ₽`
                                    } />

                                <CheckoutItemDetails title={
                                    <>
                                        <div className="flex items-center">
                                            <Truck size={16} className="mr-2 text-gray-400" />
                                            <span className="text-sm md:text-base">Доставка:</span>
                                        </div>
                                    </>
                                }
                                    value={
                                        loading ? <Skeleton className="h-5 md:h-6 w-12 md:w-16 rounded-[6px]" /> : `${form.watch('deliveryPrice')} ₽`
                                    } />

                                <BonusOptions
                                    session={session}
                                    bonusOption={bonusOption}
                                    onBonusOptionChange={handleBonusOptionChange}
                                    userBonuses={userBonuses}
                                    totalAmount={totalAmount}
                                    spentBonuses={spentBonuses}
                                    onSpentBonusesChange={setSpentBonuses}
                                />

                                <PaymentMethodOptions
                                    deliveryType={deliveryType}
                                    paymentMethod={paymentMethod}
                                    setPaymentMethod={onPaymentMethodChange}
                                />
                                <DeliveryTimePicker
                                    deliveryTime={deliveryTime}
                                    setDeliveryTime={(time: Date) => {
                                        setDeliveryTime(time);
                                        form.setValue('deliveryTime', time);
                                    }}
                                />
                                {isWorkingHours ? (
                                    <>
                                        {deliveryType === 'DELIVERY' && totalAmount < minTotalAmount && (
                                            <div className="p-3 bg-red-50 rounded-md text-sm text-red-800 mt-4 md:mt-6">
                                                {`Минимальная сумма заказа для доставки: ${minTotalAmount} ₽`}
                                            </div>
                                        )}
                                        <Button
                                            loading={loading || submitting}
                                            type="submit"
                                            disabled={
                                                (deliveryType === 'DELIVERY' &&
                                                    (!isDeliveryAllowed || totalAmount < minTotalAmount)) ||
                                                (deliveryType === 'PICKUP' && totalAmount <= 0)
                                            }
                                            className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl mt-4 md:mt-6 text-sm md:text-base font-bold">
                                            Оформить заказ
                                            <ArrowRight className="w-4 md:w-5 ml-2" />
                                        </Button>
                                    </>
                                ) : (
                                    <div className="p-3 bg-red-50 rounded-md text-sm text-red-800 mt-4 md:mt-6">
                                        {GLOBAL_CONSTANTS.MESSAGES.OUT_OF_HOURS}
                                    </div>
                                )}
                            </WhiteBlock>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </Container>
    );
}