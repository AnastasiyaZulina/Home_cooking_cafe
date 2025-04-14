'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from "@/shared/components/ui/skeleton";
import AddressForm from "@/shared/components/shared/form/form-address";
import { DeliveryMap } from '@/shared/components/shared/delivery-map';
import { YMaps } from '@pbe/react-yandex-maps';

const YMapsWithNoSSR = dynamic(
  () => import('@pbe/react-yandex-maps').then(mod => mod.YMaps),
  { 
    ssr: false, 
    loading: () => <Skeleton className="w-full h-[400px]" /> 
  }
);

interface AddressCheckoutProps {
    selectedCoords: number[] | null;
    onAddressSelect: (coords: number[]) => void;
    showDeliveryInfo?: boolean; // Добавляем новый пропс
  }

  export default function AddressCheckout({ 
    selectedCoords,
    onAddressSelect,
    showDeliveryInfo = true
  }: AddressCheckoutProps) {
  return (
    <>
      <AddressForm onAddressSelect={onAddressSelect} />
      <YMapsWithNoSSR 
        query={{ 
          apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY,
          load: "package.full" 
        }}
      >
        <div className="mt-6">
          <DeliveryMap selectedCoords={selectedCoords} showDeliveryInfo={showDeliveryInfo}/>
        </div>
      </YMapsWithNoSSR>
    </>
  );
}