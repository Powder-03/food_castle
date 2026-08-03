import React, { useState } from 'react'
import { MenuItem, PortionSize } from '@/lib/types'
import { DEFAULT_CATEGORIES } from '@/components/menu/MenuItemModal'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { Search, Plus, ShoppingCart } from 'lucide-react'
import { PortionPicker } from './PortionPicker'
import { useCartStore } from '@/stores/cart-store'

interface MenuSelectorProps {
  items: MenuItem[]
  onAddItem: (item: MenuItem, portion: PortionSize) => void
}

export const MenuSelector: React.FC<MenuSelectorProps> = ({ items, onAddItem }) => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [itemForPortionPicker, setItemForPortionPicker] = useState<MenuItem | null>(null)

  const cartItems = useCartStore((state) => state.items)

  // Dynamically combine default categories with any custom item categories present in items
  const itemCategories = items.map((i) => i.category)
  const dynamicCategories = ['All', ...Array.from(new Set([...DEFAULT_CATEGORIES, ...itemCategories]))]

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCat && item.is_available
  })

  const getItemCartQty = (itemId: number) => {
    return cartItems
      .filter((line) => line.menuItem.id === itemId)
      .reduce((sum, line) => sum + line.quantity, 0)
  }

  const handleCardClick = (item: MenuItem) => {
    if (item.has_variants) {
      setItemForPortionPicker(item)
    } else {
      onAddItem(item, 'SINGLE')
    }
  }

  return (
    <div className="space-y-3">
      {/* Sticky Top Controls: Search Bar & Category Filters */}
      <div className="sticky top-0 z-10 bg-stone-50/95 backdrop-blur-md pt-1 pb-3 space-y-3 border-b border-stone-200/60">
        <Input
          placeholder="Search menu items (e.g. Chowmein, Burger)..."
          icon={<Search className="w-4 h-4 text-stone-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white shadow-xs"
        />

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 shadow-sm shadow-amber-500/30 ring-2 ring-amber-400/50'
                  : 'bg-white border border-stone-200/80 text-stone-700 hover:bg-stone-100 hover:border-stone-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid inside a fixed scrollable viewport */}
      <div className="max-h-[calc(100vh-240px)] min-h-[350px] overflow-y-auto pr-1 sm:pr-2 space-y-4 pb-12">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-stone-400 space-y-2">
            <p className="text-sm font-bold">No menu items match your search.</p>
            <p className="text-xs">Try selecting another category or clear your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const cartQty = getItemCartQty(item.id)
              return (
                <Card
                  key={item.id}
                  onClick={() => handleCardClick(item)}
                  className={`cursor-pointer hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between p-3 space-y-2 group active:scale-[0.98] relative ${
                    cartQty > 0 ? 'ring-2 ring-amber-400/80 bg-amber-50/20' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h5 className="font-bold text-stone-900 text-sm group-hover:text-amber-600 transition-colors line-clamp-2 leading-tight">
                        {item.name}
                      </h5>
                      {cartQty > 0 && (
                        <span className="shrink-0 bg-emerald-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                          <ShoppingCart className="w-2.5 h-2.5" />
                          {cartQty}
                        </span>
                      )}
                    </div>
                    <Badge variant="stone" size="sm" className="mt-1.5 text-[10px]">
                      {item.category}
                    </Badge>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                    <div className="font-extrabold text-xs text-stone-900">
                      {!item.has_variants ? (
                        formatCurrency(item.price_single)
                      ) : (
                        <span className="text-[10px] text-amber-700 font-bold block">
                          Half/Full
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCardClick(item)
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-xs active:scale-95 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ADD
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Portion Picker Dialog */}
      <PortionPicker
        isOpen={!!itemForPortionPicker}
        onClose={() => setItemForPortionPicker(null)}
        item={itemForPortionPicker}
        onSelectPortion={onAddItem}
      />
    </div>
  )
}

