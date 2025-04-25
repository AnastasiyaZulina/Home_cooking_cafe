import React from 'react';
import { Container, Title } from '@/shared/components';
import { GLOBAL_CONSTANTS } from '@/shared/constants';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen py-10 bg-white">
      <Container className="prose prose-lg max-w-4xl text-gray-700">

        <Title text={'Политика конфиденциальности'} size="sm" className="font-bold" />
        <p className="mb-6">
          Настоящая Политика конфиденциальности описывает, какие персональные данные мы собираем, как мы их используем и какие меры принимаем для защиты информации пользователей.
        </p>

        <h2 className="text-xl font-semibold mb-4">Какие данные мы собираем</h2>
        <p className="mb-4">Мы можем собирать и хранить следующую информацию о вас:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Имя и фамилия</li>
          <li>Email-адрес</li>
          <li>Номер телефона</li>
          <li>Пароль (в зашифрованном виде)</li>
          <li>История заказов</li>
          <li>Информация о бонусном балансе</li>
          <li>Отзывы и обратная связь</li>
          <li>Информация о способе регистрации (если использовалась сторонняя авторизация)</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">Cookies</h2>
        <p className="mb-6">
          Мы используем cookies для хранения токена корзины у неавторизованных пользователей. Это необходимо для сохранения содержимого корзины между сессиями и улучшения пользовательского опыта.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">Для чего мы используем эти данные</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Для регистрации и авторизации пользователей</li>
          <li>Для обработки и доставки заказов</li>
          <li>Для предоставления доступа к бонусной программе</li>
          <li>Для обратной связи и обработки отзывов</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-4">Хранение и защита данных</h2>
        <p className="mb-6">
          Мы предпринимаем все необходимые технические и организационные меры для защиты ваших персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">Третьи лица</h2>
        <p className="mb-6">
          Мы не передаём ваши персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством Российской Федерации.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-4">Обратная связь</h2>
        <p className="mb-6">
          Если у вас есть вопросы о нашей политике конфиденциальности, свяжитесь с нами по телефону <strong>{GLOBAL_CONSTANTS.CONTACTS.PHONE}</strong>.
        </p>
      </Container>
    </main>
  );
}
