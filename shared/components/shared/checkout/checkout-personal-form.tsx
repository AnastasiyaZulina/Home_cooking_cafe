'use client'
import React, { useState } from 'react';
import { WhiteBlock } from '../white-block';
import { FormInput } from '../form';
import { PhoneInput } from '../phone-input';


interface Props {
    className?: string;
}

export const CheckoutPersonalForm: React.FC<Props> = ({ className }) => {
    const [phone, setPhone] = useState('+7 ');
    return (
        <WhiteBlock
            title="2. Персональная информация"
            className={className}
            contentClassName="p-4 sm:p-6 md:p-8"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                <FormInput
                    name="firstname"
                    label="Имя"
                    className="text-sm sm:text-base"
                    placeholder="Имя"
                    required
                />
                <FormInput
                    name="email"
                    label="E-Mail"
                    className="text-sm sm:text-base"
                    placeholder="E-Mail"
                    required
                />
                <PhoneInput name="phone" label="Телефон" placeholder="+7(xxx)xxx-xx-xx" required />
            </div>
        </WhiteBlock>
    );
};