import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export interface Pengirim {
  id_pengirim?: number
  nama_instansi: string
  alamat?: string | null
  kontak?: string | null
}

export interface SuratMasukPayload {
  nomor_surat_pengirim: string
  tanggal_surat: string
  tanggal_terima: string
  perihal: string
  jenis_surat?: string
  file_lampiran?: File | null
  pengirim: {
    id_pengirim?: number
    nama_instansi: string
    alamat?: string
    kontak?: string
  }
}

export interface SuratMasukResponse {
  message: string
  data: {
    id_surat_masuk: number
    nomor_agenda: number
    nomor_surat_pengirim: string
    nomor_surat_sistem: string | null
    tanggal_surat: string
    tanggal_terima: string
    perihal: string
    jenis_surat: string | null
    status: string
    pengirim: Pengirim
    pencatat_id: number | null
    pencatat_nama: string
    disposisi_terakhir: {
      from_user_nama: string
      instruksi: string
      sifat: string
      created_at: string
    } | null
    created_at: string
    deleted_at: string | null
    file_lampiran: string | null
  }
}

type ApiErrorMap = Record<string, string>

type UnknownRecord = Record<string, unknown>

const firstError = (value: unknown): string => {
  if (Array.isArray(value) && value.length > 0) {
    return String(value[0])
  }
  return typeof value === 'string' ? value : 'Terjadi kesalahan validasi.'
}

const normalizeCreateErrors = (error: any): ApiErrorMap => {
  const payload = error?.response?.data
  const errors: ApiErrorMap = {}

  if (!payload || typeof payload !== 'object') {
    errors.general = error?.message || 'Gagal menyimpan data Surat Masuk.'
    return errors
  }

  if (payload.error) {
    errors.general = String(payload.error)
  }

  if (payload.nomor_surat_pengirim) {
    errors.nomor_surat_pengirim = firstError(payload.nomor_surat_pengirim)
  }

  if (payload.tanggal_surat) {
    errors.tanggal_surat = firstError(payload.tanggal_surat)
  }

  if (payload.tanggal_terima) {
    errors.tanggal_terima = firstError(payload.tanggal_terima)
  }

  if (payload.perihal) {
    errors.perihal = firstError(payload.perihal)
  }

  if (payload.pengirim && typeof payload.pengirim === 'object') {
    const pengirimError = payload.pengirim as any
    if (pengirimError.nama_instansi) {
      errors.nama_instansi = firstError(pengirimError.nama_instansi)
    }
    if (pengirimError.alamat) {
      errors.alamat = firstError(pengirimError.alamat)
    }
    if (pengirimError.kontak) {
      errors.kontak = firstError(pengirimError.kontak)
    }
  }

  if (Object.keys(errors).length === 0) {
    errors.general = 'Gagal menyimpan data Surat Masuk.'
  }

  return errors
}

const toObject = (value: unknown): UnknownRecord => {
  return value && typeof value === 'object' ? (value as UnknownRecord) : {}
}

const extractArrayPayload = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value
  }

  const container = toObject(value)

  if (Array.isArray(container.data)) {
    return container.data
  }

  if (Array.isArray(container.results)) {
    return container.results
  }

  if (Array.isArray(container.items)) {
    return container.items
  }

  const nestedData = toObject(container.data)
  if (Array.isArray(nestedData.results)) {
    return nestedData.results
  }

  if (Array.isArray(nestedData.items)) {
    return nestedData.items
  }

  return []
}

const toNullableText = (value: unknown): string | null | undefined => {
  if (value === null) {
    return null
  }

  if (value === undefined) {
    return undefined
  }

  const text = String(value).trim()
  return text || undefined
}

const normalizePengirimItem = (value: unknown): Pengirim | null => {
  const raw = toObject(value)
  const namaInstansi =
    toNullableText(raw.nama_instansi) ||
    toNullableText(raw.namaInstansi) ||
    toNullableText(raw.instansi) ||
    toNullableText(raw.nama)

  if (!namaInstansi) {
    return null
  }

  const idCandidate = raw.id_pengirim ?? raw.id ?? raw.pengirim_id
  const idNumber = Number(idCandidate)

  return {
    id_pengirim: Number.isFinite(idNumber) ? idNumber : undefined,
    nama_instansi: namaInstansi,
    alamat: toNullableText(raw.alamat),
    kontak: toNullableText(raw.kontak),
  }
}

