'use client';

import { Container, WhiteBlock } from "@/shared/components";
import {YandexSuggestLoader} from "@/shared/components";
import { useState } from 'react';
import {AddressCheckout} from '@/shared/components';
import { GLOBAL_CONSTANTS } from "@/shared/constants";

export default function DeliveryPage() {
  const [selectedCoords, setSelectedCoords] = useState<number[] | null>(null);

  const handleAddressSelect = (coords: number[]) => {
    setSelectedCoords(coords);
  };

  return (
    <Container>
      <YandexSuggestLoader />
      <WhiteBlock className="mb-8 p-6" title="Доставка">

        {/* Текстовое описание */}
        <div className="text-base leading-relaxed text-gray-700 space-y-4 mb-6">
          <p>
            Наша столовая <strong>«Скатерть-самобранка»</strong> находится по адресу: <strong>{GLOBAL_CONSTANTS.CONTACTS.ADRESS}</strong>.
          </p>
          <p>
            Вы можете сделать <strong>заказ на самовывоз</strong> или <strong>оформить доставку</strong>.
          </p>
          <p>
            <strong>Минимальная сумма для доставки — {GLOBAL_CONSTANTS.MIN_DELIVERY_TOTAL_AMOUNT} руб.</strong>
          </p>
          <p>
            Чтобы узнать, доступна ли доставка по вашему адресу, воспользуйтесь формой ниже.
          </p>
        </div>

        {/* Форма с картой и проверкой доставки */}
        <AddressCheckout 
          selectedCoords={selectedCoords}
          onAddressSelect={handleAddressSelect}
          showDeliveryInfo={true}
        />
      </WhiteBlock>
    </Container>
  );
}
