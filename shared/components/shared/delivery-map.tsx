'use client';

import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    ymaps: any;
  }
}

export default function DeliveryMap() {
  const mapRef = useRef<any>(null);
  const [scriptReady, setScriptReady] = useState(false);

  // Ждём появления ymaps
  useEffect(() => {
    const checkYmaps = () => {
      if (typeof window !== 'undefined' && window.ymaps) {
        setScriptReady(true);
      } else {
        setTimeout(checkYmaps, 100); // пробуем снова
      }
    };

    checkYmaps();
  }, []);

  // Когда ymaps появился — инициализируем карту
  useEffect(() => {
    if (!scriptReady) return;
  
    window.ymaps.ready(() => {
      const map = new window.ymaps.Map('map', {
        center: [55.03, 82.92],
        zoom: 11,
        controls: ['zoomControl'],
      });
  
      mapRef.current = map;
  
      fetch('/geo/delivery-zones.geojson')
        .then((res) => res.json())
        .then((geojson) => {
          const geoObjects = window.ymaps.geoQuery(geojson).addToMap(map);
  
          geoObjects.setOptions({
            fillColor: '#ff000040',
            strokeColor: '#ff0000',
            strokeWidth: 2,
          });
  
          map.setBounds(geoObjects.getBounds(), { checkZoomRange: true });
        })
        .catch((error) => {
          console.error('❌ Ошибка загрузки GeoJSON:', error);
        });
    });
  }, [scriptReady]);
  

  return <div id="map" className="w-full h-[500px]" />;
}
