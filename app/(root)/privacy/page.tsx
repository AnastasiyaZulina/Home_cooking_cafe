import React from 'react';
import { Container } from '@/shared/components/shared';
import { GLOBAL_CONSTANTS } from '@/shared/constants';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen py-10 bg-white">
      <Container className="prose prose-lg max-w-4xl">
        <h1>Политика конфиденциальности</h1>
        <p>Мы уважаем ваше право на конфиденциальность. Все данные, предоставленные вами при оформлении заказа, регистрации или подписке, используются только для обслуживания и улучшения качества сервиса.</p>

        <h2>Какие данные мы собираем?</h2>
        <ul>
          <li>Имя</li>
          <li>Контактный номер телефона</li>
          <li>Email</li>
          <li>Адрес доставки</li>
        </ul>

        <h2>Как используются ваши данные?</h2>
        <p>Данные используются исключительно для:</p>
        <ul>
          <li>оформления и доставки заказов</li>
          <li>поддержки клиентов</li>
        </ul>

        <h2>Безопасность</h2>
        <p>Мы используем современные методы защиты информации. Ваши данные не передаются третьим лицам без вашего согласия.</p>

        <h2>Обратная связь</h2>
        <p>Если у вас есть вопросы о нашей политике конфиденциальности, свяжитесь с нами по телефону {GLOBAL_CONSTANTS.CONTACTS.PHONE}.</p>
      </Container>
    </main>
  );
}
