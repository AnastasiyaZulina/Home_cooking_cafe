// Константы времени работы
const WORKING_HOURS = {
    START: 10, // 10:00
    END: 20,   // 20:00
    MIN_DELIVERY_HOURS: 2, // Минимальное время на подготовку заказа (часы)
    TIME_SLOT_DURATION: 30, // Длительность слота в минутах
    CLOSED_MESSAGE: 'Прием заказов с 10:00 до 20:00. Сейчас заказы не принимаются.'
  };
  
  // Таймзона Новосибирска (UTC+7)
  const NOVOSIBIRSK_TIMEZONE_OFFSET = 7 * 60; // минуты