interface Props {
  orderId: number;
  totalPrice: number;
  paymentUrl: string;
}

export const PayOrderTemplate: React.FC<Props> = ({
  orderId,
  totalPrice,
  paymentUrl,
})=>(
    <div>
      <h1>Заказ #{orderId}</h1>
      <p>Оплатите заказ на сумму {totalPrice} ₽. Перейдите <a href={paymentUrl}>по этой ссылке</a> для оплаты заказа</p>
    </div>
)