'use client';

import { Container, WhiteBlock } from "@/shared/components";
import DeliveryMap from "@/shared/components/shared/delivery-map";
import AddressForm from "@/shared/components/shared/form/form-address";
import YandexSuggestLoader from "@/shared/components/shared/yandex-suggest-loader";

export default function DeliveryPage() {
    return (
        <Container>
            <YandexSuggestLoader />
            <WhiteBlock className="mb-8 p-6" title="Доставка">
                <AddressForm />
                <DeliveryMap />
            </WhiteBlock>
        </Container>
    );
}