const normalizePengirimList = (value: unknown): Pengirim[] => {
  const seen = new Set<string>()
  const result: Pengirim[] = []

  for (const item of extractArrayPayload(value)) {
    const normalized = normalizePengirimItem(item)
    if (!normalized) {
      continue
    }

    const key = normalized.nama_instansi.trim().toLowerCase()
    if (!key || seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push(normalized)
  }

  return result
}

const extractPengirimFromSuratList = (value: unknown): Pengirim[] => {
  const items = extractArrayPayload(value)
  const senders = items.map((item) => toObject(item).pengirim)
  return normalizePengirimList(senders)
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  start_date?: string
  end_date?: string
  status?: string
}

export interface DisposisiPayload {
  target_role: string
  instruksi: string
  sifat: string
}

export const useSuratMasukStore = defineStore('surat-masuk', {
  state: () => ({
    pengirimList: [] as Pengirim[],
    loadingPengirim: false,
    submitting: false,
    error: '' as string,

    suratList: [] as SuratMasukResponse['data'][],
    pagination: {
      total_data: 0,
      total_halaman: 1,
      halaman_saat_ini: 1,
      limit: 10,
    },
    loadingList: false,

    suratDetail: null as SuratMasukResponse['data'] | null,
    loadingDetail: false,

    submittingDisposisi: false,
    deleting: false,
  }),

  actions: {
    async fetchPengirim() {
      this.loadingPengirim = true
      this.error = ''

      try {
        const listResponse = await api.get('/api/surat-masuk/list/', {
          params: { page: 1, limit: 200 },
        })
        this.pengirimList = extractPengirimFromSuratList(listResponse.data)
      } catch (error: any) {
        this.error = error?.response?.data?.error || 'Gagal memuat data pengirim.'
        this.pengirimList = []
      } finally {
        this.loadingPengirim = false
      }
    },

    async createSuratMasuk(payload: SuratMasukPayload) {
      this.submitting = true
      this.error = ''

      try {
        const formData = new FormData()
        formData.append('nomor_surat_pengirim', payload.nomor_surat_pengirim)
        formData.append('tanggal_surat', payload.tanggal_surat)
        formData.append('tanggal_terima', payload.tanggal_terima)
        formData.append('perihal', payload.perihal)

        if (payload.jenis_surat) {
          formData.append('jenis_surat', payload.jenis_surat)
        }

        formData.append('pengirim', JSON.stringify(payload.pengirim))

        if (payload.file_lampiran) {
          formData.append('file_lampiran', payload.file_lampiran)
        }

        const response = await api.post<SuratMasukResponse>('/api/surat-masuk', formData)
        return response.data
      } catch (error: any) {
        const normalizedErrors = normalizeCreateErrors(error)
        this.error = normalizedErrors.general || 'Gagal menyimpan data Surat Masuk.'
        throw normalizedErrors
      } finally {
        this.submitting = false
      }
    },

    // PBI-13: GET List Surat Masuk
    async fetchSuratMasukList(params: PaginationParams = {}) {
      this.loadingList = true
      this.error = ''
      try {
        const response = await api.get('/api/surat-masuk/list/', { params })
        this.suratList = response.data.data || []
        if (response.data.pagination) {
          this.pagination = response.data.pagination
        }
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.error || 'Gagal memuat daftar arsip surat masuk.'
        throw error
      } finally {
        this.loadingList = false
      }
    },

    // PBI-15 (Part 1): GET Detail Surat
    async fetchSuratMasukDetail(id: number | string) {
      this.loadingDetail = true
      this.error = ''
      this.suratDetail = null
      try {
        const response = await api.get(`/api/surat-masuk/${id}/`)
        this.suratDetail = response.data.data || response.data
        return this.suratDetail
      } catch (error: any) {
        this.error = error?.response?.data?.error || 'Gagal memuat detail surat.'
        throw error
      } finally {
        this.loadingDetail = false
      }
    },

    // PBI-14: DELETE (Soft Delete) Surat
    async deleteSuratMasuk(id: number | string) {
      this.deleting = true
      this.error = ''
      try {
        const response = await api.delete(`/api/surat-masuk/${id}/`)
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.error || 'Gagal menghapus data surat masuk.'
        throw error
      } finally {
        this.deleting = false
      }
    },

    // PBI-15 (Part 2): POST Disposisi
    async submitDisposisi(id: number | string, payload: DisposisiPayload) {
      this.submittingDisposisi = true
      this.error = ''
      try {
        const response = await api.post(`/api/surat-masuk/${id}/disposition/`, payload)
        return response.data
      } catch (error: any) {
        this.error = error?.response?.data?.error || 'Gagal memproses disposisi.'
        throw error
      } finally {
        this.submittingDisposisi = false
      }
    },
  },
})
