import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnalyticsSummary } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import api from '@/lib/api'
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  ChefHat,
  PlusCircle,
  UtensilsCrossed,
  BarChart3,
  Clock,
} from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const { username } = useAuthStore()
  const navigate = useNavigate()

  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [sumRes, activeRes] = await Promise.all([
          api.get('/api/v1/analytics/summary'),
          api.get('/api/v1/orders/active'),
        ])
        setSummary(sumRes.data)
        setPendingCount(Array.isArray(activeRes.data) ? activeRes.data.length : 0)
      } catch (err) {
        console.error('Failed to load dashboard data', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Welcome back, Admin {username}! 👋
          </h2>
          <p className="text-xs font-semibold text-stone-500">{currentDate}</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-extrabold text-amber-900 uppercase">
            Live System Active
          </span>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              title="Today's Sales"
              value={formatCurrency(summary?.total_sales || 0)}
              subtitle="Completed revenue"
              icon={<IndianRupee className="w-6 h-6" />}
              accentColor="emerald"
            />
            <StatCard
              title="Total Orders"
              value={summary?.total_orders || 0}
              subtitle="Orders processed"
              icon={<ShoppingBag className="w-6 h-6" />}
              accentColor="blue"
            />
            <StatCard
              title="Average Order Value"
              value={formatCurrency(summary?.average_order_value || 0)}
              subtitle="Per completed ticket"
              icon={<TrendingUp className="w-6 h-6" />}
              accentColor="purple"
            />
            <StatCard
              title="Active Kitchen Queue"
              value={pendingCount}
              subtitle={pendingCount > 0 ? 'Orders pending' : 'Queue clear'}
              icon={<Clock className="w-6 h-6" />}
              accentColor="amber"
            />
          </>
        )}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-extrabold text-stone-700 uppercase tracking-wider">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            hoverEffect
            onClick={() => navigate('/orders/new')}
            className="cursor-pointer bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none shadow-md shadow-amber-500/20 group p-6"
          >
            <div className="flex items-center justify-between">
              <PlusCircle className="w-8 h-8 text-amber-100 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-extrabold uppercase bg-white/20 px-2.5 py-1 rounded-full text-white">
                POS
              </span>
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-black text-white">New Order</h4>
              <p className="text-xs text-amber-100 font-medium">
                Create new Dine-In or Takeaway ticket
              </p>
            </div>
          </Card>

          <Card
            hoverEffect
            onClick={() => navigate('/orders/queue')}
            className="cursor-pointer group p-6 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <ChefHat className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
              {pendingCount > 0 && (
                <span className="px-2.5 py-1 text-xs font-black bg-amber-500 text-white rounded-full animate-bounce">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-bold text-stone-900">Kitchen Queue</h4>
              <p className="text-xs text-stone-500 font-medium">
                Manage active pending orders
              </p>
            </div>
          </Card>

          <Card
            hoverEffect
            onClick={() => navigate('/menu')}
            className="cursor-pointer group p-6"
          >
            <div className="flex items-center justify-between">
              <UtensilsCrossed className="w-8 h-8 text-sky-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-bold text-stone-900">Menu Management</h4>
              <p className="text-xs text-stone-500 font-medium">
                Update prices & availability
              </p>
            </div>
          </Card>

          <Card
            hoverEffect
            onClick={() => navigate('/analytics')}
            className="cursor-pointer group p-6"
          >
            <div className="flex items-center justify-between">
              <BarChart3 className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-bold text-stone-900">Sales Analytics</h4>
              <p className="text-xs text-stone-500 font-medium">
                View revenue & top items
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
