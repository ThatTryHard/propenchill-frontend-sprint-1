import { defineStore } from 'pinia'

// mode template yang dipakai di sistem
export type TemplateMode = 'DOCX' | 'MANUAL'

// struktur pagination dari response backend
export interface TemplatePagination {
  page: number
  limit: number
  total_data: number
  total_pages: number
}

// config global surat (header, logo, dll)
export interface LetterSystemConfig {
  id: number
  nama_instansi: string
  logo_kiri?: string | null
  logo_kanan?: string | null
  header_html?: string | null
  updated_at?: string
}

// shape data template dari backend
export interface LetterTemplateItem {
  id_template: number
  nama_template: string
  jenis: 'KEAGAMAAN' | 'KESISWAAN' | 'AKADEMIK' | string
  konten_template: string | null
  template_mode: TemplateMode | string
  is_active: boolean
  created_by: string | number | null
  created_by_name?: string
  created_at: string
  updated_at?: string
  file_path?: string | null
  original_file_name?: string | null
  parsed_variables?: string[]
  allowed_roles?: string[]
  deleted_at?: string | null
  preview_text?: string | null
}

// parameter query untuk list template
export interface FetchTemplatesParams {
  q?: string
  jenis?: string
  template_mode?: string
  is_active?: 'true' | 'false'
  page?: number
  limit?: number
  sort_by?: 'created_at' | 'nama_template'
  order?: 'asc' | 'desc'
}

// wrapper response biar semua action store punya format yang konsisten
interface ApiResult<T = any> {
  ok: boolean
  status: number
  data: T | null
  pagination?: TemplatePagination | null
  message: string
  error: string
  details: any
}

const BASE_URL = import.meta.env.VITE_API_URL || ''

// ambil token auth dari localStorage
function getToken() {
  return localStorage.getItem('access_token')
}

// kalau ada token, inject ke Authorization header
function buildAuthHeaders(): HeadersInit | undefined {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : undefined
}

// rapihin value string biar ga nyimpan spasi kosong
function safeTrim(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  return value ? String(value).trim() : ''
}

// susun FormData sesuai kebutuhan backend
// DOCX dan MANUAL beda payload-nya
function buildTemplateFormData(payload: any): FormData {
  const formData = new FormData()

  if (payload.nama_template !== undefined) {
    formData.append('nama_template', safeTrim(payload.nama_template))
  }

  if (payload.jenis !== undefined) {
    formData.append('jenis', safeTrim(payload.jenis))
  }

  if (payload.template_mode !== undefined) {
    formData.append('template_mode', safeTrim(payload.template_mode))
  }

  // allowed_roles dikirim sebagai JSON string
  if (payload.allowed_roles !== undefined) {
    formData.append('allowed_roles', JSON.stringify(payload.allowed_roles || []))
  }

  if (payload.is_active !== undefined) {
    formData.append('is_active', String(payload.is_active))
  }

  // mode DOCX: file dikirim, text dikosongkan
  if (payload.template_mode === 'DOCX') {
    if (payload.konten_template !== undefined) {
      formData.append('konten_template', '')
    }

    if (payload.file_template) {
      formData.append('file_template', payload.file_template)
    }
  }

  // mode MANUAL: kirim text
  if (payload.template_mode === 'MANUAL') {
    if (payload.konten_template !== undefined) {
      formData.append('konten_template', safeTrim(payload.konten_template))
    }
  }

  return formData
}

// helper fetch biar parsing response seragam
async function handleFetch<T = any>(
  url: string,
  options: RequestInit
): Promise<ApiResult<T>> {
  const response = await fetch(url, options)

  let result: any = null
  try {
    result = await response.json()
  } catch {
    result = null
  }

  return {
    ok: response.ok,
    status: response.status,
    data: result?.data ?? null,
    pagination: result?.pagination ?? null,
    message: result?.message ?? '',
    error: result?.error ?? '',
    details: result?.details ?? null,
  }
}

// fallback kalau request gagal total
function buildErrorResult(message: string): ApiResult {
  return {
    ok: false,
    status: 500,
    data: null,
    pagination: null,
    message: '',
    error: message,
    details: null,
  }
}

