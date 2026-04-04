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
  pengirim: {
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
    created_at: string
    deleted_at: string | null
  }
}

type ApiErrorMap = Record<string, string>

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
    const pengirimError = payload.pengirim
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

export const useSuratMasukStore = defineStore('surat-masuk', {
  state: () => ({
    pengirimList: [] as Pengirim[],
    loadingPengirim: false,
    submitting: false,
    error: '' as string,
  }),

  actions: {
    async fetchPengirim() {
      this.loadingPengirim = true
      this.error = ''

      try {
        const response = await api.get('/api/pengirim')
        const data = Array.isArray(response.data) ? response.data : response.data?.data
        this.pengirimList = Array.isArray(data) ? data : []
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
        const response = await api.post<SuratMasukResponse>('/api/surat-masuk', payload)
        return response.data
      } catch (error: any) {
        const normalizedErrors = normalizeCreateErrors(error)
        this.error = normalizedErrors.general || 'Gagal menyimpan data Surat Masuk.'
        throw normalizedErrors
      } finally {
        this.submitting = false
      }
    },
  },
})
