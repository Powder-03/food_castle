import React from 'react'
import { Order, OrderItem, PaymentStatus } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatTimeAgo } from '@/lib/utils'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Table,
  User,
  Trash2,
  Edit3,
  CreditCard,
} from 'lucide-react'

interface OrderCardProps {
  order: Order
  onComplete: (orderId: number) => void
  onCancel: (orderId: number) => void
  onEdit?: (order: Order) => void
  onTogglePaymentStatus?: (orderId: number, nextStatus: PaymentStatus) => void
  onSoftDelete?: (orderId: number) => void
  isLoading?: boolean
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onComplete,
  onCancel,
  onEdit,
  onTogglePaymentStatus,
  onSoftDelete,
  isLoading = false,
}) => {
  // Urgency indicator based on elapsed time (minutes)
  const createdDate = new Date(order.created_at)
  const elapsedMin = Math.floor((new Date().getTime() - createdDate.getTime()) / 60000)

  let urgencyBorder = 'border-stone-200/80'
  if (elapsedMin >= 20) {
    urgencyBorder = 'border-rose-400 bg-rose-50/20'
  } else if (elapsedMin >= 10) {
    urgencyBorder = 'border-amber-400 bg-amber-50/20'
  }

  const isPaid = order.payment_status === 'PAID'

  return (
    <Card className={`space-y-4 border-2 ${urgencyBorder} transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-stone-100 pb-3 gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl font-extrabold text-stone-900">
              #{order.id}
            </span>
            <Badge variant={order.order_type === 'DINE_IN' ? 'blue' : 'amber'}>
              {order.order_type}
            </Badge>

            {/* Payment Status Badge */}
            {isPaid ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                PAID
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                <Clock className="w-3 h-3 text-amber-600" />
                NOT PAID
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-500 font-medium flex-wrap">
            {order.table_number && (
              <span className="flex items-center gap-1 font-bold text-stone-700">
                <Table className="w-3.5 h-3.5 text-stone-400" />
                {order.table_number}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-stone-400" />
              Admin {order.created_by_admin}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Payment Status Toggle Button */}
          {onTogglePaymentStatus && (
            <button
              type="button"
              onClick={() => onTogglePaymentStatus(order.id, isPaid ? 'UNPAID' : 'PAID')}
              className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                isPaid
                  ? 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-2xs'
              }`}
              title={isPaid ? 'Click to mark UNPAID' : 'Click to mark PAID'}
            >
              <CreditCard className="w-3.5 h-3.5" />
              {isPaid ? 'Mark Unpaid' : 'Mark as Paid'}
            </button>
          )}

          <div className="flex items-center gap-1 text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            {formatTimeAgo(order.created_at)}
          </div>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-2 py-1">
        {order.items.map((item: OrderItem) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm py-1 border-b border-stone-100 last:border-0"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-900 font-extrabold text-xs flex items-center justify-center">
                x{item.quantity}
              </span>
              <span className="font-bold text-stone-800">
                {item.menu_item?.name || `Item #${item.menu_item_id}`}
              </span>
              {item.portion_size !== 'SINGLE' && (
                <Badge variant="stone" size="sm">
                  {item.portion_size}
                </Badge>
              )}
            </div>
            <span className="font-semibold text-stone-600 text-xs">
              {formatCurrency(item.unit_price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer Total & Action Buttons */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
        <div>
          <p className="text-[10px] uppercase font-bold text-stone-400">Total</p>
          <p className="text-lg font-extrabold text-stone-900">
            {formatCurrency(order.total_amount)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Edit Order Button */}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(order)}
              disabled={isLoading}
              className="border-stone-300 hover:bg-stone-100 font-extrabold text-xs text-stone-700 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              Edit Order
            </Button>
          )}

          {onSoftDelete ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onSoftDelete(order.id)}
              disabled={isLoading}
              className="font-extrabold text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Refund & Delete
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancel(order.id)}
              disabled={isLoading}
              className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => onComplete(order.id)}
            isLoading={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 font-bold"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete
          </Button>
        </div>
      </div>
    </Card>
  )
}

