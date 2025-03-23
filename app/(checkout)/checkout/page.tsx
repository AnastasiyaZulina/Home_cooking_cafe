'use client';

import { CheckoutAddressForm, CheckoutCart, CheckoutItemDetails, CheckoutPersonalForm, Container, Title, WhiteBlock } from "@/shared/components";
import { useCart } from '@/hooks/use-cart';
import { Button, Skeleton} from "@/shared/components/ui";
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
import { Suspense } from "react";
import { DeliveryType } from "@prisma/client";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            <CheckoutContent />
        </Suspense>
    );
}

function CheckoutContent() {
    const { totalAmount, updateItemQuantity, items, removeCartItem, loading } = useCart();
    const [submitting, setSubmitting] = React.useState(false);
    const { data: session } = useSession();
    const router = useRouter();

    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(CheckoutFormSchema),
        defaultValues: {
            email: '',
            firstname: '',
            lastname: '',
            address: '',
            comment: '',
            deliveryType: 'DELIVERY' as DeliveryType
        }
    });

    
    React.useEffect(() => {
        if (!loading && (!items || items.length === 0)) {
            router.push('/checkout-empty');
        }
    }, [items, loading, router]);

    React.useEffect(() => {
        async function fetchUserInfo(){
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
    const DELIVERY_PRICE = deliveryType === 'DELIVERY' ? 250 : 0;
    const totalPrice = totalAmount + DELIVERY_PRICE;

    const onDeliveryTypeChange = (type: DeliveryType) => {
        setDeliveryType(type);
        form.setValue('deliveryType', type);
    };

    const onClickCountButton = (id: number, quantity: number, type: 'plus' | 'minus') => {
        const newQuantity = type === 'plus' ? quantity + 1 : quantity - 1;
        updateItemQuantity(id, newQuantity);
    }

    const onSubmit = async (data: CheckoutFormValues) => {
        try {
            setSubmitting(true);
            const formData = {
                ...data,
                deliveryPrice: DELIVERY_PRICE // добавляем стоимость доставки
            };
            const url = await createOrder(formData);

            toast.success('Заказ успешно оформлен! 📝 Переход на оплату...', {
                icon: '✅',
            });

            if (url) {
                location.href = url;
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
        <Container className="mt-10">
            <Title text="Оформление заказа" className="font-extrabold mb-8 text-[36px]" />
            <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex gap-10">
                        <div className="flex flex-col gap-10 flex-1 mb-20">
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

                        <div className="w-[450px]">
                            <WhiteBlock className='p-6 sticky top-4'>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xl">Итого:</span>
                                    {
                                        loading ? <Skeleton className="h-11 w-48" /> : <span className="h-11 text-[34px] font-extrabold">{`${totalPrice} ₽`}</span>
                                    }
                                </div>

                                <CheckoutItemDetails title={
                                    <>
                                        <div className="flex items-center">
                                            <Package size={18} className="mr-2 text-gray-400" />
                                            Стоимость товаров:
                                        </div>
                                    </>
                                }
                                    value={
                                        loading ? <Skeleton className="h-6 w-16 rounded-[6px]" /> : `${totalAmount} ₽`
                                    } />

                                <CheckoutItemDetails title={
                                    <>
                                        <div className="flex items-center">
                                            <Truck size={18} className="mr-2 text-gray-400" />
                                            Доставка:
                                        </div>
                                    </>
                                }
                                    value={
                                        loading ? <Skeleton className="h-6 w-16 rounded-[6px]" /> : `${DELIVERY_PRICE} ₽`
                                    } />

                                <Button
                                    loading={loading || submitting}
                                    type="submit"
                                    className="w-full h-14 rounded-2xl mt-6 text-base font-bold">
                                    Перейти к оплате
                                    <ArrowRight className="w-5 ml-2" />
                                </Button>
                            </WhiteBlock>
                        </div>
                    </div>
                </form>
            </FormProvider>
        </Container>
    );
}
