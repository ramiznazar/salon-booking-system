import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8001/api',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const isAdminRoute = config.url?.includes('/admin/')
  const token = isAdminRoute
    ? localStorage.getItem('admin_token')
    : (localStorage.getItem('app_token') || localStorage.getItem('admin_token'))
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const path = window.location.pathname
      if (path.startsWith('/admin')) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        window.location.href = '/admin/login'
      } else if (path.startsWith('/vendor')) {
        localStorage.removeItem('app_token')
        localStorage.removeItem('app_user')
        window.location.href = '/vendor/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
