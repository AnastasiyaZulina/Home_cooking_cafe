import React from 'react';
import { WhiteBlock } from '../white-block';
import { FormInput } from '../form';

interface Props {
    className?: string;
}

export const CheckoutPersonalForm: React.FC<Props> = ({ className }) => {
    return (
        <WhiteBlock
            title="2. Персональная информация"
            className={className}
            contentClassName="p-4 sm:p-6 md:p-8"
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                <FormInput 
                    name="firstname" 
                    className="text-sm sm:text-base" 
                    placeholder="Имя" 
                />
                <FormInput 
                    name="email" 
                    className="text-sm sm:text-base" 
                    placeholder="E-Mail" 
                />
                <FormInput 
                    name="phone" 
                    className="text-sm sm:text-base" 
                    placeholder="Телефон" 
                />
            </div>
        </WhiteBlock>
    );
};