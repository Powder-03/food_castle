import React, { useState } from 'react'
import { useCartStore } from '@/stores/cart-store'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface OrderCartProps {
  onOrderSuccess?: (orderId: number) => void
}

export const OrderCart: React.FC<OrderCartProps> = ({ onOrderSuccess }) => {
  const {
    items,
    orderType,
    tableNumber,
    setOrderType,
    setTableNumber,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalAmount,
  } = useCartStore()

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePlaceOrder = async () => {
    if (items.length === 0) return

    if (orderType === 'DINE_IN' && !tableNumber.trim()) {
      toast.error('Please enter table number for Dine-In orders.')
      return
    }

    const payload = {
      order_type: orderType,
      table_number: orderType === 'DINE_IN' ? tableNumber.trim() : null,
      items: items.map((line) => ({
        menu_item_id: line.menuItem.id,
        portion_size: line.portionSize,
        quantity: line.quantity,
      })),
    }

    try {
      setIsSubmitting(true)
      const res = await api.post('/api/v1/orders', payload)
      toast.success(`Order #${res.data.id} placed successfully!`)
      clearCart()
      if (onOrderSuccess) {
        onOrderSuccess(res.data.id)
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.detail || 'Failed to place order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = getTotalAmount()

  return (
    <Card className="flex flex-col h-full justify-between space-y-4">
      {/* Header & Order Type Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <h4 className="font-extrabold text-stone-900 text-base">Current Order</h4>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-500 hover:text-rose-700 hover:underline"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Dine-In vs Takeaway Pills */}
        <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setOrderType('DINE_IN')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              orderType === 'DINE_IN'
                ? 'bg-white text-amber-600 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Dine-In
          </button>
          <button
            type="button"
            onClick={() => setOrderType('TAKEAWAY')}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              orderType === 'TAKEAWAY'
                ? 'bg-white text-amber-600 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Takeaway
          </button>
        </div>

        {orderType === 'DINE_IN' && (
          <Input
            placeholder="e.g. Table 4"
            label="Table Number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          />
        )}
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[360px] pr-1">
        {items.length === 0 ? (
          <div className="py-12 text-center text-stone-400 space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto stroke-1" />
            <p className="text-xs font-medium">Cart is empty. Tap items to add.</p>
          </div>
        ) : (
          items.map((line) => (
            <div
              key={`${line.menuItem.id}-${line.portionSize}`}
              className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200/80 rounded-xl"
            >
              <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                <p className="font-bold text-stone-900 text-xs truncate">
                  {line.menuItem.name}
                </p>
                <div className="flex items-center gap-1.5">
                  <Badge variant="amber" size="sm">
                    {line.portionSize}
                  </Badge>
                  <span className="text-[11px] font-semibold text-stone-500">
                    {formatCurrency(line.unitPrice)}
                  </span>
                </div>
              </div>

              {/* Quantity Stepper & Line Price */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(line.menuItem.id, line.portionSize, -1)}
                    className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-extrabold text-stone-900">
                    {line.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(line.menuItem.id, line.portionSize, 1)}
                    className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(line.menuItem.id, line.portionSize)}
                  className="p-1 text-stone-400 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Total & Place Order Button */}
      <div className="pt-3 border-t border-stone-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">
            Total Payable
          </span>
          <span className="text-xl font-extrabold text-stone-900">
            {formatCurrency(total)}
          </span>
        </div>

        <Button
          onClick={handlePlaceOrder}
          disabled={items.length === 0}
          isLoading={isSubmitting}
          className="w-full text-base py-3 font-bold"
        >
          Place Order ({formatCurrency(total)})
        </Button>
      </div>
    </Card>
  )
}
