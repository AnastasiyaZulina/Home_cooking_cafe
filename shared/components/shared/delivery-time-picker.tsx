import { CHECKOUT_CONSTANTS } from "@/shared/constants";
import { ChevronDown } from "lucide-react";
import React, { useState } from "react";

interface DeliveryTimePickerProps {
    deliveryTime: Date | null;
    setDeliveryTime: (time: Date) => void;
}


const generateTimeSlots = () => {
    // Получаем текущее время в UTC
    const now = new Date();
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60 * 1000;

    // Добавляем смещение для Новосибирска (UTC+7)
    const novosibirskTime = new Date(utcTime + CHECKOUT_CONSTANTS.TIMEZONE_OFFSET);

    const currentHour = novosibirskTime.getHours();
    const currentMinutes = novosibirskTime.getMinutes();

    console.log(`Текущее время в Новосибирске: ${currentHour}:${currentMinutes}`);

    // Проверяем, находимся ли мы в рабочем времени
    if (currentHour >= CHECKOUT_CONSTANTS.WORKING_HOURS.END ||
        currentHour < CHECKOUT_CONSTANTS.WORKING_HOURS.START) {
        return [];
    }

    // Округляем текущее время в большую сторону до ближайших 30 минут
    let roundedMinutes = 0;
    if (currentMinutes > 0 && currentMinutes <= 30) {
        roundedMinutes = 30 - currentMinutes;
    } else if (currentMinutes > 30) {
        roundedMinutes = 60 - currentMinutes;
    }

    // Создаем стартовое время (текущее время + округление)
    const roundedTime = new Date(novosibirskTime.getTime() + roundedMinutes * 60 * 1000);

    // Добавляем минимальное время доставки (1 час)
    const startTime = new Date(roundedTime.getTime() + CHECKOUT_CONSTANTS.WORKING_HOURS.MIN_DELIVERY_TIME_HOURS * 60 * 60 * 1000);

    console.log(`Время первого слота: ${startTime.getHours()}:${startTime.getMinutes()}`);

    // Если после добавления часа мы вышли за рабочие часы, возвращаем пустой массив
    if (startTime.getHours() >= CHECKOUT_CONSTANTS.WORKING_HOURS.END) {
        return [];
    }

    const slots = [];
    let currentSlot = new Date(startTime);

    // Генерируем слоты до конца рабочего дня
    while (currentSlot.getHours() < CHECKOUT_CONSTANTS.WORKING_HOURS.END) {
        const slotEnd = new Date(
            currentSlot.getTime() + CHECKOUT_CONSTANTS.WORKING_HOURS.TIME_SLOT_DURATION * 60 * 1000
        );

        // Разрешаем последний слот, даже если он заканчивается в точное время закрытия
        if (slotEnd.getHours() > CHECKOUT_CONSTANTS.WORKING_HOURS.END ||
            (slotEnd.getHours() === CHECKOUT_CONSTANTS.WORKING_HOURS.END && slotEnd.getMinutes() > 0)) {
            break;
        }

        slots.push({
            start: new Date(currentSlot),
            end: new Date(slotEnd),
        });

        currentSlot = slotEnd;
    }

    console.log("Доступные слоты:", slots.map(s =>
        `${s.start.getHours()}:${s.start.getMinutes()}-${s.end.getHours()}:${s.end.getMinutes()}`
    ));

    return slots;
};


export const DeliveryTimePicker = React.memo(function DeliveryTimePicker({
    deliveryTime, 
    setDeliveryTime
}: DeliveryTimePickerProps) {
    const timeSlots = React.useMemo(() => generateTimeSlots(), []);
    const isWorkingHours = timeSlots.length > 0;
    const [showAllSlots, setShowAllSlots] = useState(false);

    // Устанавливаем первый слот по умолчанию
    React.useEffect(() => {
        if (timeSlots.length > 0 && !deliveryTime) {
            setDeliveryTime(new Date(timeSlots[0].start));
        }
    }, [timeSlots, deliveryTime, setDeliveryTime]);

    if (!isWorkingHours) {
        return (
            <div className="p-3 bg-red-50 rounded-md text-sm text-red-800 mb-4">
                {CHECKOUT_CONSTANTS.MESSAGES.OUT_OF_HOURS}
            </div>
        );
    }

    const formatTime = (date: Date) => {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const firstSlot = timeSlots[0];
    const otherSlots = timeSlots.slice(1);

    return (
        <div className="mb-4">
            <h4 className="text-sm font-medium mb-3">{CHECKOUT_CONSTANTS.MESSAGES.SELECT_DELIVERY_TIME}</h4>
            
            {/* Первый слот (всегда видимый) */}
            {firstSlot && (
                <button
                    type="button"
                    onClick={() => {
                        setDeliveryTime(new Date(firstSlot.start));
                        // Убрали setShowAllSlots(false) - не сворачиваем список
                    }}
                    className={`p-2 border rounded-md text-sm w-full mb-2 ${
                        deliveryTime?.getTime() === firstSlot.start.getTime()
                            ? 'border-primary bg-primary text-white font-bold'
                            : 'border-gray-300 hover:border-primary'
                    } transition-colors duration-200`}
                >
                    {formatTime(firstSlot.start)} - {formatTime(firstSlot.end)}
                </button>
            )}

            {/* Кнопка "Другое время" */}
            {otherSlots.length > 0 && (
                <button
                    type="button"
                    onClick={() => setShowAllSlots(!showAllSlots)}
                    className="flex items-center justify-center p-2 border border-gray-300 rounded-md text-sm w-full hover:border-primary transition-colors duration-200"
                >
                    Другое время <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAllSlots ? 'rotate-180' : ''}`} />
                </button>
            )}

            {/* Остальные слоты (показываются при showAllSlots = true) */}
            {showAllSlots && otherSlots.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {otherSlots.map((slot, index) => {
                        const startTime = formatTime(slot.start);
                        const endTime = formatTime(slot.end);
                        const isSelected = deliveryTime?.getTime() === slot.start.getTime();

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => {
                                    setDeliveryTime(new Date(slot.start));
                                }}
                                className={`p-2 border rounded-md text-sm ${
                                    isSelected
                                        ? 'border-primary bg-primary text-white font-bold'
                                        : 'border-gray-300 hover:border-primary'
                                } transition-colors duration-200`}
                            >
                                {startTime} - {endTime}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
});