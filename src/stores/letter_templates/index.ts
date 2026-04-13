import { defineStore } from 'pinia'

export type TemplateMode = 'DOCX' | 'MANUAL'

export interface CreateTemplatePayload {
  nama_template?: string
  jenis?: string
  template_mode?: TemplateMode
  konten_template?: string
  role_akses?: string[]
  file_template?: File | null
}

export interface LetterSystemConfigData {
  id: number
  nama_instansi: string
  logo_kiri: string | null
  logo_kanan: string | null
  header_html: string
  footer_html?: string
  updated_at: string
}

export interface TemplateItem {
  id_template: number
  nama_template: string
  jenis: string
  is_active: boolean
  template_mode: 'DOCX' | 'MANUAL'
  file_path: string | null
  original_file_name: string | null
  konten_template: string | null
  parsed_variables: string[]
  role_akses: string[]
  created_at: string
  deleted_at: string | null
  created_by: number | null
  preview_text?: string | null
}

export interface TemplatePagination {
  page: number
  limit: number
  total_data: number
  total_pages: number
}

export interface FetchTemplatesParams {
  q?: string
  is_active?: 'true' | 'false'
  jenis?: string
  template_mode?: TemplateMode
  page?: number
  limit?: number
  sort_by?: 'created_at' | 'nama_template'
  order?: 'asc' | 'desc'
}

