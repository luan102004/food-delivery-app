// src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  
  // Actions
  addItem: (item: CartItem, restaurantId: string, restaurantName: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Computed
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: null,

      addItem: (item, restaurantId, restaurantName) => {
        const state = get();
        
        // If adding from different restaurant, clear cart
        if (state.restaurantId && state.restaurantId !== restaurantId) {
          const confirm = window.confirm(
            `Bạn có món từ ${state.restaurantName}. Xóa giỏ hàng và thêm món từ ${restaurantName}?`
          );
          if (!confirm) return;
          
          set({
            items: [item],
            restaurantId,
            restaurantName,
          });
          return;
        }

        // Check if item already exists
        const existingItem = state.items.find(i => i.menuItemId === item.menuItemId);
        
        if (existingItem) {
          set({
            items: state.items.map(i =>
              i.menuItemId === item.menuItemId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({
            items: [...state.items, item],
            restaurantId,
            restaurantName,
          });
        }
      },

      removeItem: (menuItemId) => {
        const state = get();
        const newItems = state.items.filter(i => i.menuItemId !== menuItemId);
        
        set({
          items: newItems,
          restaurantId: newItems.length === 0 ? null : state.restaurantId,
          restaurantName: newItems.length === 0 ? null : state.restaurantName,
        });
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }

        set({
          items: get().items.map(i =>
            i.menuItemId === menuItemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => {
        set({
          items: [],
          restaurantId: null,
          restaurantName: null,
        });
      },

      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);