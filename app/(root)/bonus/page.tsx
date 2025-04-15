'use client';

import { Container, WhiteBlock } from "@/shared/components";
import { GLOBAL_CONSTANTS } from "@/shared/constants";

export default function BonusPage() {
  return (
    <Container>
      <WhiteBlock className="mb-8 p-6" title="Бонусная программа">
        <p className="text-base leading-relaxed text-gray-700 space-y-4 mb-8">
          Добро пожаловать в нашу бонусную программу! Бонусы — это наша благодарность за ваши заказы. Вы можете накапливать бонусы и использовать их для оплаты следующих покупок.
        </p>

        <p className="mb-4">
          <strong>Как начисляются бонусы?</strong>
        </p>
        <ul className="list-disc pl-5 mb-4 text-gray-700">
          <li>При оформлении заказа можно либо списать, либо начислить бонусы.</li>
          <li>Вы можете решать сами, сколько бонусов списать при оформлении заказа.</li>
          <li>Чтобы начать накапливать бонусы, необходимо авторизоваться в системе.</li>
        </ul>

        <p className="mb-4">
          Чтобы участвовать в бонусной программе и накапливать бонусы, авторизуйтесь в системе. Бонусы начисляются в размере <strong>{GLOBAL_CONSTANTS.BONUS_MULTIPLIER * 100}%</strong> от суммы заказа.
        </p>

        <p className="text-gray-600">
          Зарегистрировавшись и авторизовавшись, вы сможете наслаждаться не только вкусной едой, но и приятными бонусами за ваши заказы.
        </p>
      </WhiteBlock>
    </Container>
  );
}
