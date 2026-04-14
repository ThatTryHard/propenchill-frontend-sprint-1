import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export interface SuratAntrean {
  id_surat: number
  nomor_surat: string | null
  perkara: string
  deskripsi: string
  kategori: string
  nama_pengaju: string
  tanggal_pengajuan: string
  status: 'Diproses' | 'Disetujui' | 'Ditolak'
  file_surat?: string | null
  created_at?: string
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
        const response = await api.get('/api/letters/queue/', { params: { page } })
        const allData = response.data.data || []

        // Sort FIFO (First In First Out) - oldest first
        allData.sort((a: SuratAntrean, b: SuratAntrean) => {
          const dateA = new Date(a.created_at || a.tanggal_pengajuan).getTime()
          const dateB = new Date(b.created_at || b.tanggal_pengajuan).getTime()
          return dateA - dateB
        })

        // Ambil semua data (frontend akan filter berdasarkan status)
        this.suratList = allData

        // Hitung stats dari semua data
        this.stats.total = allData.length
        this.stats.diproses = allData.filter((s: SuratAntrean) => s.status === 'Diproses').length
        this.stats.disetujui = allData.filter((s: SuratAntrean) => s.status === 'Disetujui').length
        this.stats.ditolak = allData.filter((s: SuratAntrean) => s.status === 'Ditolak').length

        if (response.data.pagination) {
          this.pagination.total_data = response.data.pagination.total_data
          this.pagination.halaman_saat_ini = response.data.pagination.halaman_saat_ini
        }
      } catch (error) {
        console.error('PBI Antrean Error:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchSuratDetail(id: number) {
      this.detailLoading = true
      this.selectedSurat = null
      try {
        const response = await api.get(`/api/letters/queue/${id}/`)
        this.selectedSurat = response.data.data
      } catch (error) {
        console.error('Fetch Detail Error:', error)
        throw error
      } finally {
        this.detailLoading = false
      }
    },

    async approveSurat(id: number) {
      this.actionLoading = true
      try {
        const response = await api.patch(`/api/letters/queue/${id}/`, {
          status: 'Disetujui'
        })
        const index = this.suratList.findIndex(s => s.id_surat === id)
        if (index !== -1 && this.suratList[index]) {
          this.suratList[index]!.status = 'Disetujui'
        }
        if (this.selectedSurat?.id_surat === id) {
          this.selectedSurat!.status = 'Disetujui'
        }
        // Update stats
        this.stats.total = this.stats.total
        this.stats.diproses = Math.max(0, this.stats.diproses - 1)
        this.stats.disetujui = this.stats.disetujui + 1
        this.stats.ditolak = this.stats.ditolak
        return response.data
      } catch (error) {
        console.error('Approve Error:', error)
        throw error
      } finally {
        this.actionLoading = false
      }
    },

    async rejectSurat(id: number, reason: string) {
      this.actionLoading = true
      try {
        const response = await api.patch(`/api/letters/queue/${id}/`, {
          status: 'Ditolak',
          alasan_penolakan: reason
        })
        // Update local data
        const index = this.suratList.findIndex(s => s.id_surat === id)
        if (index !== -1 && this.suratList[index]) {
          this.suratList[index]!.status = 'Ditolak'
        }
        if (this.selectedSurat?.id_surat === id) {
          this.selectedSurat!.status = 'Ditolak'
        }
        // Update stats
        this.stats.total = this.stats.total
        this.stats.diproses = Math.max(0, this.stats.diproses - 1)
        this.stats.disetujui = this.stats.disetujui
        this.stats.ditolak = this.stats.ditolak + 1
        return response.data
      } catch (error) {
        console.error('Reject Error:', error)
        throw error
      } finally {
        this.actionLoading = false
      }
    },

    clearSelectedSurat() {
      this.selectedSurat = null
    }
  }
})