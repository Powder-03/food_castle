import React from 'react'
import { cn } from '@/lib/utils'

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn('bg-stone-200/70 animate-pulse rounded-xl', className)}
    />
  )
}
