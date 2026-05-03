import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export interface DashboardSummary {
  total_surat: number
  tingkat_penyelesaian: number
  menunggu_persetujuan: number
  rata_rata_waktu_proses: number
}

export interface DistribusiJenisSurat {
  izin: number
  tugas: number
  keterangan: number
  undangan: number
  pengajuan: number
}

export interface TrendWaktuItem {
  bulan: string
  surat_masuk: number
  surat_keluar: number
}

export interface PerbandinganPeranItem {
  role: string
  surat_masuk: number
  surat_keluar: number
  disetujui: number
  ditolak: number
}

export interface StatusSurat {
  disetujui: number
  diproses: number
  ditolak: number
  menunggu: number
}

export interface ApprovalRateItem {
  nama: string
  role: string
  approval_rate: number
  jumlah_approve: number
  jumlah_tolak: number
}

export interface FlowSummary {
  surat_masuk: number
  surat_keluar: number
}

export interface FlowPerBidang {
  akademik: FlowSummary
  kesiswaan: FlowSummary
  keagamaan: FlowSummary
}

export interface SuratPendingItem {
  id?: number
  id_surat?: number
  nomor_surat: string
  verifikator: string
  tanggal_diterima: string
  pengirim: string
  jenis_surat: string
  status: string
}

export interface PendingPagination {
  total_data: number
  total_halaman: number
  halaman_saat_ini: number
  limit: number
}

const emptySummary: DashboardSummary = {
  total_surat: 0,
  tingkat_penyelesaian: 0,
  menunggu_persetujuan: 0,
  rata_rata_waktu_proses: 0,
}

const emptyDistribusi: DistribusiJenisSurat = {
  izin: 0,
  tugas: 0,
  keterangan: 0,
  undangan: 0,
  pengajuan: 0,
}

const emptyStatus: StatusSurat = {
  disetujui: 0,
  diproses: 0,
  ditolak: 0,
  menunggu: 0,
}

const emptyFlow: FlowSummary = {
  surat_masuk: 0,
  surat_keluar: 0,
}

const emptyFlowPerBidang: FlowPerBidang = {
  akademik: { ...emptyFlow },
  kesiswaan: { ...emptyFlow },
  keagamaan: { ...emptyFlow },
}

const emptyPagination: PendingPagination = {
  total_data: 0,
  total_halaman: 1,
  halaman_saat_ini: 1,
  limit: 10,
}

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const mapStatusLabel = (value: string | null | undefined) => {
  const normalized = String(value || '').toLowerCase()
  if (normalized.includes('menunggu')) return 'Menunggu Verifikasi Kepsek'
  if (normalized.includes('ditolak')) return 'Ditolak'
  if (normalized.includes('disetujui')) return 'Disetujui'
  if (normalized.includes('diproses')) return 'Diproses'
  return value ? String(value) : '-'
}

