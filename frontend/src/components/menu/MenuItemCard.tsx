import React from 'react'
import { MenuItem } from '@/lib/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { Edit2, Trash2 } from 'lucide-react'

interface MenuItemCardProps {
  item: MenuItem
  onEdit: (item: MenuItem) => void
  onDelete?: (item: MenuItem) => void
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onEdit, onDelete }) => {
  return (
    <Card hoverEffect className="relative flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-bold text-stone-900 text-base leading-tight">
            {item.name}
          </h4>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
              title="Edit Item"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(item)}
                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                title="Delete Item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <Badge variant="stone" size="sm">
            {item.category}
          </Badge>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
              item.is_available ? 'text-emerald-600' : 'text-rose-500'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                item.is_available ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            {item.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
        <span className="text-xs text-stone-400 font-medium">Pricing</span>
        <div className="text-right">
          {!item.has_variants ? (
            <span className="text-base font-extrabold text-stone-900">
              {formatCurrency(item.price_single)}
            </span>
          ) : (
            <div className="text-xs font-bold text-stone-800 space-x-1.5">
              {item.price_half != null && (
                <span>Half: {formatCurrency(item.price_half)}</span>
              )}
              {item.price_full != null && (
                <span>Full: {formatCurrency(item.price_full)}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
