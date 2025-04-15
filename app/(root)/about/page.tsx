'use client';

import { Container, WhiteBlock } from "@/shared/components";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/shared/components/ui/carousel";
import { GLOBAL_CONSTANTS } from "@/shared/constants";
import Image from "next/image";

export default function AboutPage() {
    return (
        <Container>
            <WhiteBlock className="mb-8 p-6" title="О нас">
                {/* Описание */}
                <div className="text-base leading-relaxed text-gray-700 space-y-4 mb-8">
                    <p>
                        Добро пожаловать в столовую <strong>«Скатерть-самобранка»</strong> — место, где всегда вкусно, сытно и по-домашнему уютно!
                        Мы готовим еду, которую любят все: от классических щей и борща до аппетитных котлет, гарниров и свежей выпечки.
                    </p>
                    <p>
                        Мы верим, что вкусная еда не должна быть дорогой — именно поэтому наши блюда отличаются <strong>доступными ценами</strong>, при этом сохраняя высокое качество и натуральный вкус.
                    </p>
                    <p>
                        У нас можно не только поесть на месте, но и заказать доставку прямо к вам домой или в офис — быстро, удобно и по-честному вкусно!
                    </p>
                    <p>
                        Мы находимся по адресу: <strong>{GLOBAL_CONSTANTS.CONTACTS.ADRESS}</strong>. Работаем каждый день, чтобы вы могли вкусно поесть в любое время.
                    </p>
                </div>

                {/* Блок с картой и каруселью */}
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Карта */}
                    <div className="w-full md:w-[500px]">
                        <iframe
                            src="https://yandex.ru/map-widget/v1/?um=constructor%3Ae7f7c7cda7b20e5cb296b89e1afd6c0fa16cb975ab115c960a3f506ca51a59b2&amp;source=constructor"
                            width="100%"
                            height="550"
                            frameBorder="0"
                            style={{ borderRadius: '0.5rem' }}
                            loading="lazy"
                        ></iframe>
                    </div>

                    {/* Карусель */}
                    <div className="w-full md:flex-1 flex justify-center">
                        <Carousel className="w-[360px] h-[550px]">
                            <CarouselContent className="h-full">
                                {["cafe1.jpg", "cafe2.jpg", "cafe3.jpg"].map((img, index) => (
                                    <CarouselItem key={index} className="h-full">
                                        <Card className="h-full overflow-hidden">
                                            <CardContent className="relative h-[550px] p-0">
                                                <Image
                                                    src={`/images/content/${img}`}
                                                    alt={`Интерьер ${index + 1}`}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 360px"
                                                    className="object-cover"
                                                />
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                </div>
            </WhiteBlock>
        </Container>
    );
}