export const usePrincipalDashboardStore = defineStore('principal-dashboard', {
  state: () => ({
    summary: { ...emptySummary } as DashboardSummary,
    distribusiJenisSurat: { ...emptyDistribusi } as DistribusiJenisSurat,
    trendWaktu: [] as TrendWaktuItem[],
    perbandinganPeran: [] as PerbandinganPeranItem[],
    statusSurat: { ...emptyStatus } as StatusSurat,
    approvalRate: [] as ApprovalRateItem[],
    flowWaliMurid: { ...emptyFlow } as FlowSummary,
    flowPerBidang: { ...emptyFlowPerBidang } as FlowPerBidang,
    pendingLetters: [] as SuratPendingItem[],
    pendingPagination: { ...emptyPagination } as PendingPagination,
    loading: {
      dashboard: false,
      pending: false,
    },
    error: '',
  }),

  actions: {
    setError(message: string) {
      this.error = message
    },

    async fetchSummary() {
      try {
        const response = await api.get('/api/kepsek/dashboard/summary')
        const payload = response.data?.data || {}
        this.summary = {
          total_surat: toNumber(payload.total_surat),
          tingkat_penyelesaian: toNumber(payload.tingkat_penyelesaian),
          menunggu_persetujuan: toNumber(payload.menunggu_persetujuan),
          rata_rata_waktu_proses: toNumber(payload.rata_rata_waktu_proses),
        }
      } catch (error) {
        this.summary = { ...emptySummary }
        this.setError('Gagal memuat ringkasan dashboard.')
        throw error
      }
    },

    async fetchDistribusiJenisSurat() {
      try {
        const response = await api.get('/api/kepsek/dashboard/distribusi-jenis-surat')
        const payload = response.data?.data || {}
        this.distribusiJenisSurat = {
          izin: toNumber(payload.izin),
          tugas: toNumber(payload.tugas),
          keterangan: toNumber(payload.keterangan),
          undangan: toNumber(payload.undangan),
          pengajuan: toNumber(payload.pengajuan),
        }
      } catch (error) {
        this.distribusiJenisSurat = { ...emptyDistribusi }
        this.setError('Gagal memuat distribusi jenis surat.')
        throw error
      }
    },

    async fetchTrendWaktu() {
      try {
        const response = await api.get('/api/kepsek/dashboard/trend-waktu')
        const payload = response.data?.data || []
        this.trendWaktu = Array.isArray(payload)
          ? payload.map((item: TrendWaktuItem) => ({
              bulan: String(item.bulan || ''),
              surat_masuk: toNumber(item.surat_masuk),
              surat_keluar: toNumber(item.surat_keluar),
            }))
          : []
      } catch (error) {
        this.trendWaktu = []
        this.setError('Gagal memuat trend waktu.')
        throw error
      }
    },

    async fetchPerbandinganPeran() {
      try {
        const response = await api.get('/api/kepsek/dashboard/perbandingan-peran')
        const payload = response.data?.data || []
        this.perbandinganPeran = Array.isArray(payload)
          ? payload.map((item: PerbandinganPeranItem) => ({
              role: String(item.role || ''),
              surat_masuk: toNumber(item.surat_masuk),
              surat_keluar: toNumber(item.surat_keluar),
              disetujui: toNumber(item.disetujui),
              ditolak: toNumber(item.ditolak),
            }))
          : []
      } catch (error) {
        this.perbandinganPeran = []
        this.setError('Gagal memuat perbandingan peran.')
        throw error
      }
    },

    async fetchStatusSurat() {
      try {
        const response = await api.get('/api/kepsek/dashboard/status-surat')
        const payload = response.data?.data || {}
        this.statusSurat = {
          disetujui: toNumber(payload.disetujui),
          diproses: toNumber(payload.diproses),
          ditolak: toNumber(payload.ditolak),
          menunggu: toNumber(payload.menunggu),
        }
      } catch (error) {
        this.statusSurat = { ...emptyStatus }
        this.setError('Gagal memuat status surat.')
        throw error
      }
    },

    async fetchApprovalRate() {
      try {
        const response = await api.get('/api/kepsek/dashboard/approval-rate')
        const payload = response.data?.data || []
        this.approvalRate = Array.isArray(payload)
          ? payload.map((item: ApprovalRateItem) => ({
              nama: String(item.nama || '-'),
              role: String(item.role || '-'),
              approval_rate: toNumber(item.approval_rate),
              jumlah_approve: toNumber(item.jumlah_approve),
              jumlah_tolak: toNumber(item.jumlah_tolak),
            }))
          : []
      } catch (error) {
        this.approvalRate = []
        this.setError('Gagal memuat approval rate.')
        throw error
      }
    },

    async fetchFlowWaliMurid() {
      try {
        const response = await api.get('/api/kepsek/dashboard/flow-wali-murid')
        const payload = response.data?.data || {}
        this.flowWaliMurid = {
          surat_masuk: toNumber(payload.surat_masuk),
          surat_keluar: toNumber(payload.surat_keluar),
        }
      } catch (error) {
        this.flowWaliMurid = { ...emptyFlow }
        this.setError('Gagal memuat flow wali murid.')
        throw error
      }
    },

    async fetchFlowPerBidang() {
      try {
        const response = await api.get('/api/kepsek/dashboard/flow-per-bidang')
        const payload = response.data?.data || {}
        this.flowPerBidang = {
          akademik: {
            surat_masuk: toNumber(payload.akademik?.surat_masuk),
            surat_keluar: toNumber(payload.akademik?.surat_keluar),
          },
          kesiswaan: {
            surat_masuk: toNumber(payload.kesiswaan?.surat_masuk),
            surat_keluar: toNumber(payload.kesiswaan?.surat_keluar),
          },
          keagamaan: {
            surat_masuk: toNumber(payload.keagamaan?.surat_masuk),
            surat_keluar: toNumber(payload.keagamaan?.surat_keluar),
          },
        }
      } catch (error) {
        this.flowPerBidang = { ...emptyFlowPerBidang }
        this.setError('Gagal memuat flow per bidang.')
        throw error
      }
    },

    async fetchSuratPending(page = 1) {
      this.loading.pending = true
      try {
        const response = await api.get('/api/kepsek/dashboard/surat-pending', { params: { page } })
        const payload = response.data?.data || {}
        const rawResults = Array.isArray(payload.results) ? payload.results : []

        this.pendingLetters = rawResults.map((item: SuratPendingItem) => {
          const rawId = (item as any).id ?? (item as any).id_surat
          const parsedId = Number(rawId)
          const resolvedId = Number.isFinite(parsedId) ? parsedId : undefined

          return {
            id: resolvedId,
            id_surat: resolvedId,
            nomor_surat: String(item.nomor_surat || '-'),
            verifikator: String(item.verifikator || '-'),
            tanggal_diterima: String(item.tanggal_diterima || ''),
            pengirim: String(item.pengirim || '-'),
            jenis_surat: String(item.jenis_surat || '-'),
            status: mapStatusLabel(item.status),
          }
        })

        const pagination = payload.pagination || {}
        this.pendingPagination = {
          total_data: toNumber(pagination.total_data, this.pendingLetters.length),
          total_halaman: toNumber(pagination.total_halaman, 1),
          halaman_saat_ini: toNumber(pagination.halaman_saat_ini, page),
          limit: toNumber(pagination.limit, 10),
        }
      } catch (error) {
        this.pendingLetters = []
        this.pendingPagination = { ...emptyPagination }
        this.setError('Gagal memuat daftar surat pending.')
        throw error
      } finally {
        this.loading.pending = false
      }
    },

    async fetchDashboardData() {
      this.loading.dashboard = true
      this.setError('')
      try {
        await Promise.all([
          this.fetchSummary(),
          this.fetchTrendWaktu(),
          this.fetchDistribusiJenisSurat(),
          this.fetchPerbandinganPeran(),
          this.fetchStatusSurat(),
          this.fetchApprovalRate(),
          this.fetchFlowWaliMurid(),
          this.fetchFlowPerBidang(),
        ])
      } finally {
        this.loading.dashboard = false
      }
    },

    async fetchPendingPageData(page = 1) {
      this.setError('')
      await Promise.allSettled([
        this.fetchSuratPending(page),
        this.fetchDistribusiJenisSurat(),
        this.fetchFlowPerBidang(),
      ])
    },
  },
})
