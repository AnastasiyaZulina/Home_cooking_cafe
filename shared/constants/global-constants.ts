// Константы времени доставки
export const GLOBAL_CONSTANTS = {
  WORKING_HOURS: {
    START: 10, // Начало приема заказов (10:00)
    END: 19,   // Последний саказ до (19:00)
    MIN_DELIVERY_TIME_HOURS: 1, // Минимальное время доставки (1 час)
    TIME_SLOT_DURATION: 30,     // Длительность слота в минутах
    START_OFFLINE_HOURS: 8,
    START_OFFLINE_MINUTES: 15,
  },

  // Сообщения 20:00-1:30=18:30
  MESSAGES: {
    OUT_OF_HOURS: 'Заказы принимаются с 10:00 до 17:30. Сейчас прием заказов закрыт.',
    SELECT_DELIVERY_TIME: 'Выберите время доставки/самовывоза:',
  },

  BONUS_MULTIPLIER: 0.05,
  TIMEZONE_OFFSET: 7 * 60 * 60 * 1000,
  DELIVERY_COST: 250,

  CONTACTS:{
    PHONE: '+7‒913‒917‒99‒49',
    ADRESS: 'г.Новосибирск, ул. ​Николая Островского, 111 к5 ​108 офис',
  }
};