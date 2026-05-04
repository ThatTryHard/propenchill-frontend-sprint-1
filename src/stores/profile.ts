import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/users/auth'

const VITE_API_URL = import.meta.env.VITE_API_URL

export interface UserProfile {
  id: number
  nama: string
  email: string
  nomor_hp: string | null
  alamat: string | null
  tanggal_lahir: string | null
  role: string
  role_label: string
  status_akun: string
  status_verifikasi: string
  is_email_verified: boolean
  show_verification_button: boolean
  is_profile_complete: boolean
  kelengkapan_data: string
}

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null as UserProfile | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchProfile() {
      const authStore = useAuthStore()

      this.loading = true
      this.error = null

      try {
        const response = await fetch(`${VITE_API_URL}/api/profile/`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(
            result.detail ||
              result.error ||
              result.message ||
              'Data profil gagal dimuat.',
          )
        }

        this.profile = result.data
        return result.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Data profil gagal dimuat.'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})