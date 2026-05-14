import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export type SuratType = 'surat_keluar' | 'surat_masuk'

export interface ActivityLogItem {
  id: number
  created_at: string
  actor_name: string
  actor_role: string
  surat_type: SuratType
  surat_id: number
  action: string
  status_from?: string | null
  status_to?: string | null
  ip_address?: string | null
  metadata?: Record<string, unknown>
  title?: string
  description?: string
}

export interface TimelineResponse {
  items: ActivityLogItem[]
  tahap_paling_lama?: {
    label: string | null
    jumlah_hari_kerja: number
  }
}

interface FetchLogParams {
  surat_type?: SuratType | ''
  surat_id?: number | ''
  action?: string | ''
  status?: string | ''
  actor?: string | ''
}

const toArray = (value: unknown): ActivityLogItem[] => {
  if (Array.isArray(value)) {
    return value as ActivityLogItem[]
  }

  if (value && typeof value === 'object') {
    const payload = value as { data?: ActivityLogItem[]; items?: ActivityLogItem[] }
    if (Array.isArray(payload.data)) {
      return payload.data
    }
    if (Array.isArray(payload.items)) {
      return payload.items
    }
  }

  return []
}

export const useActivityLogsStore = defineStore('activity-logs', {
  state: () => ({
    logs: [] as ActivityLogItem[],
    timeline: [] as ActivityLogItem[],
    longestStage: null as TimelineResponse['tahap_paling_lama'] | null,
    loading: false,
    detailLoading: false,
  }),

  actions: {
    async fetchLogs(params: FetchLogParams = {}) {
      this.loading = true
      try {
        const queryParams: Record<string, string | number> = {}

        if (params.surat_type) queryParams.surat_type = params.surat_type
        if (params.surat_id) queryParams.surat_id = params.surat_id
        if (params.action) queryParams.action = params.action
        if (params.status) queryParams.status = params.status
        if (params.actor) queryParams.actor = params.actor

        const response = await api.get('/api/activity-logs/', { params: queryParams })
        this.logs = toArray(response.data)
      } catch (error) {
        console.error('Gagal mengambil activity logs:', error)
        this.logs = []
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTimeline(suratType: SuratType, suratId: number) {
      this.detailLoading = true
      this.timeline = []
      this.longestStage = null

      try {
        const response = await api.get(`/api/activity-logs/timeline/${suratType}/${suratId}/`)
        const payload = response.data as TimelineResponse
        this.timeline = Array.isArray(payload?.items) ? payload.items : []
        this.longestStage = payload?.tahap_paling_lama || null
      } catch (error) {
        console.error('Gagal mengambil timeline activity logs:', error)
        this.timeline = []
        this.longestStage = null
        throw error
      } finally {
        this.detailLoading = false
      }
    },
  },
})
