import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: number
  skuId: number
  name: string
  price: number
  quantity: number
  imageUrl?: string
  attributes?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (skuId: number) => void
  updateQuantity: (skuId: number, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.skuId === item.skuId)
          
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.skuId === item.skuId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          
          return {
            items: [...state.items, { ...item, quantity: 1 }],
          }
        })
      },
      
      removeItem: (skuId) => {
        set((state) => ({
          items: state.items.filter((i) => i.skuId !== skuId),
        }))
      },
      
      updateQuantity: (skuId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(skuId)
          return
        }
        
        set((state) => ({
          items: state.items.map((i) =>
            i.skuId === skuId ? { ...i, quantity } : i
          ),
        }))
      },
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },
      
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'cart-storage',
      skipHydration: true,
    }
  )
)