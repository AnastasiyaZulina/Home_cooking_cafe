'use client';

import { useState, useRef } from 'react';

export default function AddressForm() {
  const [street, setStreet] = useState('');
  const [streetSelected, setStreetSelected] = useState(false);
  const [house, setHouse] = useState('');
  const [apartment, setApartment] = useState('');
  const [streetSuggestions, setStreetSuggestions] = useState<any[]>([]);
  const [houseSuggestions, setHouseSuggestions] = useState<any[]>([]);

  const streetTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const houseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleStreetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStreet(value);
    setStreetSelected(false);

    if (streetTimeoutRef.current) clearTimeout(streetTimeoutRef.current);

    if (!value.trim()) {
      setStreetSuggestions([]);
      return;
    }

    streetTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/yandex/yandex-suggest?text=${encodeURIComponent(value)}&types=street`);
        const data = await res.json();
        setStreetSuggestions(data.results || []);
      } catch (error) {
        console.error('Ошибка получения улиц:', error);
      }
    }, 300);
  };

  const [streetUri, setStreetUri] = useState('');
  const [streetLL, setStreetLL] = useState('');
  
  const handleStreetSelect = (suggestion: any) => {
    setStreet(suggestion.title.text);
    setStreetSelected(true);
    setStreetSuggestions([]);
  
    // сохраняем URI улицы или координаты
    setStreetUri(suggestion.uri || '');
    setStreetLL(suggestion.address?.component?.find((c: any) => c.kind?.includes('STREET'))?.ll || '');
  };

  const handleHouseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHouse(value);

    if (houseTimeoutRef.current) clearTimeout(houseTimeoutRef.current);

    if (!value.trim() || !streetSelected) {
      setHouseSuggestions([]);
      return;
    }

    houseTimeoutRef.current = setTimeout(async () => {
        try {
          const fullAddress = `${street} ${value}`;
          const res = await fetch(
            `/api/yandex/yandex-suggest?text=${encodeURIComponent(fullAddress)}&types=house&ll=${encodeURIComponent(streetLL)}&spn=0.002,0.002&strict_bounds=1`
          );
          const data = await res.json();
          setHouseSuggestions(data.results || []);
        } catch (error) {
          console.error('Ошибка получения домов:', error);
        }
      }, 300);
    }
    const handleHouseSelect = (suggestion: any) => {
        const houseComponent = suggestion.address?.component?.find((c: any) =>
          c.kind?.includes('HOUSE')
        );
        setHouse(houseComponent?.name || suggestion.title.text); // fallback
        setHouseSuggestions([]);
      };

  return (
    <form className="max-w-md space-y-4">
      {/* Улица */}
      <div>
        <label className="block text-sm font-medium">Улица</label>
        <input
          type="text"
          value={street}
          onChange={handleStreetChange}
          placeholder="Введите улицу"
          className="w-full border rounded px-3 py-2"
        />
        {streetSuggestions.length > 0 && (
          <ul className="border rounded bg-white mt-1 max-h-48 overflow-auto shadow">
            {streetSuggestions.map((s, i) => (
              <li
                key={i}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleStreetSelect(s)}
              >
                {s.title.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Дом */}
      <div>
        <label className="block text-sm font-medium">Дом</label>
        <input
          type="text"
          value={house}
          onChange={handleHouseChange}
          placeholder="Введите номер дома"
          className="w-full border rounded px-3 py-2"
          disabled={!streetSelected}
        />
        {houseSuggestions.length > 0 && (
          <ul className="border rounded bg-white mt-1 max-h-48 overflow-auto shadow">
            {houseSuggestions.map((s, i) => (
              <li
                key={i}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleHouseSelect(s)}
              >
                {s.title.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Квартира */}
      <div>
        <label className="block text-sm font-medium">Квартира (необязательно)</label>
        <input
          type="text"
          value={apartment}
          onChange={(e) => setApartment(e.target.value)}
          placeholder="Введите квартиру"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Отправить
      </button>
    </form>
  );
}
