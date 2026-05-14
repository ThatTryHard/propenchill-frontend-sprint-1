import { defineStore } from 'pinia'

const VITE_API_URL = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
    role: (localStorage.getItem('user_role') || null)?.toUpperCase() || null,
    defaultHomePage: localStorage.getItem('default_home_page') || null,
    user: JSON.parse(localStorage.getItem('user_data') || 'null') as {
      nama: string
      email: string
    } | null,
  }),

  actions: {
    async fetchDefaultHomePage(accessToken: string) {
      try {
        const response = await fetch(VITE_API_URL + '/api/settings/preference/', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        const data = await response.json()

        if (!response.ok) {
          return null
        }

        const preference = data.data
        const defaultHomePage = preference?.default_home_page || null

        if (defaultHomePage) {
          this.defaultHomePage = defaultHomePage
          localStorage.setItem('default_home_page', defaultHomePage)
        }

        if (preference?.theme) {
          localStorage.setItem('theme', preference.theme)
          document.documentElement.classList.toggle('dark', preference.theme === 'DARK')
        }

        if (preference?.text_size) {
          localStorage.setItem('text_size', preference.text_size)
          document.documentElement.dataset.textSize = String(preference.text_size).toLowerCase()
        }

        return defaultHomePage
      } catch (error) {
        console.error('Gagal mengambil preference:', error)
        return null
      }
    },

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
      this.role = data.role ? String(data.role).toUpperCase() : null

      const userData = { nama: data.nama, email: data.email }
      this.user = userData

      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      localStorage.setItem('user_data', JSON.stringify(userData))

      if (data.role) localStorage.setItem('user_role', String(data.role).toUpperCase())

      const defaultHomePage = await this.fetchDefaultHomePage(data.access)

      return {
        ...data,
        default_home_page: defaultHomePage,
      }
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
      this.defaultHomePage = null
      this.user = null

      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_role')
      localStorage.removeItem('user_data')
      localStorage.removeItem('user_nama')
      localStorage.removeItem('user_email')
      localStorage.removeItem('theme')
      localStorage.removeItem('text_size')
      localStorage.removeItem('default_home_page')

      document.documentElement.classList.remove('dark')
      document.documentElement.dataset.textSize = 'default'
    },
  },
})