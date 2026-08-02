import React, { useEffect, useState } from 'react'
import { MenuItem } from '@/lib/types'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import { MenuItemModal, DEFAULT_CATEGORIES } from '@/components/menu/MenuItemModal'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, UtensilsCrossed } from 'lucide-react'
import api from '@/lib/api'

const AVAILABILITY_OPTIONS = [
  { label: 'All Statuses', value: '' },
  { label: 'Available Only', value: 'true' },
  { label: 'Unavailable Only', value: 'false' },
]

export const MenuPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<MenuItem | null>(null)

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/v1/menu/categories')
      if (Array.isArray(res.data) && res.data.length > 0) {
        const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...res.data]))
        setCategories(merged)
      }
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true)
      const params: Record<string, any> = {}
      if (categoryFilter) params.category = categoryFilter
      if (availabilityFilter !== '') params.is_available = availabilityFilter === 'true'

      const res = await api.get('/api/v1/menu', { params })
      setItems(res.data)
    } catch (err) {
      console.error('Failed to fetch menu items', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchMenuItems()
  }, [categoryFilter, availabilityFilter])

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...categories.map((c) => ({ label: c, value: c })),
  ]

  const handleOpenAddModal = () => {
    setItemToEdit(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: MenuItem) => {
    setItemToEdit(item)
    setIsModalOpen(true)
  }

  const handleModalSuccess = () => {
    fetchCategories()
    fetchMenuItems()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Menu Management
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Manage cafe items, custom categories, prices, and availability
          </p>
        </div>

        <Button onClick={handleOpenAddModal} className="shadow-md">
          <Plus className="w-4 h-4" />
          Add Menu Item
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 border border-stone-200/80 rounded-2xl shadow-xs">
        <div className="w-full sm:w-64">
          <Select
            options={categoryOptions}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            options={AVAILABILITY_OPTIONS}
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Menu Item Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="w-8 h-8" />}
          title="No menu items found"
          description="Try adjusting your filters or click below to add your first menu item."
          action={
            <Button onClick={handleOpenAddModal} size="sm">
              Add New Item
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} onEdit={handleOpenEditModal} />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <MenuItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemToEdit={itemToEdit}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
