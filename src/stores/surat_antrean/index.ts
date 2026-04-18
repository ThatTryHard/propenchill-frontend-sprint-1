import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export interface SuratAntrean {
  id_surat: number
  id_pengajuan?: number
  nomor_surat: string | null
  perihal?: string
  perkara: string
  deskripsi: string
  description?: string
  kategori: string
  template_id?: number | null
  template_nama?: string
  template_jenis?: string
  siswa_nama?: string
  klasifikasi?: string
  form_data?: Record<string, unknown> | null
  parsed_variables?: string[]
  filled_variables?: Record<string, unknown>
  latest_verification_note?: string
  latest_rejection_note?: string
  nama_pengaju: string
  tanggal_pengajuan: string
  status:
  | 'Diproses'
  | 'Menunggu Verifikasi Kepsek'
  | 'Disetujui'
  | 'Ditolak'
  file_surat?: string | null
  created_at?: string
  next_level?: number | null
  [key: string]: unknown
}

export type VerifyDecision = 'Approve' | 'Reject'

function mapBackendStatusToUi(status: string | null | undefined): SuratAntrean['status'] {
  const normalized = String(status || '').toLowerCase()

  if (
    [
      'menunggu verifikasi kepsek',
      'menunggu_verifikasi_kepsek',
      'waiting principal verification',
      'waiting_principal_verification',
    ].includes(normalized)
  ) {
    return 'Menunggu Verifikasi Kepsek'
  }

  if (['pending', 'diproses', 'in review', 'in_review'].includes(normalized)) {
    return 'Diproses'
  }

  if (['verified', 'disetujui', 'approved', 'selesai'].includes(normalized)) {
    return 'Disetujui'
  }

  if (['rejected', 'ditolak', 'perlu_revisi'].includes(normalized)) {
    return 'Ditolak'
  }

  return 'Diproses'
}

function normalizeSurat(raw: Record<string, any>): SuratAntrean {
  return {
    ...raw,
    id_surat: Number(raw.id_surat ?? raw.id_pengajuan ?? raw.id ?? 0),
    id_pengajuan: Number(raw.id_pengajuan ?? raw.id_surat ?? raw.id ?? 0),
    nomor_surat: raw.nomor_surat ?? null,
    perihal: raw.perihal ?? raw.template_nama ?? raw.perkara ?? '',
    perkara: raw.perkara ?? raw.perihal ?? raw.template_nama ?? '',
    deskripsi: raw.deskripsi ?? raw.description ?? '',
    description: raw.description ?? raw.deskripsi ?? '',
    kategori: raw.kategori ?? raw.template_jenis ?? raw.jenis_surat ?? '-',
    template_id:
      raw.template_id !== undefined && raw.template_id !== null ? Number(raw.template_id) : null,
    template_nama: raw.template_nama ?? raw.perihal ?? raw.perkara ?? '',
    template_jenis: raw.template_jenis ?? raw.kategori ?? raw.jenis_surat ?? '',
    siswa_nama: raw.siswa_nama ?? '',
    klasifikasi: raw.klasifikasi ?? '',
    form_data: raw.form_data ?? null,
    parsed_variables: Array.isArray(raw.parsed_variables) ? raw.parsed_variables : [],
    filled_variables:
      raw.filled_variables && typeof raw.filled_variables === 'object' ? raw.filled_variables : {},
    latest_verification_note: String(raw.latest_verification_note || raw.verification_note || '').trim(),
    latest_rejection_note: String(raw.latest_rejection_note || raw.rejection_note || '').trim(),
    nama_pengaju:
      raw.nama_pengaju ?? raw.siswa_nama ?? raw.nama_pengusul ?? raw.pengaju ?? '-',
    tanggal_pengajuan:
      raw.tanggal_pengajuan ?? raw.created_at ?? raw.updated_at ?? new Date().toISOString(),
    // `status` from serializer is role-aware (per logged-in user).
    // Keep `status_surat` only as fallback to avoid mixing global final status.
    status: mapBackendStatusToUi(raw.status ?? raw.status_surat),
    file_surat: raw.file_surat ?? raw.file_lampiran ?? null,
    next_level:
      raw.next_level !== undefined && raw.next_level !== null
        ? Number(raw.next_level)
        : null,
  }
}