export const useLetterTemplateStore = defineStore('letterTemplate', {
  state: () => ({
    // loading state dipisah biar UI bisa lebih spesifik
    isSubmitting: false,
    isFetching: false,
    isFetchingDetail: false,
    isDeleting: false,
    isFetchingConfig: false,

    error: '',
    successMessage: '',

    templates: [] as LetterTemplateItem[],
    pagination: null as TemplatePagination | null,
    selectedTemplate: null as LetterTemplateItem | null,
    config: null as LetterSystemConfig | null,
  }),

  actions: {
    clearMessages() {
      this.error = ''
      this.successMessage = ''
    },

    clearSelectedTemplate() {
      this.selectedTemplate = null
    },

    async fetchLetterConfig() {
      this.isFetchingConfig = true
      this.error = ''

      try {
        const res = await handleFetch<LetterSystemConfig>(
          `${BASE_URL}/api/letter_templates/config/`,
          {
            method: 'GET',
            headers: buildAuthHeaders(),
          }
        )

        if (!res.ok) {
          this.error = res.error || 'Gagal mengambil konfigurasi surat.'
          return res
        }

        this.config = res.data
        return res
      } catch {
        const fallback = buildErrorResult('Terjadi kesalahan saat mengambil konfigurasi surat.')
        this.error = fallback.error
        return fallback
      } finally {
        this.isFetchingConfig = false
      }
    },

    async createTemplate(payload: any) {
      this.isSubmitting = true
      this.clearMessages()

      try {
        const formData = buildTemplateFormData(payload)

        const res = await handleFetch<LetterTemplateItem>(
          `${BASE_URL}/api/letter_templates/`,
          {
            method: 'POST',
            body: formData,
            headers: buildAuthHeaders(),
          }
        )

        if (!res.ok) {
          this.error = res.error || 'Gagal membuat template.'
          return res
        }

        this.successMessage = res.message || 'Template surat berhasil dibuat.'
        return res
      } catch {
        const fallback = buildErrorResult('Terjadi kesalahan saat membuat template.')
        this.error = fallback.error
        return fallback
      } finally {
        this.isSubmitting = false
      }
    },

    async updateTemplate(id: number, payload: any) {
      this.isSubmitting = true
      this.clearMessages()

      try {
        const formData = buildTemplateFormData(payload)

        const res = await handleFetch<LetterTemplateItem>(
          `${BASE_URL}/api/letter_templates/${id}/`,
          {
            method: 'PUT',
            body: formData,
            headers: buildAuthHeaders(),
          }
        )

        if (!res.ok) {
          this.error = res.error || 'Gagal memperbarui template.'
          return res
        }

        this.successMessage = res.message || 'Template surat berhasil diperbarui.'

        // update state lokal biar UI langsung sinkron tanpa nunggu refetch
        if (res.data) {
          this.templates = this.templates.map((item) =>
            item.id_template === id ? { ...item, ...res.data } : item
          )

          if (this.selectedTemplate?.id_template === id) {
            this.selectedTemplate = { ...this.selectedTemplate, ...res.data }
          }
        }

        return res
      } catch {
        const fallback = buildErrorResult('Terjadi kesalahan saat memperbarui template.')
        this.error = fallback.error
        return fallback
      } finally {
        this.isSubmitting = false
      }
    },

    // toggle status cukup reuse updateTemplate
    async toggleTemplateStatus(id: number, isActive: boolean) {
      return this.updateTemplate(id, { is_active: isActive })
    },

    async fetchTemplates(params: FetchTemplatesParams = {}) {
      this.isFetching = true
      this.error = ''

      try {
        const searchParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value))
          }
        })

        const queryString = searchParams.toString()
        const url = queryString
          ? `${BASE_URL}/api/letter_templates/?${queryString}`
          : `${BASE_URL}/api/letter_templates/`

        const res = await handleFetch<LetterTemplateItem[]>(url, {
          method: 'GET',
          headers: buildAuthHeaders(),
        })

        if (!res.ok) {
          this.error = res.error || 'Gagal mengambil daftar template.'
          this.templates = []
          this.pagination = null
          return res
        }

        this.templates = Array.isArray(res.data) ? res.data : []
        this.pagination = res.pagination || null

        return res
      } catch {
        const fallback = buildErrorResult('Terjadi kesalahan saat mengambil daftar template.')
        this.error = fallback.error
        this.templates = []
        this.pagination = null
        return fallback
      } finally {
        this.isFetching = false
      }
    },

    async fetchTemplateDetail(id: number) {
      this.isFetchingDetail = true
      this.error = ''

      try {
        const res = await handleFetch<LetterTemplateItem>(
          `${BASE_URL}/api/letter_templates/${id}/`,
          {
            method: 'GET',
            headers: buildAuthHeaders(),
          }
        )

        if (!res.ok) {
          this.error = res.error || 'Gagal mengambil detail template.'
          return res
        }

        this.selectedTemplate = res.data
        return res
      } catch {
        const fallback = buildErrorResult('Terjadi kesalahan saat mengambil detail template.')
        this.error = fallback.error
        return fallback
      } finally {
        this.isFetchingDetail = false
      }
    },

    async deleteTemplate(id: number) {
      this.isDeleting = true
      this.clearMessages()

      try {
        const res = await handleFetch(
          `${BASE_URL}/api/letter_templates/${id}/`,
          {
            method: 'DELETE',
            headers: buildAuthHeaders(),
          }
        )

        if (!res.ok) {
          this.error = res.error || 'Gagal menghapus template.'
          return res
        }

        this.successMessage = res.message || 'Template surat berhasil dihapus.'

        // langsung hapus dari state biar card hilang tanpa reload penuh
        this.templates = this.templates.filter((item) => item.id_template !== id)

        if (this.selectedTemplate?.id_template === id) {
          this.selectedTemplate = null
        }

        return res
      } catch {
        const fallback = buildErrorResult('Terjadi kesalahan saat menghapus template.')
        this.error = fallback.error
        return fallback
      } finally {
        this.isDeleting = false
      }
    },
  },
})