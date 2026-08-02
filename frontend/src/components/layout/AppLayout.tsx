import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useAuthStore } from '@/stores/auth-store'
import api from '@/lib/api'
import { LogOut } from 'lucide-react'

export const AppLayout: React.FC = () => {
  const { isAuthenticated, username, logout } = useAuthStore()
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Poll active orders count for badge updates every 15s
    const fetchActiveCount = async () => {
      try {
        const res = await api.get('/api/v1/orders/active')
        if (Array.isArray(res.data)) {
          setPendingCount(res.data.length)
        }
      } catch (err) {
        console.error('Failed to fetch active queue count', err)
      }
    }

    fetchActiveCount()
    const interval = setInterval(fetchActiveCount, 15000)
    return () => clearInterval(interval)
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen flex bg-stone-50 text-stone-900">
      {/* Desktop Sidebar */}
      <Sidebar pendingCount={pendingCount} />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏰</span>
            <span className="font-extrabold text-base tracking-tight">Food Castle</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400 font-semibold">Admin {username}</span>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet context={{ setPendingCount }} />
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <BottomNav pendingCount={pendingCount} />
    </div>
  )
}
