import { CartItemDTO } from "@/shared/services/dto/cart.dto";

interface Props {
  orderId: number;
}

export const OrderCreatedTemplate: React.FC<Props> = ({
  orderId,
}) => (
  <div>
    <h1>Спасибо за заказ!</h1>
    <p>Ваш заказ на самовывоз #{orderId} оформлен.</p><hr/>
  </div>
);