'use client';

import { Container, WhiteBlock } from "@/shared/components";
import YandexSuggestLoader from "@/shared/components/shared/yandex-suggest-loader";
import { useState } from 'react';
import AddressCheckout from '@/shared/components/shared/address-checkout';

export default function DeliveryPage() {
  const [selectedCoords, setSelectedCoords] = useState<number[] | null>(null);

  const handleAddressSelect = (coords: number[]) => {
    setSelectedCoords(coords);
  };

  return (
    <Container>
      <YandexSuggestLoader />
      <WhiteBlock className="mb-8 p-6" title="Доставка">
        <AddressCheckout 
          selectedCoords={selectedCoords}
          onAddressSelect={handleAddressSelect}
          showDeliveryInfo={true}
        />
      </WhiteBlock>
    </Container>
  );
}