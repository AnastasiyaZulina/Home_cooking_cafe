interface Props {
  orderId: number;
  items: Array<{
    productName: string;
    productPrice: number;
    productQuantity: number;
  }>;
}

export const OrderSuccessTemplate: React.FC<Props> = ({ orderId, items }) => (
  <div>
    <h1>Спасибо за покупку!</h1>
    <p>Ваш заказ #{orderId} оплачен. Список товаров:</p><hr/>
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          {item.productName} | {item.productPrice}₽ x {item.productQuantity} шт.={' '}
          {item.productPrice * item.productQuantity}₽
        </li>
      ))}
    </ul>
  </div>
);