import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  ChefHat,
  History,
  UtensilsCrossed,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  pendingCount?: number
}

export const BottomNav: React.FC<BottomNavProps> = ({ pendingCount = 0 }) => {
  const navItems = [
    { label: 'Home', path: '/', icon: LayoutDashboard },
    { label: 'New Order', path: '/orders/new', icon: PlusCircle, isMain: true },
    { label: 'Kitchen', path: '/orders/queue', icon: ChefHat, badge: pendingCount },
    { label: 'History', path: '/orders/history', icon: History },
    { label: 'Menu', path: '/menu', icon: UtensilsCrossed },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-90',
                isActive ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon
                    className={cn(
                      'w-5 h-5',
                      item.isMain && 'w-6 h-6 text-amber-500',
                      isActive && 'scale-110'
                    )}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 text-[9px] font-black bg-amber-500 text-stone-950 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
