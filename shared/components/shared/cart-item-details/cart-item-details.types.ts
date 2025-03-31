export interface CartItemProps {
  id: number;
  image: string;
  name: string;
  price: number;
  weight: number;
  eValue: number;
  quantity: number;
  className?: string;
  disabled?: boolean;
  stockQuantity: number;
}
