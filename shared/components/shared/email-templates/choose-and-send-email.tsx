import { Prisma } from "@prisma/client";
import React from "react";
import { EmailOrderTemplate } from "./email-order-template";
import { sendEmail } from "@/shared/lib";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { CHECKOUT_CONSTANTS } from "@/shared/constants";

dayjs.extend(utc);
dayjs.extend(timezone);

// Функция для форматирования времени
const formatDeliveryTime = (date: Date | string) => {
  const dateString = typeof date === 'string' ? date : date.toISOString();
  const start = dayjs(dateString).tz('Asia/Novosibirsk');
  const end = start.add(CHECKOUT_CONSTANTS.WORKING_HOURS.TIME_SLOT_DURATION, 'minute');
  
  return {
    timeRange: `${start.format('HH:mm')}-${end.format('HH:mm')}`,
    date: start.format('DD.MM.YYYY')
  };
};

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
  const itemsHtml = items
    .map((item) => {
      const itemTotal = item.productPrice * item.productQuantity;
      return `<li style="margin-bottom: 10px;">
        ${item.productName} | ${item.productPrice}₽ x ${item.productQuantity} шт. = ${itemTotal}₽
      </li>`;
    })
    .join("");

  // Базовый HTML шаблон
  const OrderListHTML = `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2 style="color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">
        Информация о заказе #${id}
      </h2>
      <h3 style="color: #2d3748;">Список товаров:</h3>
      <ul style="list-style: none; padding-left: 0;">${itemsHtml}</ul>
      <p style="font-size: 16px;">Стоимость товаров: ${totalAmount}₽</p>
      ${
        deliveryType === "DELIVERY"
          ? `
            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p>🚚 Стоимость доставки: ${deliveryCost}₽</p>
              <p>📍 Адрес доставки: ${address}</p>
              <p>⏰ Время доставки: ${formatDeliveryTime(deliveryTime).timeRange} 
              </p>
            </div>
          `
          : `
            <div style="background: #f7fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p>🏪 Время самовывоза: ${formatDeliveryTime(deliveryTime).timeRange} 
              </p>
            </div>
          `
      }
      ${
        bonusDelta > 0
          ? `<p style="color: #38a169;">🎉 Начислено бонусов: ${bonusDelta}₽</p>`
          : ""
      }
      ${
        bonusDelta < 0
          ? `<p style="color: #e53e3e;">🔻 Списано бонусов: ${Math.abs(bonusDelta)}₽</p>`
          : ""
      }
      <p style="font-size: 18px; font-weight: bold; color: #1a365d;">
        💰 Итого: ${totalPrice}₽
      </p></hr>
            <p style="font-size: 12px;">
            ${formatDeliveryTime(deliveryTime).date}
      </p>
    </div>
  `;

  const caseKey = `${deliveryType}:${paymentMethod}:${status}`;

  try {
    switch (caseKey) {
      case "DELIVERY:ONLINE:PENDING":
      case "PICKUP:ONLINE:PENDING":
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: ожидает оплаты`,
          <EmailOrderTemplate
            content={`${OrderListHTML}`}
            paymentUrl={paymentUrl}
          />
        );
        break;

      case "DELIVERY:ONLINE:SUCCEEDED":
      case "PICKUP:ONLINE:SUCCEEDED":
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: успешная оплата`,
          <EmailOrderTemplate
            content={`<p style="color: #38a169; font-weight: bold; font-size: 18px;">✅ Оплата подтверждена!</p>
            <p style="font-size: 16px;">Собираем ваш заказ.</p>${OrderListHTML}`}
          />
        );
        break;

      case "DELIVERY:ONLINE:DELIVERY":
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: в пути`,
          <EmailOrderTemplate
            content={`<p style="font-size: 16px;">
              🚚 Ваш заказ отправлен по адресу: ${address}.<br/>
              ⏰ Ожидайте в ${formatDeliveryTime(deliveryTime).timeRange}.
            </p>${OrderListHTML}`}
          />
        );
        break;

      case "PICKUP:OFFLINE:READY":
      case "PICKUP:ONLINE:READY":
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: готов к выдаче`,
          <EmailOrderTemplate
            content={`<p style="font-size: 16px;">
              🎉 Заказ готов к самовывозу в ${deliveryTime}.
            </p>${OrderListHTML}`}
          />
        );
        break;

      case "PICKUP:OFFLINE:PENDING":
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: принят`,
          <EmailOrderTemplate
            content={`<p style="font-size: 16px;">
              👨🍳 Соберём Ваш заказ к ${deliveryTime}.
            </p>${OrderListHTML}`}
          />
        );
        break;

      case "DELIVERY:ONLINE:COMPLETED":
      case "PICKUP:ONLINE:COMPLETED":
      case "PICKUP:OFFLINE:COMPLETED":
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: выполнен`,
          <EmailOrderTemplate
            content={`<p style="font-size: 16px; color: #38a169;">
              🎉 Спасибо за покупку! Ждем вас снова.
            </p>${OrderListHTML}`}
          />
        );
        break;

      case "DELIVERY:ONLINE:CANCELLED":
      case "PICKUP:ONLINE:CANCELLED":
      case "PICKUP:OFFLINE:CANCELLED":
        await sendEmail(
          email,
          `Скатерть-самобранка | Заказ #${id}: отменен`,
          <EmailOrderTemplate
            content={`<p style="color: #e53e3e; font-size: 16px;">
              ❌ Ваш заказ был отменен.
            </p>${OrderListHTML}`}
          />
        );
        break;

      default:
        console.error("Unknown case combination:", caseKey);
        throw new Error(`Неизвестная комбинация параметров заказа: ${caseKey}`);
    }
  } catch (err) {
    console.error("Email sending failed:", err);
    throw new Error("Ошибка отправки email");
  }
}