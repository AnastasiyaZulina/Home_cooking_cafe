import { create } from "zustand";
import { getCartDetails } from "../lib";
import { Api } from "../services/api-clients";
import { CreateCartItemValues } from "../services/dto/cart.dto";

export type CartStateItem = {
    id: number;
    quantity: number;
    name: string;
    weight: number;
    eValue: number;
    image: string;
    price: number;
    disabled?: boolean;
  };

export interface CartState {
    loading: boolean;
    error: boolean;
    totalAmount: number;
    items: CartStateItem[];
    fetchCartItems: () => Promise<void>;
    updateItemQuantity: (id: number, quantity: number) => Promise<void>;
    //!!!!!!! Типизироваать
    addCartItem: (values: any) => Promise<void>;
    removeCartItem: (id: number) => Promise<void>;
  }

  export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    error: false,
    loading: true,
    totalAmount: 0,

    fetchCartItems: async () => {
      try {
        set({ loading: true, error: false });
        const data = await Api.cart.getCart();
        set(getCartDetails(data));
      } catch (error) {
        console.error(error);
        set({ error: true });
      } finally {
        set({ loading: false });
      }
    },

    updateItemQuantity: async (id: number, quantity: number) => {
      try {
        set({ loading: true, error: false });
        const data = await Api.cart.updateItemQuantity(id, quantity);
        set(getCartDetails(data));
      } catch (error) {
        console.error(error);
        set({ error: true });
      } finally {
        set({ loading: false });
      }
    },

    removeCartItem: async (id: number) => {
      try {
        set((state) => ({ 
          loading: true, 
          error: false, 
          items: state.items.map((item)=>(item.id===id?{...item, disabled:true}:item)),
      }));
        const data = await Api.cart.removeCartItem(id);
        set(getCartDetails(data));
      } catch (error) {
        set({ error: true });
        console.error(error);
      } finally {
        set((state) => ({ loading: false, items: state.items.map((item)=>({...item, disabled: false}))}));
      }
    },
    addCartItem: async (values: CreateCartItemValues) => {
      try {
        set({ loading: true, error: false });
        const data = await Api.cart.addCartItem({
          productId: values.productId,
          quantity: values.quantity || 1 // Явно передаём quantity
        });
        set(getCartDetails(data));
      } catch (error) {
        console.error(error);
        set({ error: true });
      } finally {
        set({ loading: false });
      }
    },
  }));