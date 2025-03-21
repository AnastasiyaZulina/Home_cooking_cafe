import { CreateCartItemValues } from '@/shared/services/dto/cart.dto';
import { CartStateItem, useCartStore } from '@/shared/store';
import React from 'react';

type ReturnProps = {
  totalAmount: number;
  items: CartStateItem[];
  loading: boolean;
  updateItemQuantity: (id: number, quantity: number) => void;
  removeCartItem: (id: number) => void;
  addCartItem: (values: CreateCartItemValues) => void;
  fetchCartItems: () => void;
};

export const useCart = (runFetch: boolean = true): ReturnProps => {
  const totalAmount = useCartStore(state => state.totalAmount);
  const items = useCartStore(state => state.items);
  const fetchCartItems = useCartStore(state => state.fetchCartItems);
  const updateItemQuantity = useCartStore(state => state.updateItemQuantity);
  const removeCartItem = useCartStore(state => state.removeCartItem);
  const addCartItem = useCartStore(state => state.addCartItem);
  const loading = useCartStore(state => state.loading);

  React.useEffect(() => {
    if (runFetch) {
      fetchCartItems();
    }
  }, [runFetch, fetchCartItems]);

  return {
    totalAmount,
    items,
    loading,
    updateItemQuantity,
    removeCartItem,
    addCartItem,
    fetchCartItems
  };
};
