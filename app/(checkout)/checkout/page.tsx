'use client';

import { CheckoutAddressForm, CheckoutCart, CheckoutItemDetails, CheckoutPersonalForm, Container, Title, WhiteBlock } from "@/shared/components";
import { useCart } from '@/hooks/use-cart';
import { Button, Skeleton } from "@/shared/components/ui";
import { ArrowRight, Package, Truck } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutFormSchema, CheckoutFormValues } from "@/shared/constants";
import { cn } from "@/shared/lib/utils";
import { createOrder } from "@/app/actions";
import toast from "react-hot-toast";
import React from "react";
import { useSession } from "next-auth/react";
import { Api } from "@/shared/services/api-clients";
import { DeliveryType, PaymentMethod } from "@prisma/client";
import { useRouter } from "next/navigation";
import * as RadioGroup from '@radix-ui/react-radio-group';

export default function CheckoutPage() {
    const { items, loading } = useCart();
    const router = useRouter();
    const [isInitialLoad, setIsInitialLoad] = React.useState(true);

    React.useEffect(() => {
        if (!loading && (!items || items.length === 0)) {
            router.push('/checkout-empty');
        }

        if (!loading && items) {
            setIsInitialLoad(false);
        }
    }, [items, loading, router]);

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

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(CheckoutFormSchema),
        defaultValues: {
            email: '',
            firstname: '',
            lastname: '',
            address: '',
            comment: '',
            deliveryType: 'DELIVERY' as DeliveryType,
            paymentMethod: 'ONLINE'
        }
    });

    React.useEffect(() => {
        async function fetchUserInfo() {
            const data = await Api.auth.getMe();
            const [firstName, lastName] = data.fullName.split(' ');

            form.setValue('firstname', firstName);
            form.setValue('lastname', lastName);
            form.setValue('email', data.email);
        }

        if (session) {
            fetchUserInfo();
        }
    }, [session, form])

    const [deliveryType, setDeliveryType] = React.useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
    const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('ONLINE'); // Новое состояние для способа оплаты

    const BONUS_MULTIPLIER = 0.05;
    const DELIVERY_COST = 250;
    const DELIVERY_PRICE = deliveryType === 'DELIVERY' ? 250 : 0;

    const onDeliveryTypeChange = (type: DeliveryType) => {
        setDeliveryType(type);
        form.setValue('deliveryType', type);
        // Сбрасываем способ оплаты на ONLINE при выборе доставки
        if (type === 'DELIVERY') {
            setPaymentMethod('ONLINE');
        }
    };

    const onClickCountButton = (id: number, quantity: number, type: 'plus' | 'minus') => {
        const newQuantity = type === 'plus' ? quantity + 1 : quantity - 1;
        updateItemQuantity(id, newQuantity);
    }

    const [bonusOption, setBonusOption] = React.useState<'earn' | 'spend'>('earn');
    const [userBonuses, setUserBonuses] = React.useState(0); // Начинаем с 0

    // Загружаем бонусы пользователя при авторизации
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

    // Расчет итоговой суммы
    const calculateTotal = () => {
        const deliveryPrice = deliveryType === 'DELIVERY' ? DELIVERY_COST : 0;
        const isAuthenticated = !!session;

        if (!isAuthenticated || bonusOption === 'earn') {
            // Для неавторизованных или при начислении бонусов
            const calculatedBonuses = isAuthenticated ? Math.round(totalAmount * BONUS_MULTIPLIER) : 0;
            return {
                totalPrice: totalAmount + deliveryPrice,
                bonusDelta: calculatedBonuses,
            };
        } else {
            // Списание бонусов только для авторизованных
            const maxAvailableToSpend = Math.min(userBonuses, totalAmount);
            return {
                totalPrice: totalAmount + deliveryPrice - maxAvailableToSpend,
                bonusDelta: -maxAvailableToSpend,
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

    const onSubmit = async (data: CheckoutFormValues) => {
        try {
            setSubmitting(true);
            console.log('Form data:', data);
            const formData = {
                ...data,
                address: data.deliveryType === 'PICKUP' ? undefined : data.address,
                deliveryPrice: deliveryType === 'DELIVERY' ? DELIVERY_COST : 0,
                paymentMethod,
                bonusDelta,
            };

            const url = await createOrder(formData);

            if (paymentMethod == "ONLINE") {
                toast.success('Заказ успешно оформлен! 📝 Переходим на оплату...', {
                    icon: '✅',
                });
            }
            else{
                toast.success('Заказ успешно оформлен!', {
                    icon: '✅',
                });
            }
            
            if (url) {
                if (paymentMethod == "ONLINE") {location.href = url; } else {await new Promise(resolve => setTimeout(resolve, 2000)); location.href = url;}
            }
        }
        catch (err) {
            console.log(err);
            setSubmitting(false);
            toast.error('Не удалось создать заказ', {
                icon: '❌',
            });
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
                                        loading ? <Skeleton className="h-5 md:h-6 w-12 md:w-16 rounded-[6px]" /> : `${DELIVERY_PRICE} ₽`
                                    } />

                                <div className="mb-5">
                                    {session ? (
                                        <RadioGroup.Root
                                            value={bonusOption}
                                            onValueChange={handleBonusOptionChange}
                                            className="flex items-center gap-4"
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
                                                    Начислить бонусы <br /> (+{Math.round(totalAmount * BONUS_MULTIPLIER)} ₽)
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
                                                    Списать бонусы <br /> {userBonuses > 0 && `(до ${Math.min(userBonuses, totalAmount)} ₽)`}
                                                </label>
                                            </div>
                                        </RadioGroup.Root>
                                    ) : (
                                        <div className="p-3 bg-yellow-50 rounded-md text-sm text-yellow-800">
                                            Авторизуйтесь, чтобы получать и тратить бонусные баллы
                                        </div>
                                    )}
                                </div>
                                {bonusOption === 'spend' && (
                                    <div className="text-sm text-gray-600 mb-4">
                                        Будет списано: {Math.min(userBonuses, totalAmount)} ₽ из доступных {userBonuses} ₽
                                    </div>
                                )}

                                {deliveryType === 'PICKUP' && (
                                    <div className="mb-5">
                                        <h4 className="text-sm font-medium mb-3">Способ оплаты:</h4>
                                        <RadioGroup.Root
                                            value={paymentMethod}
                                            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                                            className="flex flex-col gap-3"
                                        >
                                            <div className="flex items-center gap-2">
                                                <RadioGroup.Item
                                                    value="ONLINE"
                                                    id="onlinePayment"
                                                    className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-400"
                                                >
                                                    <RadioGroup.Indicator className="w-4 h-4 rounded-full bg-primary" />
                                                </RadioGroup.Item>
                                                <label htmlFor="onlinePayment" className="flex-1">
                                                    Оплата на сайте
                                                </label>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <RadioGroup.Item
                                                    value="OFFLINE"
                                                    id="offlinePayment"
                                                    className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-400"
                                                >
                                                    <RadioGroup.Indicator className="w-4 h-4 rounded-full bg-primary" />
                                                </RadioGroup.Item>
                                                <label htmlFor="offlinePayment" className="flex-1">
                                                    Оплата при получении
                                                </label>
                                            </div>
                                        </RadioGroup.Root>
                                    </div>
                                )}
                                <Button
                                    loading={loading || submitting}
                                    type="submit"
                                    className="w-full h-12 md:h-14 rounded-xl md:rounded-2xl mt-4 md:mt-6 text-sm md:text-base font-bold">
                                    Оформить заказ
                                    <ArrowRight className="w-4 md:w-5 ml-2" />
                                </Button>
                            </WhiteBlock>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </Container>
    );
}