export const useSuratAntreanStore = defineStore('surat-antrean', {
  state: () => ({
    suratList: [] as SuratAntrean[],
    selectedSurat: null as SuratAntrean | null,
    loading: false,
    detailLoading: false,
    actionLoading: false,
    stats: {
      total: 0,
      diproses: 0,
      disetujui: 0,
      ditolak: 0
    },
    pagination: {
      total_data: 0,
      halaman_saat_ini: 1
    }
  }),

  actions: {
    async fetchAntreanList(page = 1) {
      this.loading = true
      try {
        const response = await api.get('/api/antrean/letters/queue/', { params: { page } })

        // Handle different response structures
        const responseData = response.data
        let rawData: Record<string, any>[] = []

        // Try multiple possible data paths
        if (Array.isArray(responseData?.data)) {
          rawData = responseData.data
        } else if (Array.isArray(responseData?.results)) {
          rawData = responseData.results
        } else if (Array.isArray(responseData)) {
          rawData = responseData
        }

        const allData = rawData.map((item: Record<string, any>) => normalizeSurat(item))

        // Sort FIFO (First In First Out) - oldest first
        allData.sort((a: SuratAntrean, b: SuratAntrean) => {
          const dateA = new Date(a.created_at || a.tanggal_pengajuan).getTime()
          const dateB = new Date(b.created_at || b.tanggal_pengajuan).getTime()
          return dateA - dateB
        })

        this.suratList = allData

        // Hitung stats dari semua data
        this.stats.total = allData.length
        this.stats.diproses = allData.filter((s: SuratAntrean) =>
          s.status === 'Diproses' || s.status === 'Menunggu Verifikasi Kepsek'
        ).length
        this.stats.disetujui = allData.filter((s: SuratAntrean) => s.status === 'Disetujui').length
        this.stats.ditolak = allData.filter((s: SuratAntrean) => s.status === 'Ditolak').length

        // Handle pagination from various possible structures
        const paginationData = responseData?.pagination || responseData
        if (paginationData) {
          this.pagination.total_data = paginationData.total_data || paginationData.count || allData.length
          this.pagination.halaman_saat_ini = paginationData.halaman_saat_ini || paginationData.current_page || page
        }
      } catch (error) {
        console.error('PBI Antrean Error:', error)
        this.suratList = []
        this.stats = { total: 0, diproses: 0, disetujui: 0, ditolak: 0 }
      } finally {
        this.loading = false
      }
    },

    async fetchSuratDetail(id: number) {
      this.detailLoading = true
      this.selectedSurat = null
      try {
        const response = await api.get(`/api/antrean/letters/queue/${id}/`)
        const normalizedDetail = normalizeSurat(response.data?.data || {})

        // Prefer role-aware status from list item when available to avoid mixing with global status.
        const matchedFromList = this.suratList.find(
          (item: SuratAntrean) => item.id_surat === id || item.id_pengajuan === id
        )

        this.selectedSurat = {
          ...normalizedDetail,
          status: matchedFromList?.status || normalizedDetail.status,
        }
      } catch (error) {
        console.error('Fetch Detail Error:', error)
        throw error
      } finally {
        this.detailLoading = false
      }
    },

    async verifySurat(id: number, decision: VerifyDecision, notes?: string) {
      this.actionLoading = true
      try {
        const surat =
          this.selectedSurat ||
          this.suratList.find((item: SuratAntrean) => item.id_surat === id || item.id_pengajuan === id)

        const payload: Record<string, string> = {
          decision,
        }

        const role = String(localStorage.getItem('user_role') || '').toUpperCase()
        const templateJenis = String(surat?.template_jenis || '').toUpperCase()

        const levelOneRoleByJenis: Record<string, string> = {
          KESISWAAN: 'BIDANG_KESISWAAN',
          AKADEMIK: 'BIDANG_AKADEMIK',
          KEAGAMAAN: 'BIDANG_AGAMA',
        }

        const requiredLevelOneRole = levelOneRoleByJenis[templateJenis]

        if (requiredLevelOneRole && role !== 'ADMIN' && role !== 'KEPSEK' && role !== requiredLevelOneRole) {
          throw new Error('Anda tidak memiliki akses verifikasi untuk jenis template ini.')
        }

        if (notes && notes.trim()) {
          payload.notes = notes.trim()
        }

        const response = await api.put(`/api/letters/${id}/verify`, payload)

        const currentPage = this.pagination.halaman_saat_ini || 1
        await Promise.allSettled([this.fetchAntreanList(currentPage), this.fetchSuratDetail(id)])

        return response.data
      } catch (error) {
        console.error('Verify Error:', error)
        throw error
      } finally {
        this.actionLoading = false
      }
    },

    async approveSurat(id: number, notes?: string) {
      return this.verifySurat(id, 'Approve', notes)
    },

    async rejectSurat(id: number, reason: string) {
      return this.verifySurat(id, 'Reject', reason)
    },

    clearSelectedSurat() {
      this.selectedSurat = null
    }
  }
})