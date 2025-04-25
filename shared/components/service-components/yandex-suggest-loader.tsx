'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    ymaps: any;
  }
}

export function YandexSuggestLoader() {
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.ymaps) {
      const script = document.createElement('script');
      script.id = 'ymaps-script';
      script.src = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&coordorder=longlat`;
      script.type = 'text/javascript';
      script.async = true;
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
        window.ymaps = null;
      };
    }
  }, []);

  return null;
}