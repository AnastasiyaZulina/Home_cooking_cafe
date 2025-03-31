import { create } from "zustand";
import { getCartDetails } from "../lib";
import { Api } from "../services/api-clients";
import { CreateCartItemValues } from "../services/dto/cart.dto";

export type CartStateItem = {
    id: number;
    productId: number;
    quantity: number;
    name: string;
    weight: number;
    eValue: number;
    image: string;
    price: number;
    disabled?: boolean;
  };

export interface CartState {
  updatingItems: Record<number, boolean>;
    loading: boolean;
    initialized: boolean;
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
    updatingItems: {},
    items: [],
    initialized: false,
    error: false,
    loading: true,
    totalAmount: 0,

    fetchCartItems: async () => {
      if (get().initialized) return;
      try {
        set({ loading: true, error: false });
        const data = await Api.cart.getCart();
        set({ 
          ...getCartDetails(data),
          initialized: true // Помечаем как инициализированное
        });
      } catch (error) {
        console.error(error);
        set({ error: true });
      } finally {
        set({ loading: false });
      }
    },

    updateItemQuantity: async (id: number, quantity: number) => {
      try {
        set(state => ({
          updatingItems: { ...state.updatingItems, [id]: true } // Блокируем элемент
        }));
        
        const data = await Api.cart.updateItemQuantity(id, quantity);
        set(getCartDetails(data));
      } finally {
        set(state => ({
          updatingItems: { ...state.updatingItems, [id]: false } // Разблокируем
        }));
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