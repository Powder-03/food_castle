import React, { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { MenuItem } from '@/lib/types'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface MenuItemModalProps {
  isOpen: boolean
  onClose: () => void
  itemToEdit?: MenuItem | null
  onSuccess: () => void
}

export const DEFAULT_CATEGORIES = [
  'Beverages',
  'Burgers',
  'Sandwiches',
  'Maggie',
  'French Fries',
  'Chowmein',
  'Pasta',
  'Fried Rice',
  'Chinese Special',
  'Pizza',
  'Momos',
  'Combo Offers',
]

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  onSuccess,
}) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Beverages')
  const [existingCategories, setExistingCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [hasVariants, setHasVariants] = useState(false)
  const [priceSingle, setPriceSingle] = useState<string>('')
  const [priceHalf, setPriceHalf] = useState<string>('')
  const [priceFull, setPriceFull] = useState<string>('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch distinct categories for suggestions
    const fetchCategories = async () => {
      try {
        const res = await api.get('/api/v1/menu/categories')
        if (Array.isArray(res.data) && res.data.length > 0) {
          const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...res.data]))
          setExistingCategories(merged)
        }
      } catch (err) {
        console.error('Failed to fetch category list', err)
      }
    }
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name)
      setCategory(itemToEdit.category)
      setHasVariants(itemToEdit.has_variants)
      setPriceSingle(itemToEdit.price_single ? String(itemToEdit.price_single) : '')
      setPriceHalf(itemToEdit.price_half ? String(itemToEdit.price_half) : '')
      setPriceFull(itemToEdit.price_full ? String(itemToEdit.price_full) : '')
      setIsAvailable(itemToEdit.is_available)
    } else {
      setName('')
      setCategory('Beverages')
      setHasVariants(false)
      setPriceSingle('')
      setPriceHalf('')
      setPriceFull('')
      setIsAvailable(true)
    }
    setError('')
  }, [itemToEdit, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Item name is required.')
      return
    }

    if (!category.trim()) {
      setError('Category is required.')
      return
    }

    if (!hasVariants && (!priceSingle || Number(priceSingle) <= 0)) {
      setError('Single price item must have a valid positive price.')
      return
    }

    if (hasVariants && (!priceHalf || Number(priceHalf) <= 0) && (!priceFull || Number(priceFull) <= 0)) {
      setError('Variant item must specify at least Half or Full price.')
      return
    }

    const payload = {
      name: name.trim(),
      category: category.trim(),
      has_variants: hasVariants,
      price_single: !hasVariants && priceSingle ? Number(priceSingle) : null,
      price_half: hasVariants && priceHalf ? Number(priceHalf) : null,
      price_full: hasVariants && priceFull ? Number(priceFull) : null,
      is_available: isAvailable,
    }

    try {
      setIsLoading(true)
      if (itemToEdit) {
        await api.patch(`/api/v1/menu/${itemToEdit.id}`, payload)
        toast.success(`Updated '${name}' successfully!`)
      } else {
        await api.post('/api/v1/menu', payload)
        toast.success(`Created '${name}' successfully!`)
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.detail || 'Failed to save menu item.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={itemToEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <Input
          label="Item Name"
          placeholder="e.g., Veg Cheese Burger"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-stone-700 tracking-wide uppercase">
            Category (Select or type custom)
          </label>
          <input
            list="category-suggestions"
            type="text"
            className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
            placeholder="Type or select category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <datalist id="category-suggestions">
            {existingCategories.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>

          {/* Quick Selection Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1.5 max-h-24 overflow-y-auto pr-1">
            {existingCategories.map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                  category.toLowerCase() === cat.toLowerCase()
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl">
          <div>
            <p className="text-xs font-bold text-stone-900">Has Portion Variants?</p>
            <p className="text-[11px] text-stone-500">Enable for Half / Full options</p>
          </div>
          <input
            type="checkbox"
            checked={hasVariants}
            onChange={(e) => setHasVariants(e.target.checked)}
            className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
          />
        </div>

        {!hasVariants ? (
          <Input
            label="Single Price (₹)"
            type="number"
            step="0.01"
            placeholder="150.00"
            value={priceSingle}
            onChange={(e) => setPriceSingle(e.target.value)}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Half Portion Price (₹)"
              type="number"
              step="0.01"
              placeholder="120.00"
              value={priceHalf}
              onChange={(e) => setPriceHalf(e.target.value)}
            />
            <Input
              label="Full Portion Price (₹)"
              type="number"
              step="0.01"
              placeholder="220.00"
              value={priceFull}
              onChange={(e) => setPriceFull(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl">
          <div>
            <p className="text-xs font-bold text-stone-900">Available for Ordering?</p>
            <p className="text-[11px] text-stone-500">Show on POS order screen</p>
          </div>
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
          />
        </div>

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 bg-white pt-3 pb-1 border-t border-stone-100 flex items-center justify-end gap-3 z-10">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {itemToEdit ? 'Save Changes' : 'Create Item'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
