import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../api/axios'
import { useAppAuth } from './AppAuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated, isCustomer } = useAppAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) { setCart(null); return }
    setLoading(true)
    try {
      const res = await api.get('/cart')
      setCart(res.data.data)
    } catch {
      setCart(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, isCustomer])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated || !isCustomer) return { success: false, authRequired: true }
    try {
      await api.post('/cart/items', {
        product_id: product.id,
        vendor_id: product.vendor_id,
        quantity,
      })
      await refreshCart()
      return { success: true }
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message }
    }
  }

  const removeFromCart = async (cartItemId) => {
    try {
      await api.delete(`/cart/items/${cartItemId}`)
      setCart(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== cartItemId) } : prev)
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message }
    }
  }

  const clearCart = async () => {
    try {
      await api.delete('/cart')
      setCart(prev => prev ? { ...prev, items: [] } : prev)
    } catch {}
  }

  const cartCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0

  return (
    <CartContext.Provider value={{ cart, cartCount, loading, refreshCart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
