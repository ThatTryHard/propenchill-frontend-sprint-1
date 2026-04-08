import { defineStore } from 'pinia'

export type TemplateMode = 'DOCX' | 'MANUAL'

export interface CreateTemplatePayload {
  nama_template: string
  kode: string
  jenis: string
  template_mode: TemplateMode
  konten_template?: string
  role_akses: string[]
  file_template?: File | null
}

export interface LetterSystemConfigData {
  id: number
  nama_instansi: string
  logo_kiri: string | null
  logo_kanan: string | null
  header_html: string
  footer_html: string
  updated_at: string
}

interface TemplateState {
  isSubmitting: boolean
  isFetchingConfig: boolean
  error: string
  successMessage: string
  config: LetterSystemConfigData | null
}

interface CreateTemplateResult {
  ok: boolean
  error?: string
  details?: Record<string, any> | null
  data?: any
  status?: number
}

interface FetchConfigResult {
  ok: boolean
  error?: string
  data?: LetterSystemConfigData | null
  status?: number
}

function buildAuthHeaders(token: string | null): HeadersInit | undefined {
  if (!token) return undefined

  return {
    Authorization: `Bearer ${token}`,
  }
}

export const useLetterTemplateStore = defineStore('letterTemplate', {
  state: (): TemplateState => ({
    isSubmitting: false,
    isFetchingConfig: false,
    error: '',
    successMessage: '',
    config: null,
  }),

  getters: {
    headerHtml: (state) => state.config?.header_html || '',
    footerHtml: (state) => state.config?.footer_html || '',
    logoKiri: (state) => state.config?.logo_kiri || null,
    logoKanan: (state) => state.config?.logo_kanan || null,
  },

  actions: {
    clearMessages() {
      this.error = ''
      this.successMessage = ''
    },

    async createTemplate(payload: CreateTemplatePayload): Promise<CreateTemplateResult> {
      this.isSubmitting = true
      this.error = ''
      this.successMessage = ''

      try {
        const formData = new FormData()

        formData.append('nama_template', payload.nama_template.trim())
        formData.append('kode', payload.kode.trim().toLowerCase())
        formData.append('jenis', payload.jenis)
        formData.append('template_mode', payload.template_mode)
        formData.append('role_akses', JSON.stringify(payload.role_akses))

        if (payload.template_mode === 'DOCX' && payload.file_template) {
          formData.append('file_template', payload.file_template)
        }

        if (payload.template_mode === 'MANUAL') {
          // Konten dari rich text editor dikirim sebagai HTML string
          formData.append('konten_template', payload.konten_template?.trim() || '')
        }

        const baseUrl = import.meta.env.VITE_API_URL || ''
        const token = localStorage.getItem('access_token')

        const response = await fetch(`${baseUrl}/api/letter_templates/`, {
          method: 'POST',
          body: formData,
          headers: buildAuthHeaders(token),
        })

        let result: any = null

        try {
          result = await response.json()
        } catch {
          result = null
        }

        if (!response.ok) {
          this.error = result?.error || 'Gagal membuat template.'

          return {
            ok: false,
            error: this.error,
            details: result?.details || result || null,
            status: response.status,
          }
        }

        this.successMessage = result?.message || 'Template surat berhasil dibuat.'

        return {
          ok: true,
          data: result?.data || null,
          status: response.status,
        }
      } catch (error) {
        console.error('CREATE TEMPLATE ERROR:', error)

        this.error = 'Terjadi kesalahan saat mengirim data.'

        return {
          ok: false,
          error: this.error,
          details: null,
        }
      } finally {
        this.isSubmitting = false
      }
    },

    async fetchLetterConfig(): Promise<FetchConfigResult> {
      this.isFetchingConfig = true
      this.error = ''

      try {
        const baseUrl = import.meta.env.VITE_API_URL || ''
        const token = localStorage.getItem('access_token')

        const response = await fetch(`${baseUrl}/api/letter_templates/config/`, {
          method: 'GET',
          headers: buildAuthHeaders(token),
        })

        if (!response.ok) {
          console.error('Gagal fetch config. Status:', response.status)

          this.error = 'Gagal mengambil konfigurasi surat.'

          return {
            ok: false,
            error: this.error,
            data: null,
            status: response.status,
          }
        }

        const result = await response.json()

        this.config = result?.data || null

        return {
          ok: true,
          data: this.config,
          status: response.status,
        }
      } catch (error) {
        console.error('Gagal mengambil konfigurasi surat:', error)

        this.error = 'Terjadi kesalahan saat mengambil konfigurasi surat.'

        return {
          ok: false,
          error: this.error,
          data: null,
        }
      } finally {
        this.isFetchingConfig = false
      }
    },
  },
})