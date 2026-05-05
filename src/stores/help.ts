import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/users/auth'

const VITE_API_URL = import.meta.env.VITE_API_URL

export interface FAQItem {
  question: string
  answer: string
}

export interface HelpCategory {
  id: string
  title: string
  description: string
  button_label: string
  icon: string
  items: FAQItem[]
}

export interface AdditionalHelp {
  title: string
  description: string
  operational_days: string
  operational_hours: string
}

export interface HelpFAQData {
  categories: HelpCategory[]
  faq: FAQItem[]
  additional_help: AdditionalHelp
  support_email: string
}

export const useHelpStore = defineStore('help', {
  state: () => ({
    helpData: null as HelpFAQData | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchHelpFAQ() {
      const authStore = useAuthStore()

      this.loading = true
      this.error = null

      try {
        const response = await fetch(`${VITE_API_URL}/api/help-faq/`, {
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
              'Data Help & FAQ gagal dimuat.',
          )
        }

        this.helpData = result.data
        return result.data
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Data Help & FAQ gagal dimuat.'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})