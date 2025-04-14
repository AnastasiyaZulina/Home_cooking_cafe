'use client';

import { useState, useRef } from 'react';

interface AddressFormProps {
  onAddressSelect: (coords: number[]) => void;
}

export default function AddressForm({ onAddressSelect }: AddressFormProps) {
  const [address, setAddress] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddress(value);
    setError('');

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        const ll = '82.938612,55.052716';
        const spn = '0.28,0.02';
        const url = `/api/yandex/yandex-suggest?text=${encodeURIComponent(value)}&types=house&ll=${ll}&spn=${spn}&attrs=uri`;

        const res = await fetch(url);
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (error) {
        console.error('Ошибка получения подсказок:', error);
      }
    }, 300);
  };

  const handleAddressSelect = async (suggestion: any) => {
    try {
      const full = suggestion.address?.formatted_address || suggestion.title.text || '';
      const addressText = full.replace(/^Россия,\s*/, '');
      const uri = suggestion.uri;

      if (!uri) throw new Error('URI не найден');

      const geocodeRes = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&uri=${uri}&format=json`
      );
      const geoData = await geocodeRes.json();
      const pos = geoData.response.GeoObjectCollection.featureMember?.[0]?.GeoObject?.Point?.pos;

      if (!pos) throw new Error('Координаты не найдены');

      const [lon, lat] = pos.split(' ').map(Number);
      const coords = [lat, lon];

      setAddress(addressText);
      setSuggestions([]);
      onAddressSelect(coords);
    } catch (error) {
      console.error(error);
      setError('Не удалось определить координаты адреса');
    }
  };

  return (
    <form className="max-w-md space-y-4" onSubmit={e => e.preventDefault()}>
      <div>
        <label className="block text-sm font-medium">Адрес доставки</label>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Введите улицу и номер дома"
          className="w-full border rounded px-3 py-2"
        />
        {suggestions.length > 0 && (
          <ul className="border rounded bg-white mt-1 max-h-48 overflow-auto shadow">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleAddressSelect(s)}
              >
                {(s.address?.formatted_address || s.title.text).replace(/^Россия,\s*/, '')}
              </li>
            ))}
          </ul>
        )}
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    </form>
  );
}
