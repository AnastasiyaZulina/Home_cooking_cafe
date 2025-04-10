import { Prisma } from "@prisma/client";
import { sendEmail } from "./send-email";


export async function chooseAndSendEmail(
  order: Prisma.OrderGetPayload<{ include: { items: true } }>,
  totalAmount: number,
  paymentUrl?: string,
) {
  const {
    items,
    deliveryType,
    deliveryCost,
    deliveryTime,
    bonusDelta,
    address,
    id,
    email,
    paymentMethod,
    status,
  } = order;

  const totalPrice = totalAmount + (deliveryCost || 0);

  // Формирование HTML списка товаров
  const itemsHtml = items.map(item => {
    const itemTotal = item.productPrice * item.productQuantity;
    return `<li>${item.productName} | ${item.productPrice}₽ x ${item.productQuantity} шт. = ${itemTotal}₽</li>`;
  }).join('');

  // Базовый HTML шаблон
  const OrderListHTML = `</hr></hr>
    <h2>Информация о заказе #${id}</h2>
    <h3>Список товаров:</h3>
    <ul>${itemsHtml}</ul>
    <p>Стоимость товаров: ${totalAmount}₽</p>
    ${deliveryType === 'DELIVERY' ? `
      <p>Стоимость доставки: ${deliveryCost}₽</p>
      <p>Адрес доставки: ${address}</p>
      <p>Время доставки: ${deliveryTime}</p>
    ` : `
      <p>Время самовывоза: ${deliveryTime}</p>
    `}
    ${bonusDelta > 0 ? `<p>Начислено бонусов: ${bonusDelta}₽</p>` : ''}
    ${bonusDelta < 0 ? `<p>Списано бонусов: ${Math.abs(bonusDelta)}₽</p>` : ''}
    <p><strong>Итого: ${totalPrice}₽</strong></p>
  `;

  // Формируем ключ для switch
  const caseKey = `${deliveryType}:${paymentMethod}:${status}`;

  try {
    switch (caseKey) {
      // Доставка + онлайн оплата
      case 'DELIVERY:ONLINE:PENDING':
      case 'PICKUP:ONLINE:PENDING':
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: ожидает оплаты`,
          `Оплатите заказ по ссылке: ${paymentUrl}${OrderListHTML}`
        );
        break;

      case 'DELIVERY:ONLINE:SUCCEEDED':
      case 'PICKUP:ONLINE:SUCCEEDED':
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: успешная оплата`,
          `Оплата подтверждена! Собираем ваш заказ.${OrderListHTML}`
        );
        break;

      case 'DELIVERY:ONLINE:DELIVERY':
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: в пути`,
          `Ваш заказ отправлен по адресу: ${address}. Ожидайте в ${deliveryTime}.${OrderListHTML}`
        );
        break;
      case 'PICKUP:OFFLINE:READY':
      case 'PICKUP:ONLINE:READY':
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: готов к выдаче`,
          `Заказ готов к самовывозу в ${deliveryTime}.${OrderListHTML}`
        );
        break;

      case 'PICKUP:OFFLINE:PENDING':
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: принят`,
          `Соберём Ваш заказ к ${deliveryTime}.${OrderListHTML}`
        );
        break;

      // Общие статусы
      case 'DELIVERY:ONLINE:COMPLETED':
      case 'PICKUP:ONLINE:COMPLETED':
      case 'PICKUP:OFFLINE:COMPLETED':
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: выполнен`,
          `Спасибо за покупку! Ждем вас снова.${OrderListHTML}`
        );
        break;

      case 'DELIVERY:ONLINE:CANCELLED':
      case 'PICKUP:ONLINE:CANCELLED':
      case 'PICKUP:OFFLINE:CANCELLED':
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: отменен`,
          `Ваш заказ был отменен.${OrderListHTML}`
        );
        break;

      default:
        console.error('Unknown case combination:', caseKey);
        throw new Error(`Неизвестная комбинация параметров заказа: ${caseKey}`);
    }
  } catch (err) {
    console.error('Email sending failed:', err);
    throw new Error('Ошибка отправки email');
  }
}