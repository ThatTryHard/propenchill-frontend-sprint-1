import { defineStore } from 'pinia'

const VITE_API_URL = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    role: localStorage.getItem('user_role') || null,
    user: JSON.parse(localStorage.getItem('user_data') || 'null') as { nama: string; email: string } | null,
    user:
      localStorage.getItem('user_nama') || localStorage.getItem('user_email')
        ? {
            nama: localStorage.getItem('user_nama') || '',
            email: localStorage.getItem('user_email') || '',
          }
        : null,
  }),

  actions: {
    async login(email: string, password: string) {
      const response = await fetch(VITE_API_URL + '/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Kredensial tidak valid')
      }

      this.accessToken = data.access
      this.refreshToken = data.refresh
      this.role = data.role || null
<<<<<<< HEAD
      
      const userData = { nama: data.nama, email: data.email }
      this.user = userData
      
=======
      this.user = {
        nama: data.nama || '',
        email: data.email || email,
      }
>>>>>>> dev
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('user_data', JSON.stringify(userData))
      if (data.role) localStorage.setItem('user_role', data.role)
      localStorage.setItem('user_nama', this.user.nama)
      localStorage.setItem('user_email', this.user.email)

      return data
    },

    async register(payload: {
      nama: string
      email: string
      password: string
      confirm_password: string
      no_hp: string
    }) {
      const response = await fetch(VITE_API_URL + '/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registrasi gagal')
      }

      return data
    },
    
    async sendEmailOtp(payload: { email: string }) {
      const response = await fetch(VITE_API_URL + '/api/send-email-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Gagal mengirim OTP')
      }

      return data
    },

    async verifyEmailOtp(payload: { email: string; otp: string }) {
      const response = await fetch(VITE_API_URL + '/api/verify-email-otp/', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Gagal memverifikasi email')
      }

      return data
    },
    
    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.role = null
      this.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_role')
<<<<<<< HEAD
      localStorage.removeItem('user_data')
=======
      localStorage.removeItem('user_nama')
      localStorage.removeItem('user_email')
>>>>>>> dev
    },
  },
})
