import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  ChefHat,
  UtensilsCrossed,
  History,
  BarChart3,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

interface SidebarProps {
  pendingCount?: number
}

export const Sidebar: React.FC<SidebarProps> = ({ pendingCount = 0 }) => {
  const { username, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'New Order', path: '/orders/new', icon: PlusCircle, highlight: true },
    { label: 'Kitchen Queue', path: '/orders/queue', icon: ChefHat, badge: pendingCount },
    { label: 'Order History', path: '/orders/history', icon: History },
    { label: 'Menu', path: '/menu', icon: UtensilsCrossed },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  ]

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-stone-900 text-stone-300 min-h-screen p-4 justify-between border-r border-stone-800 shrink-0">
      <div className="space-y-6">
        {/* Logo / Brand Header */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 font-black text-xl">
            🏰
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-tight">Food Castle</h1>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-400">
              Cloud Kitchen OS
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group',
                  isActive
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/20'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800/60',
                  item.highlight && !location.pathname.startsWith(item.path) && 'border border-amber-500/30 text-amber-400'
                )
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-amber-400 text-stone-950 rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User / Footer */}
      <div className="pt-4 border-t border-stone-800 space-y-3">
        <div className="flex items-center gap-3 px-3 py-2 bg-stone-800/40 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs uppercase border border-amber-500/30">
            {username || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">Admin {username}</p>
            <p className="text-[10px] text-stone-500 truncate">Authenticated</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-stone-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
