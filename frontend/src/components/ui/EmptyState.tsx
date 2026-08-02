import React from 'react'

export interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-stone-200/80 rounded-2xl shadow-xs space-y-3">
      <div className="p-4 bg-amber-50 text-amber-600 rounded-full border border-amber-100/80">
        {icon}
      </div>
      <h3 className="text-base font-bold text-stone-900">{title}</h3>
      {description && (
        <p className="text-sm text-stone-500 max-w-sm">{description}</p>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  )
}
