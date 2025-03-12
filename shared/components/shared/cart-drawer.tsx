'use client';
import React from 'react';
import { cn } from '@/shared/lib/utils';
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
import { ArrowRight } from 'lucide-react';
import { CartDrawerItem } from './cart-drawer-item';
import { useCartStore } from '@/shared/store';

interface Props {
    className?: string;
}

export const CartDrawer: React.FC<React.PropsWithChildren<Props>> = ({children, className }) => {
  const totalAmount = useCartStore(state => state.totalAmount);
  const items = useCartStore(state => state.items);
  const fetchCartItems = useCartStore(state => state.fetchCartItems);
  const updateItemQuantity = useCartStore(state => state.updateItemQuantity);
  const removeCartItem = useCartStore(state => state.removeCartItem);

  const onClickCountButton = (id: number, quantity: number, type: 'plus'|'minus')=>{
    const newQuantity = type === 'plus' ? quantity + 1 : quantity - 1;
    updateItemQuantity(id, newQuantity);
  }

  React.useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);
    return (
        <Sheet>
        <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="flex flex-col justify-between pb-0 bg-[#F4F1EE]">
            <SheetHeader>
              <SheetTitle>
                В корзине <span className="font-bold">{items.length}</span> товара
              </SheetTitle>
            </SheetHeader>

            <div className="mt-5 overflow-auto flex-1">
                  {
                    items.map((item)=>(
                      <div key={item.id} className="mb-2">
                      <CartDrawerItem
                      id={item.id} 
                      image={item.image} 
                      name={item.name} 
                      weight={item.weight} 
                      eValue={item.eValue} 
                      price={item.price} 
                      quantity={item.quantity}
                      onClickCountButton={(type)=> onClickCountButton(item.id, item.quantity, type)}
                      onClickRemove={()=> removeCartItem(item.id)}>
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

                  <Link href="/cart">
                    <Button
                      type="submit"
                      className="w-full h-12 text-base">
                      Оформить заказ
                      <ArrowRight className="w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
            </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};