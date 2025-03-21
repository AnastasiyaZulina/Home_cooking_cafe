'use client';

import React from 'react';
import { WhiteBlock } from '../white-block';
import { Input, Textarea } from '../../ui';
import { FormInput, FormTextarea } from '../form';


interface Props {
    className?: string;
}

export const CheckoutAddressForm: React.FC<Props> = ({ className }) => {
    return (
        <WhiteBlock
            title="3. Адрес доставки"
            className={className}
            contentClassName="p-8">
            <div className="flex flex-col gap-5">
                <FormInput name="address" className="text-base" placeholder="Введите адрес" />
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