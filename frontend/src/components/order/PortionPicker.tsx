import React from 'react'
import { Modal } from '@/components/ui/Modal'
import { MenuItem, PortionSize } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface PortionPickerProps {
  isOpen: boolean
  onClose: () => void
  item: MenuItem | null
  onSelectPortion: (item: MenuItem, portion: PortionSize) => void
}

export const PortionPicker: React.FC<PortionPickerProps> = ({
  isOpen,
  onClose,
  item,
  onSelectPortion,
}) => {
  if (!item) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Select Portion - ${item.name}`}>
      <div className="space-y-3">
        <p className="text-xs text-stone-500">Choose portion size to add to order:</p>
        <div className="grid grid-cols-2 gap-3">
          {item.price_half != null && (
            <button
              onClick={() => {
                onSelectPortion(item, 'HALF')
                onClose()
              }}
              className="flex flex-col items-center justify-center p-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl transition-all active:scale-95 text-center group"
            >
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                Half Portion
              </span>
              <span className="text-lg font-extrabold text-amber-900 mt-1">
                {formatCurrency(item.price_half)}
              </span>
            </button>
          )}

          {item.price_full != null && (
            <button
              onClick={() => {
                onSelectPortion(item, 'FULL')
                onClose()
              }}
              className="flex flex-col items-center justify-center p-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl shadow-md shadow-amber-500/20 transition-all active:scale-95 text-center"
            >
              <span className="text-xs font-bold text-amber-100 uppercase tracking-wide">
                Full Portion
              </span>
              <span className="text-lg font-extrabold text-white mt-1">
                {formatCurrency(item.price_full)}
              </span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
