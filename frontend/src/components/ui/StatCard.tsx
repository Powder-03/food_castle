import React from 'react'
import { Card } from './Card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ReactNode
  accentColor?: 'emerald' | 'amber' | 'blue' | 'purple'
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = 'amber',
}) => {
  const accentStyles = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-sky-50 text-sky-600 border-sky-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  }

  return (
    <Card hoverEffect className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-extrabold text-stone-900 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-stone-400 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-2xl border', accentStyles[accentColor])}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
