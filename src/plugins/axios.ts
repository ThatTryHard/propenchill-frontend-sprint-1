import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/users/auth'
import { useGlobalAlert } from '@/composables/useGlobalAlert'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

const { showAlert } = useGlobalAlert()

// Request Interceptor untuk otomatis nambahin header Authorization ke semua request yang butuh token
api.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  }
  return config
})

// Response Interceptor untuk otomatis handle error 401 (Unauthorized) dan 403 (Forbidden)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired atau gak valid
        const authStore = useAuthStore()
        authStore.logout()
        showAlert('warning', 'Sesi Anda telah berakhir. Silakan login kembali.', 'Peringatan')
        router.push('/login')
      } else if (error.response.status === 403) {
        showAlert(
          'error',
          'Akses ditolak. Anda tidak memiliki izin untuk tindakan ini.',
          'Akses Ditolak',
        )
        router.push('/') // Lempar ke halaman home/status
      }
    }
    return Promise.reject(error)
  },
)

export default api
