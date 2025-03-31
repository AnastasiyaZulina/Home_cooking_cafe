import { create } from "zustand";
import { getCartDetails } from "../lib";
import { Api } from "../services/api-clients";
import { CreateCartItemValues } from "../services/dto/cart.dto";
import toast from "react-hot-toast";

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
    stockQuantity: number;
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
      if (get().initialized) return; // Добавляем проверку на инициализацию
      
      try {
        set({ loading: true, error: false });
        let data = await Api.cart.getCart();
        
        // Первичная обработка данных
        let cartData = getCartDetails(data);
        set({ ...cartData, initialized: true });
  
        // Проверка и корректировка данных
        const adjustments = {
          removed: [] as Array<{ name: string }>,
          reduced: [] as Array<{ name: string; newQuantity: number }>,
        };
  
        // Удаление недоступных товаров
        const unavailableItems = data.items.filter(item => !item.product.isAvailable);
        for (const item of unavailableItems) {
          await Api.cart.removeCartItem(item.id);
          adjustments.removed.push({ name: item.product.name });
        }
  
        // Корректировка количества
        data = await Api.cart.getCart(); // Получаем обновленные данные
        const remainingItems = data.items.filter(item => item.product.isAvailable);
        for (const item of remainingItems) {
          if (item.quantity > item.product.stockQuantity) {
            await Api.cart.updateItemQuantity(item.id, item.product.stockQuantity);
            adjustments.reduced.push({
              name: item.product.name,
              newQuantity: item.product.stockQuantity,
            });
          }
        }
  
        // Обновляем состояние последний раз
        if (unavailableItems.length > 0 || adjustments.reduced.length > 0) {
          data = await Api.cart.getCart();
          set(getCartDetails(data));
        }
  
        // Показываем уведомления
        if (adjustments.removed.length > 0) {
          toast.error(`Товары ${adjustments.removed.map(i => i.name).join(', ')} удалены`);
        }
        if (adjustments.reduced.length > 0) {
          adjustments.reduced.forEach(adj => {
            toast.error(`${adj.name} уменьшено до ${adj.newQuantity}`);
          });
        }
      } catch (error) {
        toast.error('Ошибка загрузки корзины');
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
          items: state.items.map(item => 
            item.id === id ? { ...item, disabled: true } : item
          ),
          updatingItems: { ...state.updatingItems, [id]: true }
        }));
        
        await Api.cart.removeCartItem(id);
        
        set((state) => ({
          items: state.items.filter(item => item.id !== id),
          updatingItems: { ...state.updatingItems, [id]: false }
        }));
      } catch (error) {
        set((state) => ({
          updatingItems: { ...state.updatingItems, [id]: false },
          items: state.items.map(item => 
            item.id === id ? { ...item, disabled: false } : item
          )
        }));
        throw error;
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