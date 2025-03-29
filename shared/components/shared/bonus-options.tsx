import * as RadioGroup from '@radix-ui/react-radio-group';
import React from 'react';

interface BonusOptionsProps {
  session: any; // Замените на правильный тип сессии
  bonusOption: 'earn' | 'spend';
  onBonusOptionChange: (value: 'earn' | 'spend') => void;
  userBonuses: number;
  totalAmount: number;
}

export const BonusOptions = ({
  session,
  bonusOption,
  onBonusOptionChange,
  userBonuses,
  totalAmount,
}: BonusOptionsProps) => {
  const BONUS_MULTIPLIER = 0.05;

  return (
    <>
      <div className="mb-5">
        {session ? (
          <RadioGroup.Root
            value={bonusOption}
            onValueChange={onBonusOptionChange}
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
                className={`flex items-center justify-center w-6 h-6 rounded-full border ${
                  userBonuses <= 0 ? 'border-gray-300 opacity-50' : 'border-gray-400'
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
    </>
  );
};