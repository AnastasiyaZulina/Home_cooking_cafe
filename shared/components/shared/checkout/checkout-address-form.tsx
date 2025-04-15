'use client';

import React, { useState } from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { WhiteBlock } from '../white-block';
import { FormInput, FormTextarea } from '../form';
import { Controller, useFormContext } from 'react-hook-form';
import AddressCheckout from '../address-checkout';

interface Props {
    className?: string;
    deliveryType: 'DELIVERY' | 'PICKUP';
    onDeliveryTypeChange: (type: 'DELIVERY' | 'PICKUP') => void;
    onDeliveryPriceChange?: (price: number) => void;
    onDeliveryAvailabilityChange?: (isAllowed: boolean) => void;
}

export const CheckoutAddressForm: React.FC<Props> = ({
    className,
    deliveryType,
    onDeliveryTypeChange,
    onDeliveryPriceChange,
    onDeliveryAvailabilityChange
}) => {
    const { control, setValue, watch } = useFormContext();
    const [selectedCoords, setSelectedCoords] = useState<number[] | null>(null);
    const [deliveryPrice, setDeliveryPrice] = useState(0);

    const apartment = watch('apartment') ?? '';

    const handleAddressSelect = (coords: number[], address: string) => {
        setSelectedCoords(coords);
        const fullAddress = apartment ? `${address}, кв. ${apartment}` : address;
        setValue('address', fullAddress, { shouldValidate: true });
    };

    const handleApartmentChange = (value: string) => {
        const currentAddress = watch('address')?.split(', кв. ')[0] || '';
        const newAddress = value ? `${currentAddress}, кв. ${value}` : currentAddress;
        setValue('apartment', value);
        setValue('address', newAddress, { shouldValidate: true });
    };

    const handleDeliveryPriceChange = (price: number) => {
        setDeliveryPrice(price);
        setValue('deliveryPrice', price);
        onDeliveryPriceChange?.(price);
    };

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

                {deliveryType === 'DELIVERY' && (
                    <>
                        <Controller
                            control={control}
                            name="apartment"
                            defaultValue=""
                            render={({ field }) => (
                                <FormInput
                                    {...field}
                                    type="number"
                                    min="1"
                                    label="Номер квартиры"
                                    placeholder="Введите номер квартиры"
                                    className="text-sm font-medium max-w-50"
                                    value={field.value ?? ''}
                                    onChange={(e) => handleApartmentChange(e.target.value)}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="address"
                            render={({ fieldState }) => (
                                <div className="space-y-2">
                                    <AddressCheckout
                                        selectedCoords={selectedCoords}
                                        onAddressSelect={handleAddressSelect}
                                        showDeliveryInfo={false}
                                        onDeliveryPriceChange={handleDeliveryPriceChange}
                                        onDeliveryAvailabilityChange={onDeliveryAvailabilityChange}
                                    />
                                    {fieldState.error && (
                                        <p className="text-red-500 text-sm pl-2">
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </div>
                            )}
                        />
                    </>
                )}

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
