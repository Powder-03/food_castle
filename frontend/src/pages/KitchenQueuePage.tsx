import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Order, PaymentStatus } from '@/lib/types'
import { OrderCard } from '@/components/kitchen/OrderCard'
import { EditOrderModal } from '@/components/kitchen/EditOrderModal'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChefHat, RefreshCw } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export const KitchenQueuePage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  const outletContext = useOutletContext<{ setPendingCount?: (cnt: number) => void }>()

  const fetchActiveOrders = async (showSpinner = false) => {
    try {
      if (showSpinner) setIsRefreshing(true)
      const res = await api.get('/api/v1/orders/active')
      if (Array.isArray(res.data)) {
        setOrders(res.data)
        if (outletContext?.setPendingCount) {
          outletContext.setPendingCount(res.data.length)
        }
      }
    } catch (err) {
      console.error('Failed to fetch active queue', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchActiveOrders(false)
    const interval = setInterval(() => fetchActiveOrders(true), 10000)
    return () => clearInterval(interval)
  }, [])

  const handleComplete = async (orderId: number) => {
    try {
      setUpdatingId(orderId)
      await api.patch(`/api/v1/orders/${orderId}/status`, {
        status: 'COMPLETED',
      })
      toast.success(`Order #${orderId} marked as COMPLETED & PAID!`)
      fetchActiveOrders()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.detail || 'Failed to complete order.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleCancel = async (orderId: number) => {
    try {
      setUpdatingId(orderId)
      await api.patch(`/api/v1/orders/${orderId}/status`, {
        status: 'CANCELLED',
      })
      toast.success(`Order #${orderId} CANCELLED.`)
      fetchActiveOrders()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.detail || 'Failed to cancel order.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleTogglePaymentStatus = async (orderId: number, nextStatus: PaymentStatus) => {
    try {
      setUpdatingId(orderId)
      const res = await api.patch(`/api/v1/orders/${orderId}/status`, {
        payment_status: nextStatus,
      })
      toast.success(`Order #${orderId} marked as ${nextStatus}!`)
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data : o)))
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.detail || 'Failed to update payment status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSoftDelete = async (orderId: number) => {
    if (!window.confirm(`Refund and soft-delete order #${orderId}?`)) return
    try {
      setUpdatingId(orderId)
      await api.delete(`/api/v1/orders/${orderId}`)
      toast.success(`Order #${orderId} refunded & soft-deleted!`)
      fetchActiveOrders()
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.detail || 'Failed to refund order.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleOrderUpdated = (updatedOrder: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)))
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Kitchen Queue
          </h2>
          <span className="px-3 py-1 text-xs font-black bg-amber-500 text-white rounded-full">
            {orders.length} Active
          </span>
        </div>

        <button
          onClick={() => fetchActiveOrders(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ChefHat className="w-8 h-8" />}
          title="Kitchen Queue Clear! 🎉"
          description="All pending orders have been completed or cancelled."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onComplete={handleComplete}
              onCancel={handleCancel}
              onEdit={(o) => setEditingOrder(o)}
              onTogglePaymentStatus={handleTogglePaymentStatus}
              onSoftDelete={handleSoftDelete}
              isLoading={updatingId === order.id}
            />
          ))}
        </div>
      )}

      {/* Edit Order Modal */}
      <EditOrderModal
        isOpen={!!editingOrder}
        order={editingOrder}
        onClose={() => setEditingOrder(null)}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  )
}
