'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Container, WhiteBlock } from "@/shared/components";

import AddressForm from "@/shared/components/shared/form/form-address";
import YandexSuggestLoader from "@/shared/components/shared/yandex-suggest-loader";
import { DeliveryMap } from '@/shared/components/shared/delivery-map';
import { useState } from 'react';

const YMapsWithNoSSR = dynamic(
  () => import('@pbe/react-yandex-maps').then(mod => mod.YMaps),
  { ssr: false, loading: () => <Skeleton className="w-full h-[400px]" /> }
);

export default function DeliveryPage() {
  const [selectedCoords, setSelectedCoords] = useState<number[] | null>(null);

  const handleAddressSelect = (coords: number[]) => {
    setSelectedCoords(coords);
  };

  return (
    <Container>
      <YandexSuggestLoader />
      <WhiteBlock className="mb-8 p-6" title="Доставка">
        <AddressForm onAddressSelect={handleAddressSelect} />

        <YMapsWithNoSSR query={{ apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY }}>
          <div className="mt-6">
            <DeliveryMap selectedCoords={selectedCoords} />
          </div>
        </YMapsWithNoSSR>
      </WhiteBlock>
    </Container>
  );
}
