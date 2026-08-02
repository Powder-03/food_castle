import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Lock, User } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('Please enter username and password.')
      return
    }

    try {
      setIsLoading(true)
      await login(username.trim(), password)
      navigate('/')
    } catch (err: any) {
      console.error('Login error', err)
      setError('Invalid admin credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-stone-900 bg-[radial-gradient(#292524_1px,transparent_1px)] [background-size:16px_16px]">
      <Card className="w-full max-w-md p-8 bg-white/95 backdrop-blur-md shadow-2xl border-stone-800 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center text-3xl mx-auto shadow-lg shadow-amber-500/30">
            🏰
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">
            Food Castle OS
          </h2>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest">
            Internal Cafe Management Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold text-center animate-fade-in">
              {error}
            </div>
          )}

          <Input
            label="Admin Username"
            placeholder="e.g. i or a"
            icon={<User className="w-4 h-4" />}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full text-base font-bold py-3 shadow-md"
          >
            Sign In to Terminal
          </Button>
        </form>

        <p className="text-[11px] text-center text-stone-400 font-medium">
          Authorized internal admin access only
        </p>
      </Card>
    </div>
  )
}
