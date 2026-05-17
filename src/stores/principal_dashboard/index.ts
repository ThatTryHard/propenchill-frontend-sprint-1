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

export interface DistribusiSuratPending {
  akademik: number
  kesiswaan: number
  keagamaan: number
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

export interface PendingDurasi {
  kurang_dari_3_hari: number
  antara_3_7_hari: number
  lebih_dari_7_hari: number
  total_pending: number
}

export interface StatusSuratKeluar {
  disetujui: number
  menunggu_kepsek: number
  ditolak: number
  menunggu_wakil_bidang: number
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
  id_pengajuan: number
  nomor_surat: string
  verifikator: string
  tanggal_diterima: string
  pengirim: string
  jenis_surat: string
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

const emptyDistribusiPending: DistribusiSuratPending = {
  akademik: 0,
  kesiswaan: 0,
  keagamaan: 0,
}

const emptyPendingDurasi: PendingDurasi = {
  kurang_dari_3_hari: 0,
  antara_3_7_hari: 0,
  lebih_dari_7_hari: 0,
  total_pending: 0,
}

const emptyStatusKeluar: StatusSuratKeluar = {
  disetujui: 0,
  menunggu_kepsek: 0,
  ditolak: 0,
  menunggu_wakil_bidang: 0,
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

export const usePrincipalDashboardStore = defineStore('principal-dashboard', {
  state: () => ({
    summary: { ...emptySummary } as DashboardSummary,
    distribusiJenisSurat: { ...emptyDistribusi } as DistribusiJenisSurat,
    distribusiSuratPending: { ...emptyDistribusiPending } as DistribusiSuratPending,
    trendWaktu: [] as TrendWaktuItem[],
    perbandinganPeran: [] as PerbandinganPeranItem[],
    pendingDurasi: { ...emptyPendingDurasi } as PendingDurasi,
    statusSuratKeluar: { ...emptyStatusKeluar } as StatusSuratKeluar,
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

    async fetchDistribusiSuratPending() {
      try {
        const response = await api.get('/api/kepsek/dashboard/distribusi-surat-pending')
        const payload = response.data?.data || {}
        this.distribusiSuratPending = {
          akademik: toNumber(payload.akademik),
          kesiswaan: toNumber(payload.kesiswaan),
          keagamaan: toNumber(payload.keagamaan),
        }
      } catch (error) {
        this.distribusiSuratPending = { ...emptyDistribusiPending }
        this.setError('Gagal memuat distribusi surat pending.')
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

    async fetchPendingDurasi() {
      try {
        const response = await api.get('/api/kepsek/dashboard/status-surat/pending-durasi')
        const payload = response.data?.data || {}
        this.pendingDurasi = {
          kurang_dari_3_hari: toNumber(payload.kurang_dari_3_hari),
          antara_3_7_hari: toNumber(payload.antara_3_7_hari),
          lebih_dari_7_hari: toNumber(payload.lebih_dari_7_hari),
          total_pending: toNumber(payload.total_pending),
        }
      } catch (error) {
        this.pendingDurasi = { ...emptyPendingDurasi }
        this.setError('Gagal memuat status surat pending berdasarkan durasi.')
        throw error
      }
    },

    async fetchStatusSuratKeluar() {
      try {
        const response = await api.get('/api/kepsek/dashboard/status-surat/keluar')
        const payload = response.data?.data || {}
        this.statusSuratKeluar = {
          disetujui: toNumber(payload.disetujui),
          menunggu_kepsek: toNumber(payload.menunggu_kepsek),
          ditolak: toNumber(payload.ditolak),
          menunggu_wakil_bidang: toNumber(payload.menunggu_wakil_bidang),
        }
      } catch (error) {
        this.statusSuratKeluar = { ...emptyStatusKeluar }
        this.setError('Gagal memuat status surat keluar.')
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

        this.pendingLetters = rawResults.map((item: SuratPendingItem) => ({
          id_pengajuan: toNumber(item.id_pengajuan),
          nomor_surat: String(item.nomor_surat || '-'),
          verifikator: String(item.verifikator || '-'),
          tanggal_diterima: String(item.tanggal_diterima || ''),
          pengirim: String(item.pengirim || '-'),
          jenis_surat: String(item.jenis_surat || '-'),
        }))

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
          this.fetchPendingDurasi(),
          this.fetchStatusSuratKeluar(),
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
        this.fetchDistribusiSuratPending(),
        this.fetchPendingDurasi(),
      ])
    },
  },
})
