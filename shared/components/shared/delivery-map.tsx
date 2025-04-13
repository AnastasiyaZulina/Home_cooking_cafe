'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useEffect, useState, useRef } from 'react';
import { GeolocationControl, GeoObject, Placemark, useYMaps, ZoomControl } from '@pbe/react-yandex-maps';
import { IGeocodeResult } from 'yandex-maps';

type CoordinatesType = number[];

interface IMapClickEvent {
    get: (key: string) => CoordinatesType;
}

interface IAddress {
    location: string;
    route: string;
}

interface GeoJsonFeature {
    geometry: {
        coordinates: number[][][];
        type: string;
    };
    properties: {
        description: string;
        fill: string;
        "fill-opacity": number;
        stroke: string;
        "stroke-width": string;
        "stroke-opacity": number;
    };
}

const MapWithNoSSR = dynamic(
    () => import('@pbe/react-yandex-maps').then(mod => mod.Map),
    { ssr: false }
);

const CENTER = [55.03851354815321, 82.92514445214833];
const ZOOM = 11;

export function DeliveryMap() {
    const [address, setAddress] = useState<IAddress | null>(null);
    const ymaps = useYMaps(["geocode", "geoQuery"]);
    const [coordinates, setCoordinates] = useState<CoordinatesType | null>(null);
    const [geoJsonData, setGeoJsonData] = useState<GeoJsonFeature[]>([]);
    const [deliveryInfo, setDeliveryInfo] = useState<{
        description: string;
        isAllowed: boolean;
    } | null>(null);

    const geoObjectsRef = useRef<any[]>([]);

    useEffect(() => {
        fetch("/geo/delivery-zones.geojson")
            .then(res => res.json())
            .then(data => {
                if (data?.features) {
                    const polygons = data.features.filter(
                        (f: GeoJsonFeature) => f.geometry.type === 'Polygon'
                    );
                    setGeoJsonData(polygons);
                }
            })
            .catch(error => console.error('Error loading GeoJSON:', error));
    }, []);

    const checkLocationInPolygons = async (coords: number[]) => {
        if (!ymaps) return;
        
        const geoQuery = (ymaps as any).geoQuery(geoObjectsRef.current);
        const objects = geoQuery.searchContaining(coords);
        
        if (objects.getLength() > 0) {
            const firstObject = objects.get(0);
            const description = firstObject.properties.get('balloonContent');
            // Ищем все числа в строке и берем последнее
            const numbers = description.match(/\d+/g);
            const price = numbers ? numbers[numbers.length - 1] : '0';
            
            return {
                description: price,
                isAllowed: true
            };
        }
        
        return {
            description: '0',
            isAllowed: false
        };
    };

    const handleClickMap = async (e: IMapClickEvent) => {
        const coords = e.get('coords');
        if (!coords || !ymaps) return;

        setCoordinates(coords);

        // Проверяем зону доставки
        const deliveryStatus = await checkLocationInPolygons(coords);
        setDeliveryInfo(deliveryStatus || null);

        // Получаем адрес
        const geocodeResult = await ymaps.geocode(coords);
        const addressInfo = handleGeoResult(geocodeResult);
        setAddress(addressInfo || null);
    };

    function handleGeoResult(result: IGeocodeResult) {
        const firstGeoObject = result.geoObjects.get(0);

        if (firstGeoObject) {
            const properties = firstGeoObject.properties;
            const location = String(properties.get("description", {}));
            const route = String(properties.get("name", {}));

            return { location, route };
        }
    }

    return (
        <div>
            <MapWithNoSSR
                defaultState={{
                    center: CENTER,
                    zoom: ZOOM,
                    controls: [],
                }}
                width="100%"
                height={400}
                onClick={handleClickMap}
                modules={['geoObject.addon.balloon', 'geoQuery']}
            >
                {geoJsonData.map((feature, index) => {
                    const coordinates = feature.geometry.coordinates.map(ring =>
                        ring.map(([lng, lat]) => [lat, lng])
                    );

                    return (
                        <GeoObject
                            key={index}
                            geometry={{
                                type: 'Polygon',
                                coordinates
                            }}
                            options={{
                                fillColor: feature.properties.fill,
                                fillOpacity: feature.properties["fill-opacity"],
                                strokeColor: feature.properties.stroke,
                                strokeWidth: Number(feature.properties["stroke-width"]),
                                strokeOpacity: feature.properties["stroke-opacity"],
                                interactivityModel: 'default#transparent',
                                cursor: 'pointer',
                            }}
                            properties={{
                                balloonContent: feature.properties.description
                            }}
                            instanceRef={(ref: any) => {
                                if (ref) geoObjectsRef.current[index] = ref;
                            }}
                        />
                    );
                })}

                <GeolocationControl options={{ float: "left" }} />
                <ZoomControl options={{ position: { right: 10, top: 10 } }} />
            </MapWithNoSSR>

            <div className="mt-4 space-y-4 p-4 border rounded-lg bg-slate-50">
                {address && (
                    <>
                        <p className="flex gap-2">
                            <span className="font-semibold">Локация:</span>
                            <span>{address.location}</span>
                        </p>
                        <p className="flex gap-2">
                            <span className="font-semibold">Адрес:</span>
                            <span>{address.route}</span>
                        </p>
                    </>
                )}

                {coordinates && (
                    <p className="flex gap-2">
                        <span className="font-semibold">Координаты:</span>
                        <span>{coordinates.join(', ')}</span>
                    </p>
                )}

                {deliveryInfo && (
                    <>
                        <p className="flex gap-2">
                            <span className="font-semibold">Стоимость доставки:</span>
                            <span>{deliveryInfo.description} руб.</span>
                        </p>
                        <p className="flex gap-2">
                            <span className="font-semibold">Доступна:</span>
                            <span className={deliveryInfo.isAllowed ? 'text-green-600' : 'text-red-600'}>
                                {deliveryInfo.isAllowed ? 'Да' : 'Нет'}
                            </span>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}