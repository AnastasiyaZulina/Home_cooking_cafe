// components/PaymentMethodOptions.tsx
import { PaymentMethod } from '@prisma/client';
import * as RadioGroup from '@radix-ui/react-radio-group';

interface PaymentMethodOptionsProps {
  deliveryType: 'DELIVERY' | 'PICKUP';
  paymentMethod: PaymentMethod;
  setPaymentMethod: (value: PaymentMethod) => void;
}

export const PaymentMethodOptions = ({
  deliveryType,
  paymentMethod,
  setPaymentMethod,
}: PaymentMethodOptionsProps) => {
  if (deliveryType !== 'PICKUP') return null;

  return (
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
  );
};