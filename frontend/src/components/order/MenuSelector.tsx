import React, { useState } from 'react'
import { MenuItem, PortionSize } from '@/lib/types'
import { DEFAULT_CATEGORIES } from '@/components/menu/MenuItemModal'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { Search, Plus } from 'lucide-react'
import { PortionPicker } from './PortionPicker'

interface MenuSelectorProps {
  items: MenuItem[]
  onAddItem: (item: MenuItem, portion: PortionSize) => void
}

export const MenuSelector: React.FC<MenuSelectorProps> = ({ items, onAddItem }) => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [itemForPortionPicker, setItemForPortionPicker] = useState<MenuItem | null>(null)

  // Dynamically combine default categories with any custom item categories present in items
  const itemCategories = items.map((i) => i.category)
  const dynamicCategories = ['All', ...Array.from(new Set([...DEFAULT_CATEGORIES, ...itemCategories]))]

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCat && item.is_available
  })

  const handleCardClick = (item: MenuItem) => {
    if (item.has_variants) {
      setItemForPortionPicker(item)
    } else {
      onAddItem(item, 'SINGLE')
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Input
        placeholder="Search menu items..."
        icon={<Search className="w-4 h-4" />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {dynamicCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            onClick={() => handleCardClick(item)}
            className="cursor-pointer hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between p-3.5 space-y-2 group active:scale-[0.98]"
          >
            <div>
              <div className="flex items-start justify-between gap-1">
                <h5 className="font-bold text-stone-900 text-sm group-hover:text-amber-600 transition-colors line-clamp-1">
                  {item.name}
                </h5>
                <div className="p-1 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
              <Badge variant="stone" size="sm" className="mt-1">
                {item.category}
              </Badge>
            </div>

            <div className="pt-2 border-t border-stone-100 font-extrabold text-xs text-stone-800">
              {!item.has_variants ? (
                formatCurrency(item.price_single)
              ) : (
                <span className="text-[11px] text-amber-700">
                  Variants Available
                </span>
              )}
            </div>
          </Card>
        ))}
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
