'use client';

import { useState, useRef, useEffect } from 'react';

interface AddressFormProps {
  onAddressSelect: (coords: number[], address: string) => void;
  deliveryBounds?: number[][];
}

export default function AddressForm({ onAddressSelect, deliveryBounds }: AddressFormProps) {
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
        let url = `/api/yandex/yandex-suggest?text=${encodeURIComponent(value)}&types=house`;
        
        if (deliveryBounds) {
          const [ll, spn] = calculateBoundsParams(deliveryBounds);
          url += `&ll=${ll}&spn=${spn}&strict_bounds=1`;
        }

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
      const addressText = suggestion.title.text;
      const coords = suggestion.geometry?.coordinates;
      
      if (!coords) {
        throw new Error('Координаты не найдены');
      }

      setAddress(addressText);
      setSuggestions([]);
      onAddressSelect(coords, addressText);
    } catch (error) {
      setError('Не удалось определить координаты адреса');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.match(/\d/)) {
      setError('Пожалуйста, укажите номер дома');
      return;
    }

    // Если адрес не выбран из подсказок
    if (!suggestions.some(s => s.title.text === address)) {
      setError('Пожалуйста, выберите адрес из списка предложений');
    }
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
                {s.title.text}
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

// Вспомогательная функция для расчета границ
const calculateBoundsParams = (bounds: number[][]) => {
  const lats = bounds.map(p => p[0]);
  const lngs = bounds.map(p => p[1]);
  
  const centerLat = (Math.max(...lats) + Math.min(...lats)) / 2;
  const centerLng = (Math.max(...lngs) + Math.min(...lngs)) / 2;
  
  const spanLat = Math.max(...lats) - Math.min(...lats);
  const spanLng = Math.max(...lngs) - Math.min(...lngs);

  return [`${centerLng},${centerLat}`, `${spanLng},${spanLat}`];
};