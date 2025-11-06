import axios from 'axios'

// URL do Agente PDV local
const AGENTE_PDV_URL = import.meta.env.VITE_AGENTE_PDV_URL || 'http://localhost:5000'

// Cliente HTTP configurado
export const api = axios.create({
  baseURL: AGENTE_PDV_URL,
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Aqui você pode adicionar tokens, etc
    // const token = localStorage.getItem('token')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('[API] Request error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log(`[API] ✓ ${response.config.url} - ${response.status}`)
    return response
  },
  (error) => {
    if (error.response) {
      console.error(`[API] ✗ ${error.config?.url} - ${error.response.status}`, error.response.data)
    } else if (error.request) {
      console.error('[API] ✗ No response received', error.request)
    } else {
      console.error('[API] ✗ Request error', error.message)
    }
    return Promise.reject(error)
  }
)

export default api
