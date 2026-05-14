import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/users/auth'

const VITE_API_URL = import.meta.env.VITE_API_URL

export type ThemePreference = 'LIGHT' | 'DARK'
export type TextSizePreference = 'SMALL' | 'DEFAULT' | 'LARGE'

export interface PreferenceOption {
  label: string
  value: string
}

export interface SettingsPreference {
  theme: ThemePreference
  default_home_page: string
  text_size: TextSizePreference
  notify_email: boolean
  notify_letter_status: boolean
  available_themes: PreferenceOption[]
  available_home_pages: PreferenceOption[]
  available_text_sizes: PreferenceOption[]
  updated_at: string
}

type ApiErrorResponse = {
  detail?: string
  error?: string
  message?: string
  details?: Record<string, string[]>
}

export const useSettingsPreferenceStore = defineStore('settingsPreference', {
  state: () => ({
    preference: null as SettingsPreference | null,
    loading: false,
    saving: false,
    error: null as string | null,
  }),

  getters: {
    themeOptions: (state): PreferenceOption[] => {
      return (
        state.preference?.available_themes || [
          { label: 'Light Mode', value: 'LIGHT' },
          { label: 'Dark Mode', value: 'DARK' },
        ]
      )
    },

    homePageOptions: (state): PreferenceOption[] => {
      return state.preference?.available_home_pages || [{ label: 'Profil', value: '/profile' }]
    },

    textSizeOptions: (state): PreferenceOption[] => {
      return (
        state.preference?.available_text_sizes || [
          { label: 'Kecil', value: 'SMALL' },
          { label: 'Default', value: 'DEFAULT' },
          { label: 'Besar', value: 'LARGE' },
        ]
      )
    },
  },

  actions: {
    applyPublicDefaultPreference() {
      const root = document.documentElement

      root.classList.remove('dark')
      root.dataset.textSize = 'default'
    },

    getAuthHeader() {
      const authStore = useAuthStore()

      return {
        Authorization: `Bearer ${authStore.accessToken}`,
        'Content-Type': 'application/json',
      }
    },

    getApiErrorMessage(result: ApiErrorResponse, fallback: string) {
      if (result?.details) {
        const firstKey = Object.keys(result.details)[0]

        if (firstKey) {
          const firstError = result.details[firstKey]?.[0]

          if (firstError) {
            return firstError
          }
        }
      }

      return result?.error || result?.message || result?.detail || fallback
    },

    applyPreference(preference: SettingsPreference) {
      const root = document.documentElement

      root.classList.toggle('dark', preference.theme === 'DARK')
      root.dataset.textSize = preference.text_size.toLowerCase()

      localStorage.setItem('theme', preference.theme)
      localStorage.setItem('text_size', preference.text_size)
      localStorage.setItem('default_home_page', preference.default_home_page)
    },

    applySavedPreference() {
      const savedTheme = localStorage.getItem('theme') as ThemePreference | null
      const savedTextSize = localStorage.getItem('text_size') as TextSizePreference | null

      const root = document.documentElement

      root.classList.toggle('dark', savedTheme === 'DARK')
      root.dataset.textSize = (savedTextSize || 'DEFAULT').toLowerCase()
    },

    async fetchPreference() {
      this.loading = true
      this.error = null

      try {
        const response = await fetch(`${VITE_API_URL}/api/settings/preference/`, {
          method: 'GET',
          headers: this.getAuthHeader(),
        })

        const result = (await response.json()) as ApiErrorResponse & {
          data?: SettingsPreference
        }

        if (!response.ok) {
          throw new Error(this.getApiErrorMessage(result, 'Data preference gagal dimuat.'))
        }

        if (!result.data) {
          throw new Error('Data preference tidak ditemukan.')
        }

        this.preference = result.data
        this.applyPreference(result.data)

        return result.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Data preference gagal dimuat.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updatePreference(payload: {
      theme: ThemePreference
      default_home_page: string
      text_size: TextSizePreference
      notify_email: boolean
      notify_letter_status: boolean
    }) {
      this.saving = true
      this.error = null

      try {
        const response = await fetch(`${VITE_API_URL}/api/settings/preference/`, {
          method: 'PATCH',
          headers: this.getAuthHeader(),
          body: JSON.stringify(payload),
        })

        const result = (await response.json()) as ApiErrorResponse & {
          data?: SettingsPreference
        }

        if (!response.ok) {
          throw new Error(this.getApiErrorMessage(result, 'Preference gagal diperbarui.'))
        }

        if (!result.data) {
          throw new Error('Data preference terbaru tidak ditemukan.')
        }

        this.preference = result.data
        this.applyPreference(result.data)

        return result.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Preference gagal diperbarui.'
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})