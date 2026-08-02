import { create } from 'zustand'
import { MenuItem, OrderType, PortionSize } from '@/lib/types'

export interface CartLineItem {
  menuItem: MenuItem
  portionSize: PortionSize
  quantity: number
  unitPrice: number
}

interface CartState {
  items: CartLineItem[]
  orderType: OrderType
  tableNumber: string
  addItem: (item: MenuItem, portionSize: PortionSize) => void
  removeItem: (menuItemId: number, portionSize: PortionSize) => void
  updateQuantity: (menuItemId: number, portionSize: PortionSize, delta: number) => void
  setOrderType: (type: OrderType) => void
  setTableNumber: (table: string) => void
  clearCart: () => void
  getTotalAmount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  orderType: 'DINE_IN',
  tableNumber: '',

  addItem: (item: MenuItem, portionSize: PortionSize) => {
    // Resolve price
    let unitPrice = 0
    if (portionSize === 'SINGLE') unitPrice = item.price_single || 0
    else if (portionSize === 'HALF') unitPrice = item.price_half || 0
    else if (portionSize === 'FULL') unitPrice = item.price_full || 0

    const currentItems = get().items
    const existingIndex = currentItems.findIndex(
      (line) => line.menuItem.id === item.id && line.portionSize === portionSize
    )

    if (existingIndex > -1) {
      const updated = [...currentItems]
      updated[existingIndex].quantity += 1
      set({ items: updated })
    } else {
      set({
        items: [...currentItems, { menuItem: item, portionSize, quantity: 1, unitPrice }],
      })
    }
  },

  removeItem: (menuItemId: number, portionSize: PortionSize) => {
    set({
      items: get().items.filter(
        (line) => !(line.menuItem.id === menuItemId && line.portionSize === portionSize)
      ),
    })
  },

  updateQuantity: (menuItemId: number, portionSize: PortionSize, delta: number) => {
    const currentItems = get().items
    const updated = currentItems
      .map((line) => {
        if (line.menuItem.id === menuItemId && line.portionSize === portionSize) {
          const newQty = line.quantity + delta
          return newQty > 0 ? { ...line, quantity: newQty } : null
        }
        return line
      })
      .filter(Boolean) as CartLineItem[]

    set({ items: updated })
  },

  setOrderType: (type: OrderType) => set({ orderType: type }),
  setTableNumber: (table: string) => set({ tableNumber: table }),
  clearCart: () => set({ items: [], tableNumber: '' }),

  getTotalAmount: () => {
    return get().items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  },
}))
