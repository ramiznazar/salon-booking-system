import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('admin_user')
    return stored ? JSON.parse(stored) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'))
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      const { user: u, token: t } = res.data.data
      if (u.role !== 'admin') throw new Error('Access denied. Admin only.')
      localStorage.setItem('admin_token', t)
      localStorage.setItem('admin_user', JSON.stringify(u))
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
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (u) => {
    setUser(u)
    localStorage.setItem('admin_user', JSON.stringify(u))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
