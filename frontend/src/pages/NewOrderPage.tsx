import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MenuItem, PortionSize } from '@/lib/types'
import { MenuSelector } from '@/components/order/MenuSelector'
import { OrderCart } from '@/components/order/OrderCart'
import { useCartStore } from '@/stores/cart-store'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatCurrency } from '@/lib/utils'
import { ShoppingBag, Utensils } from 'lucide-react'
import api from '@/lib/api'

export const NewOrderPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'menu' | 'cart'>('menu')
  
  const { addItem, items: cartItems, getTotalAmount } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAvailableMenu = async () => {
      try {
        setIsLoading(true)
        const res = await api.get('/api/v1/menu', {
          params: { is_available: true },
        })
        setItems(res.data)
      } catch (err) {
        console.error('Failed to load menu for POS', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAvailableMenu()
  }, [])

  const handleAddItem = (item: MenuItem, portion: PortionSize) => {
    addItem(item, portion)
  }

  const handleOrderSuccess = (orderId: number) => {
    navigate('/orders/queue')
  }

  const cartTotal = getTotalAmount()
  const cartItemCount = cartItems.reduce((acc, i) => acc + i.quantity, 0)

  return (
    <div className="space-y-4 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
            New Order (POS)
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Touch-optimized ticket creation
          </p>
        </div>

        {/* Mobile / iPad View Switcher */}
        <div className="flex lg:hidden bg-stone-200/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'menu'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            Menu
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'cart'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-stone-600'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Cart ({cartItemCount})
          </button>
        </div>
      </div>

      {/* Grid Layout: Side-by-side on iPad/Desktop (lg:grid), Tabbed on small screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Menu Panel */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            activeTab === 'menu' ? 'block' : 'hidden lg:block'
          }`}
        >
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
              </div>
            </div>
          ) : (
            <MenuSelector items={items} onAddItem={handleAddItem} />
          )}
        </div>

        {/* Cart Panel */}
        <div
          className={`lg:col-span-5 lg:sticky lg:top-6 ${
            activeTab === 'cart' ? 'block' : 'hidden lg:block'
          }`}
        >
          <OrderCart onOrderSuccess={handleOrderSuccess} />
        </div>
      </div>

      {/* Floating Mobile Cart Bar when on Menu Tab with items in cart */}
      {cartItemCount > 0 && activeTab === 'menu' && (
        <div className="lg:hidden fixed bottom-16 left-4 right-4 z-30">
          <button
            onClick={() => setActiveTab('cart')}
            className="w-full bg-stone-900 text-white p-3.5 rounded-2xl shadow-xl border border-stone-800 flex items-center justify-between animate-slide-up"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center">
                {cartItemCount}
              </span>
              <span className="text-xs font-bold">View Cart</span>
            </div>
            <span className="text-sm font-extrabold text-amber-400">
              {formatCurrency(cartTotal)} →
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
