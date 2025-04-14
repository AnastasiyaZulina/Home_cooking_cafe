'use client';

import { useState, useRef } from 'react';

interface AddressFormProps {
  onAddressSelect: (coords: number[], address: string) => void;
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
        const ll = '82.938612,55.052716'; // центр поиска (например, Новосибирск)
        const spn = '0.28,0.02';         // радиус охвата
        const url = `/api/yandex/yandex-suggest?text=${encodeURIComponent(value)}&types=house&ll=${ll}&spn=${spn}&attrs=uri`; // добавляем attrs=uri
  
        const res = await fetch(url);
        const data = await res.json();
        setSuggestions(data.results || []);
        console.log(data);
      } catch (error) {
        console.error('Ошибка получения подсказок:', error);
      }
    }, 300);
  };
  

  const handleAddressSelect = async (suggestion: any) => {
    try {
      // Берем полный адрес и uri
      const full = suggestion.address?.formatted_address || suggestion.title.text || '';
      const addressText = full.replace(/^Россия,\s*/, '');
      const uri = suggestion.uri;
  
      if (!uri) throw new Error('URI не найден');
  
      // Геокодер: получаем дополнительные сведения по URI
      const geocodeRes = await fetch(`https://geocode-maps.yandex.ru/1.x/?apikey=${process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY}&uri=${uri}&format=json`);
      const geoData = await geocodeRes.json();
  
      // Получаем координаты из ответа геокодера
      const pos = geoData.response.GeoObjectCollection.featureMember?.[0]?.GeoObject?.Point?.pos;
  
      if (!pos) throw new Error('Координаты не найдены');
  
      const [lon, lat] = pos.split(' ').map(Number); // важно: сначала lon, потом lat
      const coords = [lon, lat];
  
      setAddress(addressText);
      setSuggestions([]);
      console.log('Координаты:', coords);
      onAddressSelect(coords, addressText); // передаем координаты и текст адреса
    } catch (error) {
      console.error(error);
      setError('Не удалось определить координаты адреса');
    }
  };
  
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.match(/\d/)) {
      setError('Пожалуйста, укажите номер дома');
      return;
    }

    const matched = suggestions.find(s => {
      const full = s.address?.formatted_address || s.title.text;
      return full.replace(/^Россия,\s*/, '') === address;
    });

    if (!matched) {
      setError('Пожалуйста, выберите адрес из списка предложений');
      return;
    }

    const coords = matched.geometry?.coordinates;
    if (!coords) {
      setError('Не удалось определить координаты адреса');
      return;
    }

    console.log('Координаты выбранного адреса:', coords);
    onAddressSelect(coords, address);
  };

  return (
    <form className="max-w-md space-y-4" onSubmit={handleSubmit}>
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

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Найти
      </button>
    </form>
  );
}