interface TemplateState {
  isSubmitting: boolean
  isFetchingConfig: boolean
  isFetchingTemplates: boolean
  isFetchingDetail: boolean
  isDeleting: boolean
  error: string
  successMessage: string
  config: LetterSystemConfigData | null
  templates: TemplateItem[]
  pagination: TemplatePagination | null
  selectedTemplate: TemplateItem | null
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

interface FetchTemplatesResult {
  ok: boolean
  error?: string
  data?: TemplateItem[]
  pagination?: TemplatePagination | null
  status?: number
}

interface FetchTemplateDetailResult {
  ok: boolean
  error?: string
  data?: TemplateItem | null
  status?: number
}

interface DeleteTemplateResult {
  ok: boolean
  error?: string
  message?: string
  status?: number
}

function buildAuthHeaders(token: string | null): HeadersInit | undefined {
  if (!token) return undefined

  return {
    Authorization: `Bearer ${token}`,
  }
}

function safeTrim(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

export const useLetterTemplateStore = defineStore('letterTemplate', {
  state: (): TemplateState => ({
    isSubmitting: false,
    isFetchingConfig: false,
    isFetchingTemplates: false,
    isFetchingDetail: false,
    isDeleting: false,
    error: '',
    successMessage: '',
    config: null,
    templates: [],
    pagination: null,
    selectedTemplate: null,
  }),

  getters: {
    headerHtml: (state) => state.config?.header_html || '',
    footerHtml: (state) => state.config?.footer_html || '',
  },

  actions: {
    clearMessages() {
      this.error = ''
      this.successMessage = ''
    },

    clearSelectedTemplate() {
      this.selectedTemplate = null
    },

    async createTemplate(payload: CreateTemplatePayload): Promise<CreateTemplateResult> {
      this.isSubmitting = true
      this.error = ''
      this.successMessage = ''

      try {
        const namaTemplate = safeTrim(payload.nama_template)
        const jenis = safeTrim(payload.jenis)
        const templateMode = payload.template_mode
        const kontenTemplate = safeTrim(payload.konten_template)
        const roleAkses = Array.isArray(payload.role_akses) ? payload.role_akses : []
        const fileTemplate = payload.file_template ?? null

        if (!namaTemplate) {
          return {
            ok: false,
            error: 'Nama template wajib diisi.',
            details: { nama_template: ['Nama template wajib diisi.'] },
          }
        }

        if (!jenis) {
          return {
            ok: false,
            error: 'Jenis template wajib dipilih.',
            details: { jenis: ['Jenis template wajib dipilih.'] },
          }
        }

        if (!templateMode) {
          return {
            ok: false,
            error: 'Metode template wajib dipilih.',
            details: { template_mode: ['Metode template wajib dipilih.'] },
          }
        }

        if (roleAkses.length === 0) {
          return {
            ok: false,
            error: 'Pilih minimal satu role akses.',
            details: { role_akses: ['Pilih minimal satu role akses.'] },
          }
        }

        const formData = new FormData()
        formData.append('nama_template', namaTemplate)
        formData.append('jenis', jenis)
        formData.append('template_mode', templateMode)
        formData.append('role_akses', JSON.stringify(roleAkses))

        if (templateMode === 'DOCX') {
          if (!fileTemplate) {
            return {
              ok: false,
              error: 'File template wajib diisi untuk mode DOCX.',
              details: { file_template: ['File template wajib diisi untuk mode DOCX.'] },
            }
          }

          formData.append('file_template', fileTemplate)
        }

        if (templateMode === 'MANUAL') {
          if (!kontenTemplate) {
            return {
              ok: false,
              error: 'Konten template wajib diisi untuk mode MANUAL.',
              details: { konten_template: ['Konten template wajib diisi untuk mode MANUAL.'] },
            }
          }

          formData.append('konten_template', kontenTemplate)
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

    async fetchTemplates(params: FetchTemplatesParams = {}): Promise<FetchTemplatesResult> {
      this.isFetchingTemplates = true
      this.error = ''

      try {
        const baseUrl = import.meta.env.VITE_API_URL || ''
        const token = localStorage.getItem('access_token')

        const searchParams = new URLSearchParams()

        if (params.q) searchParams.append('q', params.q)
        if (params.is_active) searchParams.append('is_active', params.is_active)
        if (params.jenis) searchParams.append('jenis', params.jenis)
        if (params.template_mode) searchParams.append('template_mode', params.template_mode)
        if (params.page) searchParams.append('page', String(params.page))
        if (params.limit) searchParams.append('limit', String(params.limit))
        if (params.sort_by) searchParams.append('sort_by', params.sort_by)
        if (params.order) searchParams.append('order', params.order)

        const queryString = searchParams.toString()
        const url = `${baseUrl}/api/letter_templates/${queryString ? `?${queryString}` : ''}`

        const response = await fetch(url, {
          method: 'GET',
          headers: buildAuthHeaders(token),
        })

        let result: any = null

        try {
          result = await response.json()
        } catch {
          result = null
        }

        if (!response.ok) {
          this.error = result?.error || 'Gagal mengambil daftar template.'
          this.templates = []
          this.pagination = null

          return {
            ok: false,
            error: this.error,
            data: [],
            pagination: null,
            status: response.status,
          }
        }

        this.templates = Array.isArray(result?.data) ? result.data : []
        this.pagination = result?.pagination || null

        return {
          ok: true,
          data: this.templates,
          pagination: this.pagination,
          status: response.status,
        }
      } catch (error) {
        console.error('FETCH TEMPLATES ERROR:', error)

        this.error = 'Terjadi kesalahan saat mengambil daftar template.'
        this.templates = []
        this.pagination = null

        return {
          ok: false,
          error: this.error,
          data: [],
          pagination: null,
        }
      } finally {
        this.isFetchingTemplates = false
      }
    },

    async fetchTemplateDetail(idTemplate: number): Promise<FetchTemplateDetailResult> {
      this.isFetchingDetail = true
      this.error = ''
      this.selectedTemplate = null

      try {
        const baseUrl = import.meta.env.VITE_API_URL || ''
        const token = localStorage.getItem('access_token')

        const response = await fetch(`${baseUrl}/api/letter_templates/${idTemplate}/`, {
          method: 'GET',
          headers: buildAuthHeaders(token),
        })

        let result: any = null

        try {
          result = await response.json()
        } catch {
          result = null
        }

        if (!response.ok) {
          this.error = result?.error || 'Gagal mengambil detail template.'

          return {
            ok: false,
            error: this.error,
            data: null,
            status: response.status,
          }
        }

        this.selectedTemplate = result?.data || null

        return {
          ok: true,
          data: this.selectedTemplate,
          status: response.status,
        }
      } catch (error) {
        console.error('FETCH TEMPLATE DETAIL ERROR:', error)

        this.error = 'Terjadi kesalahan saat mengambil detail template.'
        this.selectedTemplate = null

        return {
          ok: false,
          error: this.error,
          data: null,
        }
      } finally {
        this.isFetchingDetail = false
      }
    },

    async deleteTemplate(idTemplate: number): Promise<DeleteTemplateResult> {
      this.isDeleting = true
      this.error = ''
      this.successMessage = ''

      try {
        const baseUrl = import.meta.env.VITE_API_URL || ''
        const token = localStorage.getItem('access_token')

        const response = await fetch(`${baseUrl}/api/letter_templates/${idTemplate}/`, {
          method: 'DELETE',
          headers: buildAuthHeaders(token),
        })

        let result: any = null

        try {
          result = await response.json()
        } catch {
          result = null
        }

        if (!response.ok) {
          this.error = result?.error || 'Gagal menghapus template.'

          return {
            ok: false,
            error: this.error,
            status: response.status,
          }
        }

        this.successMessage = result?.message || 'Template surat berhasil dihapus.'

        return {
          ok: true,
          message: this.successMessage,
          status: response.status,
        }
      } catch (error) {
        console.error('DELETE TEMPLATE ERROR:', error)

        this.error = 'Terjadi kesalahan saat menghapus template.'

        return {
          ok: false,
          error: this.error,
        }
      } finally {
        this.isDeleting = false
      }
    },
  },
})