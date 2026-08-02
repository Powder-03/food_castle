import React from 'react'
import { Order } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatTimeAgo } from '@/lib/utils'
import { CheckCircle2, XCircle, Clock, Table, User } from 'lucide-react'

interface OrderCardProps {
  order: Order
  onComplete: (orderId: number) => void
  onCancel: (orderId: number) => void
  isLoading?: boolean
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onComplete,
  onCancel,
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

  return (
    <Card className={`space-y-4 border-2 ${urgencyBorder} transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between border-b border-stone-100 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-stone-900">
              #{order.id}
            </span>
            <Badge variant={order.order_type === 'DINE_IN' ? 'blue' : 'amber'}>
              {order.order_type}
            </Badge>
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
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          {formatTimeAgo(order.created_at)}
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-2 py-1">
        {order.items.map((item) => (
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
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase font-bold text-stone-400">Total</p>
          <p className="text-lg font-extrabold text-stone-900">
            {formatCurrency(order.total_amount)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(order.id)}
            disabled={isLoading}
            className="border-rose-200 text-rose-600 hover:bg-rose-50"
          >
            <XCircle className="w-4 h-4" />
            Cancel
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onComplete(order.id)}
            isLoading={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete
          </Button>
        </div>
      </div>
    </Card>
  )
}
