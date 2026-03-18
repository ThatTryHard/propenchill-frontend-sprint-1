import { defineStore } from 'pinia'

const VITE_API_URL = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    role: localStorage.getItem('user_role') || null,
    user: JSON.parse(localStorage.getItem('user_data') || 'null') as {
      nama: string
      email: string
    } | null,
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
      const userData = { nama: data.nama, email: data.email }
      this.user = userData
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('user_data', JSON.stringify(userData))
      if (data.role) localStorage.setItem('user_role', data.role)

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
      const response = await fetch(VITE_API_URL + '/api/auth/send-email-otp/', {
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
      const response = await fetch(VITE_API_URL + '/api/auth/verify-email-otp/', {
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
      localStorage.removeItem('user_data')
      localStorage.removeItem('user_nama')
      localStorage.removeItem('user_email')
    },
  },
})
