'use client';

import React from 'react';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { Slider } from '@/shared/components/ui/slider';
import { useFormContext } from 'react-hook-form';
import { CHECKOUT_CONSTANTS } from '@/shared/constants';

type BonusOptionsProps = {
    totalAmount: number;
    userBonuses: number;
    spentBonuses: number;
    bonusOption: 'earn' | 'spend';
    setBonusOption: (value: 'earn' | 'spend') => void;
    setSpentBonuses: (value: number) => void;
  };
  
  export const BonusOptions = ({
    totalAmount,
    userBonuses,
    spentBonuses,
    bonusOption,
    setSpentBonuses,
    setBonusOption
  }: BonusOptionsProps) => {
    const maxAvailableToSpend = Math.min(userBonuses, totalAmount);

    return (
        <div className="mb-4">
            <RadioGroup.Root
                value={bonusOption}
                onValueChange={setBonusOption}
                className="flex items-center gap-4 mb-4"
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
                        Начислить бонусы (+{Math.round(totalAmount * CHECKOUT_CONSTANTS.BONUS_MULTIPLIER)} ₽)
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
                        Списать бонусы {userBonuses > 0 && `(до ${maxAvailableToSpend} ₽)`}
                    </label>
                </div>
            </RadioGroup.Root>

            {bonusOption === 'spend' && userBonuses > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Списать: {spentBonuses} ₽</span>
                        <span>Доступно: {userBonuses} ₽</span>
                    </div>

                    <Slider
                        value={[spentBonuses]}
                        max={maxAvailableToSpend}
                        step={1}
                        onValueChange={(value) => setSpentBonuses(value[0])}
                    />
                </div>
            )}
        </div>
    );
};