import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Attach Basic Auth Credentials
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('food_castle_auth')
  if (token) {
    config.headers.Authorization = `Basic ${token}`
  }
  return config
})

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('food_castle_auth')
      sessionStorage.removeItem('food_castle_admin')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
