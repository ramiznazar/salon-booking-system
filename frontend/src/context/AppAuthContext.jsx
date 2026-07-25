import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AppAuthContext = createContext(null)

export function AppAuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('app_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('app_token'))
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { user: u, token: t } = res.data.data
      if (u.role === 'admin') {
        return { success: false, message: 'Use the admin login page.' }
      }
      localStorage.setItem('app_token', t)
      localStorage.setItem('app_user', JSON.stringify(u))
      setToken(t)
      setUser(u)
      return { success: true, role: u.role }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password, phone) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/register', { name, email, password, phone, role: 'customer' })
      const { user: u, token: t } = res.data.data
      localStorage.setItem('app_token', t)
      localStorage.setItem('app_user', JSON.stringify(u))
      setToken(t)
      setUser(u)
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('app_token')
    localStorage.removeItem('app_user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (u) => {
    setUser(u)
    localStorage.setItem('app_user', JSON.stringify(u))
  }

  return (
    <AppAuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!token,
      isVendor: user?.role === 'vendor',
      isCustomer: user?.role === 'customer',
    }}>
      {children}
    </AppAuthContext.Provider>
  )
}

export const useAppAuth = () => useContext(AppAuthContext)
