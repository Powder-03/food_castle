import React from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  hoverEffect = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm transition-all duration-200',
        hoverEffect && 'hover:shadow-md hover:border-amber-200 hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
