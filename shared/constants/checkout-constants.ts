// Константы времени доставки
export const CHECKOUT_CONSTANTS = {
  WORKING_HOURS: {
    START: 10, // Начало приема заказов (10:00)
    END: 20,   // Последний саказ до (20:00)
    MIN_DELIVERY_TIME_HOURS: 1, // Минимальное время доставки (1 час)
    TIME_SLOT_DURATION: 30,     // Длительность слота в минутах
  },

  // Сообщения 20:00-1:30=18:30
  MESSAGES: {
    OUT_OF_HOURS: 'Заказы принимаются с 10:00 до 18:30. Сейчас прием заказов закрыт.',
    SELECT_DELIVERY_TIME: 'Выберите время доставки/самовывоза:',
  },

  BONUS_MULTIPLIER: 0.05,
  TIMEZONE_OFFSET: 7 * 60 * 60 * 1000,
  DELIVERY_COST: 250
};