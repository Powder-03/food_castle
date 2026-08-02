import React, { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
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

const CATEGORIES = [
  { label: 'Beverages', value: 'Beverages' },
  { label: 'Mains', value: 'Mains' },
  { label: 'Snacks', value: 'Snacks' },
  { label: 'Desserts', value: 'Desserts' },
]

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  onSuccess,
}) => {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Beverages')
  const [hasVariants, setHasVariants] = useState(false)
  const [priceSingle, setPriceSingle] = useState<string>('')
  const [priceHalf, setPriceHalf] = useState<string>('')
  const [priceFull, setPriceFull] = useState<string>('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
      category,
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
          placeholder="e.g., Cold Coffee"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          label="Category"
          options={CATEGORIES}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />

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

        <div className="flex items-center justify-end gap-3 pt-2">
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
