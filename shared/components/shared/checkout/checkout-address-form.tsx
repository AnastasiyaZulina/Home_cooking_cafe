'use client';

import React from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { WhiteBlock } from '../white-block';
import { FormInput, FormTextarea } from '../form';
import { AdressInput } from '../adress-input';
import { Controller, useFormContext } from 'react-hook-form';

interface Props {
    className?: string;
    deliveryType: 'DELIVERY' | 'PICKUP';
    onDeliveryTypeChange: (type: 'DELIVERY' | 'PICKUP') => void;
}

export const CheckoutAddressForm: React.FC<Props> = ({
    className,
    deliveryType,
    onDeliveryTypeChange
}) => {
    const { control, watch, setValue } = useFormContext();
    const address = watch('address'); // Следим за значением адреса
    return (
        <WhiteBlock
            title="3. Адрес доставки"
            className={className}
            contentClassName="p-8"
        >
            <div className="flex flex-col gap-5">

                <div className="mb-5">
                    <RadioGroup.Root
                        value={deliveryType}
                        onValueChange={onDeliveryTypeChange}
                        className="flex items-center gap-4"
                    >
                        <div className="flex items-center gap-2">
                            <RadioGroup.Item
                                value="DELIVERY"
                                id="DELIVERY"
                                className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-400"
                            >
                                <RadioGroup.Indicator className="w-4 h-4 rounded-full bg-primary" />
                            </RadioGroup.Item>
                            <label htmlFor="DELIVERY">Доставка</label>
                        </div>

                        <div className="flex items-center gap-2">
                            <RadioGroup.Item
                                value="PICKUP"
                                id="PICKUP"
                                className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-400"
                            >
                                <RadioGroup.Indicator className="w-4 h-4 rounded-full bg-primary" />
                            </RadioGroup.Item>
                            <label htmlFor="PICKUP">Самовывоз</label>
                        </div>
                    </RadioGroup.Root>
                </div>

                <div className={deliveryType === 'PICKUP' ? 'hidden' : ''}>
                    <Controller
                        control={control}
                        name="address"
                        render={({ field, fieldState }) => (
                            <>
                                <AdressInput
                                    onChange={field.onChange}
                                    className="text-base"
                                    placeholder="Введите адрес"
                                />
                                {fieldState.error && (
                                    <p className="text-red-500 text-sm">{fieldState.error.message}</p>
                                )}
                            </>
                        )}
                    />
                </div>

                <FormTextarea
                    name="comment"
                    className="text-base"
                    placeholder="Комментарий к заказу"
                    rows={5}
                />
            </div>
        </WhiteBlock>
    );
};
