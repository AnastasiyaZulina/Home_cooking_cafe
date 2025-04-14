'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, useRef } from 'react';
import { GeolocationControl, GeoObject, Placemark, ZoomControl, useYMaps } from '@pbe/react-yandex-maps';

type CoordinatesType = number[];

interface PolygonGeometry {
    type: 'Polygon';
    coordinates: [number, number][][];
}

interface PointGeometry {
    type: 'Point';
    coordinates: [number, number];
}

type Geometry = PolygonGeometry | PointGeometry;

interface GeoJsonFeature {
    geometry: Geometry;
    properties: {
        description: string;
        iconCaption?: string;
        fill?: string;
        "fill-opacity"?: number;
        stroke?: string;
        "stroke-width"?: string;
        "stroke-opacity"?: number;
        [key: string]: any;
    };
}

const MapWithNoSSR = dynamic(
    () => import('@pbe/react-yandex-maps').then(mod => mod.Map),
    { ssr: false }
);

const CENTER = [55.03851354815321, 82.92514445214833];
const ZOOM = 11;

interface DeliveryMapProps {
    onBoundsChange?: (bounds: number[][]) => void;
    selectedCoords?: number[] | null;
    showDeliveryInfo?: boolean;
  }
  
  export function DeliveryMap({ 
    onBoundsChange, 
    selectedCoords, 
    showDeliveryInfo = true
  }: DeliveryMapProps) {
    const ymaps = useYMaps(["geocode", "geoQuery"]);
    const mapRef = useRef<any>(null);
    const geoObjectsRef = useRef<any[]>([]);

    const [geoJsonData, setGeoJsonData] = useState<GeoJsonFeature[]>([]);
    const [deliveryInfo, setDeliveryInfo] = useState<{ price: number; isAllowed: boolean }>({ price: 0, isAllowed: false });

    // Загрузка GeoJSON
    useEffect(() => {
        fetch("/geo/delivery-zones.geojson")
            .then(res => res.json())
            .then(data => {
                const features: GeoJsonFeature[] = data.features;
                setGeoJsonData(features);

                const polygons = features.filter(f => f.geometry.type === 'Polygon') as GeoJsonFeature[];
                if (onBoundsChange) {
                    const allCoords = polygons.flatMap((f) => (f.geometry as PolygonGeometry).coordinates.flat());
                    onBoundsChange(allCoords);
                }
            })
            .catch(error => console.error('Error loading GeoJSON:', error));
    }, [onBoundsChange]);

    // Фокусировка на выбранной точке
    useEffect(() => {
        if (selectedCoords && mapRef.current) {
            mapRef.current.setCenter(selectedCoords, 15, { duration: 300 });
            checkDeliveryZone(selectedCoords);
        }
    }, [selectedCoords, ymaps]);

    // Проверка доставки
    const checkDeliveryZone = async (coords: number[]) => {
        if (!ymaps || geoObjectsRef.current.length === 0) return;

        const geoQuery = (ymaps as any).geoQuery(geoObjectsRef.current);
        const objects = geoQuery.searchContaining(coords);

        if (objects.getLength() === 0) {
            setDeliveryInfo({ price: 0, isAllowed: false });
            return;
        }

        const prices: number[] = [];

        objects.each((obj: any) => {
            const desc = obj.properties.get('balloonContent') || '';
            const match = desc.match(/\d+/g);
            if (match) {
                const price = parseInt(match[match.length - 1], 10);
                prices.push(price);
            }
        });

        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

        setDeliveryInfo({
            price: maxPrice,
            isAllowed: maxPrice > 0
        });
    };

    return (
        <div>
            <MapWithNoSSR
                defaultState={{ center: CENTER, zoom: ZOOM, controls: [] }}
                width="100%"
                height={400}
                instanceRef={mapRef}
                modules={['geoObject.addon.balloon', 'geoQuery']}
            >
                {/* Полигональные зоны доставки */}
                {geoJsonData
                    .filter((feature) => feature.geometry.type === 'Polygon')
                    .map((feature, index) => {
                        const polygon = feature.geometry as PolygonGeometry;
                        const coordinates = polygon.coordinates.map((ring: [number, number][]) =>
                            ring.map(([lng, lat]: [number, number]) => [lat, lng])
                        );

                        return (
                            <GeoObject
                                key={`polygon-${index}`}
                                geometry={{ type: 'Polygon', coordinates }}
                                options={{
                                    fillColor: feature.properties.fill,
                                    fillOpacity: feature.properties["fill-opacity"],
                                    strokeColor: feature.properties.stroke,
                                    strokeWidth: Number(feature.properties["stroke-width"]),
                                    strokeOpacity: feature.properties["stroke-opacity"],
                                    interactivityModel: 'default#transparent',
                                    cursor: 'pointer',
                                }}
                                properties={{ balloonContent: feature.properties.description }}
                                instanceRef={(ref: any) => {
                                    if (ref) geoObjectsRef.current[index] = ref;
                                }}
                            />
                        );
                    })}

                {/* Метки (Point) */}
                {geoJsonData
                    .filter((feature) => feature.geometry.type === 'Point')
                    .map((point, index) => {
                        const pointGeometry = point.geometry as PointGeometry;
                        const [lng, lat] = pointGeometry.coordinates;

                        return (
                            <Placemark
                                key={`point-${index}`}
                                geometry={[lat, lng]}
                                properties={{
                                    balloonContent: point.properties.description,
                                    iconCaption: point.properties.iconCaption,
                                }}
                                options={{
                                    preset: 'islands#orangeDotIconWithCaption',
                                }}
                            />
                        );
                    })}

                {/* Маркер выбранной точки */}
                {selectedCoords && (
                    <Placemark
                        geometry={selectedCoords}
                        options={{
                            preset: 'islands#redIcon',
                        }}
                        properties={{
                            balloonContent: 'Выбранный адрес',
                        }}
                    />
                )}

                <GeolocationControl options={{ float: "left" }} />
                <ZoomControl options={{ position: { right: 10, top: 10 } }} />
            </MapWithNoSSR>

            {/* Информация по доставке */}
            {showDeliveryInfo && selectedCoords && (
                <div className="mt-4 space-y-4 p-4 border rounded-lg bg-slate-50">
                    <p className="flex gap-2">
                        <span className="font-semibold">Стоимость доставки:</span>
                        <span>{deliveryInfo.price} руб.</span>
                    </p>
                    <p className="flex gap-2">
                        <span className="font-semibold">Доставка доступна:</span>
                        <span className={deliveryInfo.isAllowed ? 'text-green-600' : 'text-red-600'}>
                            {deliveryInfo.isAllowed ? 'Да' : 'Нет'}
                        </span>
                    </p>
                </div>
            )}
        </div>
    );
}
