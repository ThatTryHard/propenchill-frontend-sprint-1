import { defineStore } from 'pinia'

export type TemplateMode = 'DOCX' | 'MANUAL'

const BASE_URL = import.meta.env.VITE_API_URL || ''

interface TemplatePagination {
  page: number
  limit: number
  total_data: number
  total_pages: number
}

interface ApiResult<T = any> {
  ok: boolean
  status: number
  data: T | null
  pagination?: TemplatePagination | null
  message: string
  error: string
  details: any
}

function getToken() {
  return localStorage.getItem('access_token')
}

function buildAuthHeaders(): HeadersInit | undefined {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : undefined
}

function safeTrim(value: unknown): string {
  if (typeof value === 'string') return value.trim()
  return value ? String(value).trim() : ''
}

function buildTemplateFormData(payload: any): FormData {
  const formData = new FormData()

  if (payload.nama_template !== undefined) {
    formData.append('nama_template', safeTrim(payload.nama_template))
  }

  if (payload.jenis !== undefined) {
    formData.append('jenis', safeTrim(payload.jenis))
  }

  if (payload.template_mode !== undefined) {
    formData.append('template_mode', payload.template_mode)
  }

  if (payload.allowed_roles !== undefined) {
    formData.append('allowed_roles', JSON.stringify(payload.allowed_roles || []))
  }

  if (payload.is_active !== undefined) {
    formData.append('is_active', String(payload.is_active))
  }

  if (payload.template_mode === 'DOCX') {
    if (payload.konten_template !== undefined) {
      formData.append('konten_template', '')
    }

    if (payload.file_template) {
      formData.append('file_template', payload.file_template)
    }
  }

  if (payload.template_mode === 'MANUAL') {
    if (payload.konten_template !== undefined) {
      formData.append('konten_template', safeTrim(payload.konten_template))
    }
  }

  return formData
}

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
    data: result?.data || null,
    pagination: result?.pagination || null,
    message: result?.message || '',
    error: result?.error || '',
    details: result?.details || null,
  }
}

export const useLetterTemplateStore = defineStore('letterTemplate', {
  state: () => ({
    isSubmitting: false,
    isFetching: false,
    isFetchingDetail: false,
    isDeleting: false,
    isFetchingTemplates: false,

    error: '',
    successMessage: '',

    templates: [] as any[],
    pagination: null as TemplatePagination | null,
    selectedTemplate: null as any,
    config: null as any,
  }),

  actions: {
    clearMessages() {
      this.error = ''
      this.successMessage = ''
    },

    clearSelectedTemplate() {
      this.selectedTemplate = null
    },

    // create template
    async createTemplate(payload: any) {
      this.isSubmitting = true
      this.clearMessages()

      try {
        const formData = buildTemplateFormData(payload)

        const res = await handleFetch(
          `${BASE_URL}/api/letter_templates/`,
          {
            method: 'POST',
            body: formData,
            headers: buildAuthHeaders(),
          }
        )

        if (!res.ok) {
          this.error = res.error || 'Gagal membuat template'
          return res
        }

        this.successMessage = res.message || 'Berhasil membuat template'
        return res
      } catch {
        this.error = 'Terjadi kesalahan saat create'
        return { ok: false }
      } finally {
        this.isSubmitting = false
      }
    },

    // updateTemplate ini dipakai untuk update biasa (edit) maupun toggle active/inactive (karena backendnya partial=True, jadi bisa kirim field minimal kalau cuma toggle status)
    async updateTemplate(id: number, payload: any) {
      this.isSubmitting = true
      this.clearMessages()

      try {
        const formData = buildTemplateFormData(payload)

        const res = await handleFetch(
          `${BASE_URL}/api/letter_templates/${id}/`,
          {
            method: 'PUT',
            body: formData,
            headers: buildAuthHeaders(),
          }
        )

        if (!res.ok) {
          this.error = res.error || 'Gagal update template'
          return res
        }

        this.successMessage = res.message || 'Berhasil update template'
        return res
      } catch {
        this.error = 'Terjadi kesalahan saat update'
        return { ok: false }
      } finally {
        this.isSubmitting = false
      }
    },

    async toggleTemplateStatus(id: number, isActive: boolean) {
      return this.updateTemplate(id, { is_active: isActive })
    },

    // fetch list dengan optional params (search, filter, pagination)
    async fetchTemplates(params: any = {}) {
      this.isFetching = true
      this.error = ''

      try {
        const searchParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
          }
        })

        const res = await handleFetch(
          `${BASE_URL}/api/letter_templates/?${searchParams.toString()}`,
          {
            method: 'GET',
            headers: buildAuthHeaders(),
          }
        )

        if (!res.ok) {
          this.error = res.error || 'Gagal fetch templates'
          this.templates = []
          this.pagination = null
          return res
        }

        this.templates = res.data || []
        this.pagination = res.pagination || null

        return res
      } catch {
        this.error = 'Terjadi kesalahan saat fetch'
        return { ok: false }
      } finally {
        this.isFetching = false
      }
    },

    // fetch detail by id
    async fetchTemplateDetail(id: number) {
      this.isFetchingDetail = true
      this.error = ''

      try {
        const res = await handleFetch(
          `${BASE_URL}/api/letter_templates/${id}/`,
          {
            method: 'GET',
            headers: buildAuthHeaders(),
          }
        )

        if (!res.ok) {
          this.error = res.error || 'Gagal fetch detail'
          return res
        }

        this.selectedTemplate = res.data
        return res
      } catch {
        this.error = 'Terjadi kesalahan saat fetch detail'
        return { ok: false }
      } finally {
        this.isFetchingDetail = false
      }
    },

    // delete template by id
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
          this.error = res.error || 'Gagal delete template'
          return res
        }

        this.successMessage = res.message || 'Berhasil delete template'
        return res
      } catch {
        this.error = 'Terjadi kesalahan saat delete'
        return { ok: false }
      } finally {
        this.isDeleting = false
      }
    },
  },
})