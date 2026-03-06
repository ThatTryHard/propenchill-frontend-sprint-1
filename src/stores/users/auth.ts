import { defineStore } from 'pinia'

const VITE_API_URL = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Inisialisasi token dari LocalStorage
    accessToken: localStorage.getItem('access_token') || null,
    refreshToken: localStorage.getItem('refresh_token') || null,
  }),

  actions: {
    async login(email: string, password: string) {
      const response = await fetch(VITE_API_URL + '/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      // Kalau ada error, lempar error dengan pesan dari backend
      if (!response.ok) {
        throw new Error(data.detail || 'Kredensial tidak valid')
      }

      // Kalau sukses, simpan ke State Pinia dan LocalStorage
      this.accessToken = data.access
      this.refreshToken = data.refresh
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)

      return data
    },

    logout() {
      // Hapus token dari State Pinia dan LocalStorage
      this.accessToken = null
      this.refreshToken = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },
  },
})
