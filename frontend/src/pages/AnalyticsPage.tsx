import React, { useEffect, useState } from 'react'
import { AnalyticsSummary } from '@/lib/types'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import {
  IndianRupee,
  ShoppingBag,
  TrendingUp,
  Award,
  Users,
  Utensils,
  Calendar,
} from 'lucide-react'
import api from '@/lib/api'

export const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const todayStr = new Date().toISOString().split('T')[0]
  const [startDate, setStartDate] = useState(todayStr)
  const [endDate, setEndDate] = useState(todayStr)
  const [activePreset, setActivePreset] = useState<'today' | 'yesterday' | '7days' | 'month' | 'custom'>('today')

  const fetchAnalytics = async (sDate: string, eDate: string) => {
    try {
      setIsLoading(true)
      const res = await api.get('/api/v1/analytics/summary', {
        params: { start_date: sDate, end_date: eDate },
      })
      setSummary(res.data)
    } catch (err) {
      console.error('Failed to fetch analytics', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(startDate, endDate)
  }, [startDate, endDate])

  const handlePreset = (preset: 'today' | 'yesterday' | '7days' | 'month') => {
    setActivePreset(preset)
    const now = new Date()

    if (preset === 'today') {
      const s = now.toISOString().split('T')[0]
      setStartDate(s)
      setEndDate(s)
    } else if (preset === 'yesterday') {
      const y = new Date(now)
      y.setDate(y.getDate() - 1)
      const s = y.toISOString().split('T')[0]
      setStartDate(s)
      setEndDate(s)
    } else if (preset === '7days') {
      const s = now.toISOString().split('T')[0]
      const d7 = new Date(now)
      d7.setDate(d7.getDate() - 6)
      setStartDate(d7.toISOString().split('T')[0])
      setEndDate(s)
    } else if (preset === 'month') {
      const s = now.toISOString().split('T')[0]
      const dMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      setStartDate(dMonth.toISOString().split('T')[0])
      setEndDate(s)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Sales & Performance Analytics
          </h2>
          <p className="text-xs text-stone-500 font-medium">
            Revenue metrics, admin sales breakdown, and top selling products
          </p>
        </div>
      </div>

      {/* Date Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { label: 'Today', key: 'today' },
              { label: 'Yesterday', key: 'yesterday' },
              { label: 'Last 7 Days', key: '7days' },
              { label: 'This Month', key: 'month' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => handlePreset(p.key as any)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  activePreset === p.key
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Picker Inputs */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-stone-400 hidden sm:block" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setActivePreset('custom')
                setStartDate(e.target.value)
              }}
              className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <span className="text-xs text-stone-400 font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setActivePreset('custom')
                setEndDate(e.target.value)
              }}
              className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <StatCard
              title="Total Revenue"
              value={formatCurrency(summary?.total_sales || 0)}
              subtitle={`Timeframe: ${summary?.time_frame.start_date} to ${summary?.time_frame.end_date}`}
              icon={<IndianRupee className="w-6 h-6" />}
              accentColor="emerald"
            />
            <StatCard
              title="Completed Orders"
              value={summary?.total_orders || 0}
              subtitle="Total tickets"
              icon={<ShoppingBag className="w-6 h-6" />}
              accentColor="blue"
            />
            <StatCard
              title="Average Order Value"
              value={formatCurrency(summary?.average_order_value || 0)}
              subtitle="Per completed order"
              icon={<TrendingUp className="w-6 h-6" />}
              accentColor="purple"
            />
          </>
        )}
      </div>

      {/* Order Type & Admin Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Type Breakdown */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Utensils className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-stone-900 text-base">
              Order Type Revenue
            </h3>
          </div>

          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl space-y-1">
                <p className="text-xs font-bold text-sky-800 uppercase tracking-wide">
                  Dine-In Orders
                </p>
                <p className="text-xl font-extrabold text-sky-950">
                  {formatCurrency(summary?.order_type_sales.dine_in.revenue || 0)}
                </p>
                <p className="text-xs text-sky-600 font-semibold">
                  {summary?.order_type_sales.dine_in.count || 0} orders
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-1">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                  Takeaway Orders
                </p>
                <p className="text-xl font-extrabold text-amber-950">
                  {formatCurrency(summary?.order_type_sales.takeaway.revenue || 0)}
                </p>
                <p className="text-xs text-amber-600 font-semibold">
                  {summary?.order_type_sales.takeaway.count || 0} orders
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Admin Sales Performance */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Users className="w-5 h-5 text-purple-500" />
            <h3 className="font-extrabold text-stone-900 text-base">
              Admin Sales Breakdown
            </h3>
          </div>

          {isLoading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="space-y-3">
              {summary?.admin_sales.map((adminItem) => (
                <div
                  key={adminItem.admin}
                  className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200/80 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center border border-purple-200">
                      {adminItem.admin.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-stone-900 text-sm">
                        Admin "{adminItem.admin}"
                      </p>
                      <p className="text-xs text-stone-500 font-medium">
                        {adminItem.orders_count} orders created
                      </p>
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-stone-900">
                    {formatCurrency(adminItem.total_sales)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Category Wise & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Wise Sales */}
        <Card className="space-y-4">
          <h3 className="font-extrabold text-stone-900 text-base border-b border-stone-100 pb-3">
            Category Wise Sales
          </h3>

          {isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="space-y-3">
              {summary?.category_wise_sales.map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                    <span>{cat.category}</span>
                    <span>
                      {formatCurrency(cat.total_revenue)} ({cat.units_sold} units)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          ((cat.total_revenue || 0) / (summary.total_sales || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top Selling Products */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-stone-900 text-base">
              Top Selling Products
            </h3>
          </div>

          {isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="space-y-2.5">
              {summary?.top_selling_products.map((prod, idx) => (
                <div
                  key={`${prod.name}-${prod.portion_size}`}
                  className="flex items-center justify-between p-2.5 bg-stone-50 border border-stone-200/80 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full font-extrabold text-xs flex items-center justify-center ${
                        idx === 0
                          ? 'bg-amber-400 text-stone-950 shadow-xs'
                          : idx === 1
                          ? 'bg-stone-300 text-stone-900'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-stone-900 text-xs">
                        {prod.name}
                      </p>
                      <Badge variant="stone" size="sm">
                        {prod.portion_size}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-extrabold text-stone-900">
                      {formatCurrency(prod.total_revenue)}
                    </p>
                    <p className="text-[11px] text-stone-500 font-semibold">
                      {prod.units_sold} units sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
