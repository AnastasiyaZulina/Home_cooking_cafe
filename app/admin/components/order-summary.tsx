'use client';

import React from 'react';
import { WhiteBlock } from '@/shared/components';
import { useFormContext } from 'react-hook-form';

import { CHECKOUT_CONSTANTS } from '@/shared/constants';
import { BonusOptions } from './bonus-options';

type OrderSummaryProps = {
  totalAmount: number;
  userBonuses: number;
  spentBonuses: number;
  bonusOption: 'earn' | 'spend';
  setSpentBonuses: (value: number) => void;
  setBonusOption: (value: 'earn' | 'spend') => void;
};

export const OrderSummary = ({
  totalAmount,
  userBonuses,
  spentBonuses,
  bonusOption,
  setSpentBonuses,
  setBonusOption
}: OrderSummaryProps) => {
  const { watch } = useFormContext();
  const deliveryPrice = watch('deliveryPrice') || 0;
  const userId = watch('userId');

  const { totalPrice, bonusDelta } = bonusOption === 'earn'
    ? {
      totalPrice: totalAmount + deliveryPrice,
      bonusDelta: userId ? Math.round(totalAmount * CHECKOUT_CONSTANTS.BONUS_MULTIPLIER) : 0
    }
    : {
      totalPrice: totalAmount + deliveryPrice - spentBonuses,
      bonusDelta: -spentBonuses
    };

    return (
        <WhiteBlock title="Итоговая информация" className="p-6">
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span>Стоимость товаров:</span>
                    <span>{totalAmount} ₽</span>
                </div>

                <div className="flex justify-between">
                    <span>Стоимость доставки:</span>
                    <span>{deliveryPrice} ₽</span>
                </div>
                {userId && (
                    <BonusOptions
                        userBonuses={userBonuses}
                        spentBonuses={spentBonuses}
                        bonusOption={bonusOption}
                        setBonusOption={setBonusOption}
                        setSpentBonuses={setSpentBonuses}
                        totalAmount={totalAmount}
                    />
                )}
                <div className="flex justify-between font-bold border-t pt-3">
                    <span>Итого:</span>
                    <span>{totalPrice} ₽</span>
                </div>

                {userId && (
                    <div className="flex justify-between text-sm text-primary">
                        <span>Изменение бонусов:</span>
                        <span>{bonusDelta > 0 ? '+' : ''}{bonusDelta} ₽</span>
                    </div>
                )}
            </div>
        </WhiteBlock>
    );
};