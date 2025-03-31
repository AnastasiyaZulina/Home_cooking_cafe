'use client';
import React from 'react';
import Image from 'next/image';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';
import Link from 'next/link';
import { Button } from '../ui';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CartDrawerItem } from './cart-drawer-item';
import { Title } from './title';
import { cn } from '@/shared/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useCart } from '@/hooks';
import toast from 'react-hot-toast';

export const CartDrawer: React.FC<React.PropsWithChildren> = ({children}) => {
  const { totalAmount, updateItemQuantity, items, removeCartItem } = useCart();
  const [redirecting, setRedirecting] =React.useState(false);
  const onClickCountButton = (id: number, quantity: number, type: 'plus' | 'minus') => {
    const product = items.find(item => item.id === id);
    
    if (type === 'plus' && product && quantity >= product.stockQuantity) {
      toast.error('Больше порций добавить нельзя');
      return;
    }
    
    const newQuantity = type === 'plus' ? quantity + 1 : quantity - 1;
    updateItemQuantity(id, newQuantity);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex flex-col justify-between pb-0 bg-[#F4F1EE]">
        <VisuallyHidden>
          <SheetTitle>Корзина</SheetTitle>
        </VisuallyHidden>
        <div className={cn('flex flex-col h-full', !totalAmount && 'justify-center')}>
          {totalAmount > 0 && (
            <SheetHeader>
              <SheetTitle>
                В корзине <span className="font-bold">{items.length}</span> товара
              </SheetTitle>
            </SheetHeader>
          )}
          {!totalAmount && (
            <div className="flex flex-col items-center justify-center w-72 mx-auto">
              <Image src="/assets/images/empty-box.png" alt="Empty cart" width={120} height={120} />
              <Title size="sm" text="Корзина пустая" className="text-center font-bold my-2" />
              <p className="text-center text-neutral-500 mb-5">
                Добавьте хотя бы одно блюдо, чтобы совершить заказ
              </p>

              <SheetClose asChild>
                <Button className="w-56 h-12 text-base" size="lg">
                  <ArrowLeft className="w-5 mr-2" />
                  Вернуться назад
                </Button>
              </SheetClose>
            </div>
          )}

          {totalAmount > 0 && (
            <>
              <div className="mt-5 overflow-auto flex-1">
                {
                  items.map((item) => (
                    <div key={item.id} className="mb-2">
                      <CartDrawerItem
                        id={item.id}
                        image={item.image}
                        name={item.name}
                        weight={item.weight}
                        eValue={item.eValue}
                        price={item.price}
                        quantity={item.quantity}
                        disabled={item.disabled}
                        stockQuantity={item.stockQuantity}
                        onClickCountButton={(type) => onClickCountButton(item.id, item.quantity, type)}
                        onClickRemove={() => removeCartItem(item.id)}>
                      </CartDrawerItem>
                    </div>
                  ))
                }
              </div>

              <SheetFooter className="border-t bg-white p-8">
                <div className="w-full">
                  <div className="flex mb-4">
                    <span className="flex flex-1 text-lg text-neutral-500">
                      Итого
                      <div className="flex-1 border-b border-dashed border-b-neutral-200 relative -top-1 mx-2" />
                    </span>

                    <span className="font-bold text-lg">{totalAmount} ₽</span>
                  </div>

                  <Link href="/checkout">
                    <Button
                      type="submit"
                      className="w-full h-12 text-base"
                      onClick={() =>setRedirecting(true)}
                      loading={redirecting}>
                      Оформить заказ
                      <ArrowRight className="w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </SheetFooter>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};