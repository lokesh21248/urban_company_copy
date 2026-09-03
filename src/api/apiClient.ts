import axios from 'axios'

// Base URL — automatically uses Vite proxy on localhost and Render backend in production
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? '/api/v1'
    : 'https://urban-services-backend-12qk.onrender.com/api/v1')

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ── Request Interceptor — auth token ──────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Phase 27: Add Firebase token here
    // const token = useAuthStore.getState().token
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// ── Response Interceptor — error normalization ────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      'An unexpected error occurred'

    if (error.response?.status === 401) {
      // Phase 27: redirect to login
      console.warn('Unauthorized — redirect to login in Phase 27')
    }

    return Promise.reject(new Error(message))
  },
)

export default apiClient
