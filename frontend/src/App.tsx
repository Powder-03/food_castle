import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { MenuPage } from '@/pages/MenuPage'
import { NewOrderPage } from '@/pages/NewOrderPage'
import { KitchenQueuePage } from '@/pages/KitchenQueuePage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1c1917',
            color: '#fff',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '600',
          },
        }}
      />
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected App Routes */}
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/orders/new" element={<NewOrderPage />} />
          <Route path="/orders/queue" element={<KitchenQueuePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
