import { InfoBlock } from "@/shared/components";

export default function CheckoutEmptyPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 sm:mt-40">
      <InfoBlock
        title="Корзина пуста"
        text="Добавьте хотя бы один товар, чтобы оформить заказ."
        imageUrl="/assets/images/empty-box.png"
      />
    </div>
  );
}