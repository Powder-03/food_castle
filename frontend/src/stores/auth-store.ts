import { create } from 'zustand'
import api from '@/lib/api'

interface AuthState {
  username: string | null
  token: string | null
  isAuthenticated: boolean
  login: (user: string, pass: string) => Promise<void>
  logout: () => void
}

const initialToken = sessionStorage.getItem('food_castle_auth')
const initialUser = sessionStorage.getItem('food_castle_admin')

export const useAuthStore = create<AuthState>((set) => ({
  username: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken,

  login: async (user: string, pass: string) => {
    const token = btoa(`${user}:${pass}`)
    // Test authentication with GET /api/v1/menu
    await api.get('/api/v1/menu', {
      headers: {
        Authorization: `Basic ${token}`,
      },
    })

    sessionStorage.setItem('food_castle_auth', token)
    sessionStorage.setItem('food_castle_admin', user)

    set({
      username: user,
      token,
      isAuthenticated: true,
    })
  },

  logout: () => {
    sessionStorage.removeItem('food_castle_auth')
    sessionStorage.removeItem('food_castle_admin')
    set({
      username: null,
      token: null,
      isAuthenticated: false,
    })
  },
}))
