import React, { useState, useEffect } from 'react'
import { MenuItem, Order, OrderType, PaymentStatus, PortionSize } from '@/lib/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import {
  Minus,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  PlusCircle,
  Search,
  Utensils,
  AlertCircle,
} from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface EditOrderItemState {
  menu_item_id: number
  menu_item_name: string
  portion_size: PortionSize
  quantity: number
  unit_price: number
}

interface EditOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order | null
  onOrderUpdated: (updatedOrder: Order) => void
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onOrderUpdated,
}) => {
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN')
  const [tableNumber, setTableNumber] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('UNPAID')
  const [items, setItems] = useState<EditOrderItemState[]>([])

  // Menu catalog for adding new items
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoadingMenu, setIsLoadingMenu] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [showAddPanel, setShowAddPanel] = useState(false)
  const [selectedPortions, setSelectedPortions] = useState<Record<number, PortionSize>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch available menu items when modal is open
  useEffect(() => {
    if (isOpen) {
      const fetchMenu = async () => {
        try {
          setIsLoadingMenu(true)
          const res = await api.get('/api/v1/menu', {
            params: { is_available: true },
          })
          setMenuItems(res.data)
        } catch (err) {
          console.error('Failed to load menu for editing', err)
        } finally {
          setIsLoadingMenu(false)
        }
      }
      fetchMenu()
    }
  }, [isOpen])

  // Initialize form state when order changes
  useEffect(() => {
    if (order) {
      setOrderType(order.order_type)
      setTableNumber(order.table_number || '')
      setPaymentStatus(order.payment_status)
      setItems(
        order.items.map((item) => ({
          menu_item_id: item.menu_item_id,
          menu_item_name: item.menu_item?.name || `Item #${item.menu_item_id}`,
          portion_size: item.portion_size,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
        }))
      )
      setShowAddPanel(false)
      setSearchTerm('')
    }
  }, [order, isOpen])

  if (!order) return null

  const handleUpdateQuantity = (index: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item, idx) => {
          if (idx === index) {
            const newQty = item.quantity + delta
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean) as EditOrderItemState[]
    )
  }

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleAddItemFromMenu = (menuItem: MenuItem, portion: PortionSize) => {
    let unitPrice = 0
    if (portion === 'SINGLE') unitPrice = menuItem.price_single || 0
    else if (portion === 'HALF') unitPrice = menuItem.price_half || 0
    else if (portion === 'FULL') unitPrice = menuItem.price_full || 0

    const existingIdx = items.findIndex(
      (i) => i.menu_item_id === menuItem.id && i.portion_size === portion
    )

    if (existingIdx > -1) {
      handleUpdateQuantity(existingIdx, 1)
    } else {
      setItems((prev) => [
        ...prev,
        {
          menu_item_id: menuItem.id,
          menu_item_name: menuItem.name,
          portion_size: portion,
          quantity: 1,
          unit_price: unitPrice,
        },
      ])
    }
    toast.success(`Added ${menuItem.name} (${portion})`)
  }

  const categories = ['ALL', ...Array.from(new Set(menuItems.map((m) => m.category)))]

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    return matchesCategory && matchesSearch
  })

  const calculatedTotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)

  const handleSaveChanges = async () => {
    if (items.length === 0) {
      toast.error('Order must have at least one item.')
      return
    }

    if (orderType === 'DINE_IN' && !tableNumber.trim()) {
      toast.error('Please specify table number for Dine-In orders.')
      return
    }

    const payload = {
      order_type: orderType,
      table_number: orderType === 'DINE_IN' ? tableNumber.trim() : null,
      payment_status: paymentStatus,
      items: items.map((i) => ({
        menu_item_id: i.menu_item_id,
        portion_size: i.portion_size,
        quantity: i.quantity,
      })),
    }

    try {
      setIsSubmitting(true)
      const res = await api.put(`/api/v1/orders/${order.id}`, payload)
      toast.success(`Order #${order.id} updated successfully!`)
      onOrderUpdated(res.data)
      onClose()
    } catch (err: any) {
      console.error('Order update error:', err)
      const detail = err.response?.data?.detail
      let errorMsg = 'Failed to update order.'
      if (typeof detail === 'string') {
        errorMsg = detail
      } else if (Array.isArray(detail)) {
        errorMsg = detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
      } else if (detail && typeof detail === 'object') {
        errorMsg = detail.message || JSON.stringify(detail)
      } else if (err.message) {
        errorMsg = err.message
      }
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Order #${order.id} (Kitchen Active)`}
    >
      <div className="space-y-5">
        {/* Order Details: Type, Table & Payment Status */}
        <div className="p-4 bg-stone-50 border border-stone-200/80 rounded-2xl space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrderType('DINE_IN')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                orderType === 'DINE_IN'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Dine-In
            </button>
            <button
              type="button"
              onClick={() => setOrderType('TAKEAWAY')}
              className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                orderType === 'TAKEAWAY'
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Takeaway
            </button>
          </div>

          {orderType === 'DINE_IN' && (
            <Input
              label="Table Number"
              placeholder="e.g. Table 4"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
          )}

          {/* Payment Status Segmented Control */}
          <div className="space-y-1 pt-1">
            <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider block">
              Payment Status
            </label>
            <div className="grid grid-cols-2 gap-2 bg-stone-200/60 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPaymentStatus('PAID')}
                className={`py-2 px-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  paymentStatus === 'PAID'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                PAID
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('UNPAID')}
                className={`py-2 px-2 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  paymentStatus === 'UNPAID'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                NOT PAID (UNPAID)
              </button>
            </div>
          </div>
        </div>

        {/* Current Items List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-stone-700 uppercase tracking-wider">
              Order Items ({items.length})
            </h4>
            <button
              type="button"
              onClick={() => setShowAddPanel(!showAddPanel)}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {showAddPanel ? 'Close Menu' : '+ Add More Items'}
            </button>
          </div>

          {items.length === 0 ? (
            <div className="p-6 text-center text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
              <AlertCircle className="w-6 h-6 mx-auto mb-1 text-rose-400" />
              <p className="text-xs font-semibold text-rose-600">
                No items in order. Please add at least one item.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={`${item.menu_item_id}-${item.portion_size}-${idx}`}
                  className="flex items-center justify-between p-2.5 bg-white border border-stone-200 rounded-xl shadow-2xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-bold text-stone-900 text-xs truncate">
                      {item.menu_item_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="amber" size="sm">
                        {item.portion_size}
                      </Badge>
                      <span className="text-[11px] font-semibold text-stone-500">
                        {formatCurrency(item.unit_price)} each
                      </span>
                    </div>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(idx, -1)}
                        className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-extrabold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(idx, 1)}
                        className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200 rounded"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="w-16 text-right font-extrabold text-xs text-stone-900">
                      {formatCurrency(item.unit_price * item.quantity)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Items Collapsible Panel */}
        {showAddPanel && (
          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3 animate-slide-up">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-900 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5" />
                Select Menu Item to Add
              </span>
            </div>

            {/* Search & Category Filter */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Search item..."
                  icon={<Search className="w-3.5 h-3.5" />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-stone-200 rounded-xl px-2.5 text-xs font-bold text-stone-700 outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Menu Items List */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {isLoadingMenu ? (
                <p className="text-xs text-stone-500 py-4 text-center">Loading menu...</p>
              ) : filteredMenuItems.length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center">No menu items found.</p>
              ) : (
                filteredMenuItems.map((m) => {
                  const currentPortion = selectedPortions[m.id] || (m.has_variants ? 'HALF' : 'SINGLE')

                  return (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-2 bg-white rounded-xl border border-amber-100 shadow-2xs gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-900 truncate">{m.name}</p>
                        <p className="text-[10px] text-stone-500">{m.category}</p>
                      </div>

                      {/* Portion Picker if variants */}
                      {m.has_variants && (
                        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-[10px] font-extrabold">
                          {m.price_half !== null && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPortions((p) => ({ ...p, [m.id]: 'HALF' }))
                              }
                              className={`px-1.5 py-0.5 rounded ${
                                currentPortion === 'HALF'
                                  ? 'bg-amber-500 text-white'
                                  : 'text-stone-600'
                              }`}
                            >
                              Half ({formatCurrency(m.price_half)})
                            </button>
                          )}
                          {m.price_full !== null && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPortions((p) => ({ ...p, [m.id]: 'FULL' }))
                              }
                              className={`px-1.5 py-0.5 rounded ${
                                currentPortion === 'FULL'
                                  ? 'bg-amber-500 text-white'
                                  : 'text-stone-600'
                              }`}
                            >
                              Full ({formatCurrency(m.price_full)})
                            </button>
                          )}
                        </div>
                      )}

                      {!m.has_variants && (
                        <span className="text-xs font-bold text-stone-700">
                          {formatCurrency(m.price_single || 0)}
                        </span>
                      )}

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAddItemFromMenu(m, currentPortion)}
                        className="py-1 px-2.5 text-xs font-extrabold shrink-0"
                      >
                        + Add
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Footer Total & Actions */}
        <div className="pt-3 border-t border-stone-200 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase font-bold text-stone-400">Updated Total</p>
            <p className="text-xl font-black text-stone-900">
              {formatCurrency(calculatedTotal)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveChanges}
              isLoading={isSubmitting}
              disabled={items.length === 0}
              className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold"
            >
              Save Order Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
