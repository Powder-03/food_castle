import React, { useEffect, useState } from 'react'
import { Order, OrderItem } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, History, RefreshCcw, Table, User, Clock, AlertTriangle, Trash2, RotateCcw } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Soft Delete / Refund Modal state
  const [orderToRefund, setOrderToRefund] = useState<Order | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      const params: Record<string, any> = {}
      if (search.trim()) params.search = search.trim()
      if (statusFilter) params.status = statusFilter
      if (includeDeleted) params.include_deleted = true

      const res = await api.get('/api/v1/orders/history', { params })
      setOrders(res.data)
    } catch (err) {
      console.error('Failed to fetch order history', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [statusFilter, includeDeleted])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchHistory()
  }

  const handleConfirmRefund = async () => {
    if (!orderToRefund) return

    try {
      setIsDeleting(true)
      await api.delete(`/api/v1/orders/${orderToRefund.id}`)
      toast.success(`Order #${orderToRefund.id} refunded and soft-deleted!`)
      setOrderToRefund(null)
      fetchHistory()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.detail || 'Failed to refund order.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Order History & Refunds
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Search past tickets, review items, and issue refunds
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchHistory()}
          className="self-start sm:self-auto"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 space-y-3">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="w-full sm:flex-1">
            <Input
              placeholder="Search by Order #, Table #, or Admin name..."
              icon={<Search className="w-4 h-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-56">
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>

          <Button type="submit" size="md" className="w-full sm:w-auto">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-600 select-none">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => setIncludeDeleted(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
            Show Refunded / Soft-Deleted Orders
          </label>
        </div>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<History className="w-8 h-8" />}
          title="No orders found"
          description="Try modifying your search term or status filter."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isRefundedOrDeleted = order.is_deleted

            return (
              <Card
                key={order.id}
                className={`space-y-3 transition-all ${
                  isRefundedOrDeleted
                    ? 'bg-stone-100/60 border-stone-300 opacity-75'
                    : ''
                }`}
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-lg font-extrabold text-stone-900">
                      #{order.id}
                    </span>
                    <Badge
                      variant={order.order_type === 'DINE_IN' ? 'blue' : 'amber'}
                    >
                      {order.order_type}
                    </Badge>

                    {isRefundedOrDeleted ? (
                      <Badge variant="rose">REFUNDED / DELETED</Badge>
                    ) : order.status === 'COMPLETED' ? (
                      <Badge variant="emerald">COMPLETED</Badge>
                    ) : order.status === 'CANCELLED' ? (
                      <Badge variant="stone">CANCELLED</Badge>
                    ) : (
                      <Badge variant="amber">PENDING</Badge>
                    )}

                    {/* Payment Status Badge */}
                    {order.payment_status === 'PAID' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                        NOT PAID
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
                    {order.table_number && (
                      <span className="flex items-center gap-1">
                        <Table className="w-3.5 h-3.5 text-stone-400" />
                        {order.table_number}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-stone-400" />
                      Admin {order.created_by_admin}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  {!isRefundedOrDeleted && (
                    <button
                      type="button"
                      onClick={() => setOrderToRefund(order)}
                      className="px-2.5 py-1 text-xs font-extrabold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-lg flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ml-auto sm:ml-0"
                      title="Refund & Soft Delete Order"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Refund & Delete</span>
                    </button>
                  )}
                </div>

                {/* Items Breakdown */}
                <div className="space-y-1 py-1">
                  {order.items.map((item: OrderItem) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-0.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-800">
                          x{item.quantity}
                        </span>
                        <span className="font-medium text-stone-700">
                          {item.menu_item?.name || `Item #${item.menu_item_id}`}
                        </span>
                        {item.portion_size !== 'SINGLE' && (
                          <Badge variant="stone" size="sm">
                            {item.portion_size}
                          </Badge>
                        )}
                      </div>
                      <span className="font-semibold text-stone-600">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Bar */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-stone-400">
                      Total Amount
                    </p>
                    <p
                      className={`text-lg font-extrabold ${
                        isRefundedOrDeleted
                          ? 'line-through text-stone-400'
                          : 'text-stone-900'
                      }`}
                    >
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>

                  {!isRefundedOrDeleted && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setOrderToRefund(order)}
                      className="shrink-0 font-extrabold text-xs py-2 px-3 flex items-center gap-1.5 shadow-sm shadow-rose-500/20"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Refund & Soft Delete
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Confirmation Modal for Refund */}
      <Modal
        isOpen={!!orderToRefund}
        onClose={() => setOrderToRefund(null)}
        title={`Confirm Refund - Order #${orderToRefund?.id}`}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-rose-900">
                Are you sure you want to refund this order?
              </p>
              <p>
                Order #{orderToRefund?.id} totaling{' '}
                <strong>{formatCurrency(orderToRefund?.total_amount)}</strong> will
                be soft-deleted. It will be marked as REFUNDED and deducted from
                your daily sales analytics revenue!
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setOrderToRefund(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isDeleting}
              onClick={handleConfirmRefund}
            >
              Yes, Refund Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
