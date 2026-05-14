<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <div class="w-full min-h-screen bg-[var(--app-bg)] p-8 max-[768px]:px-4 flex flex-col gap-6 font-sans">
      <section class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
          <VActionButton variant="secondary" @click="goBack">Kembali</VActionButton>
          <div>
            <h1 class="m-0 text-[28px] leading-[120%] font-extrabold text-[var(--app-heading)]">
              Detail Informasi Surat
            </h1>
            <p class="mt-1 mb-0 text-[16px] leading-[140%] text-[var(--app-subtext)]">
              Berikut detail informasi surat
            </p>
          </div>
        </div>
      </section>

      <div class="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[24px] p-6 shadow-sm">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-[12px] bg-gradient-to-r from-[var(--app-accent)] to-[var(--app-accent-2)] flex items-center justify-center text-[var(--app-text-inverse)] font-bold">
                SM
              </div>
              <div>
                <h2 class="m-0 text-[20px] font-bold text-[var(--app-text)]">
                  {{ suratInfo.title }}
                </h2>
                <p class="m-0 text-[14px] text-[var(--app-subtext)]">ID: {{ suratInfo.id }}</p>
              </div>
            </div>
          </div>
          <VChip :label="suratInfo.status" :variant="statusChipVariant" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 text-[14px] text-[var(--app-subtext)]">
          <div v-for="field in suratInfo.fields" :key="field.label">
            <p class="m-0 text-[var(--app-muted)] font-semibold">{{ field.label }}</p>
            <p class="m-0 text-[16px] font-semibold text-[var(--app-heading)]">{{ field.value }}</p>
          </div>
        </div>
      </div>

      <div class="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[24px] p-6 shadow-sm">
        <h3 class="m-0 text-[20px] font-bold text-[var(--app-text)]">Ringkasan Log</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div>
            <p class="m-0 text-[var(--app-muted)] font-semibold">Total Aktivitas</p>
            <p class="m-0 text-[24px] font-extrabold text-[var(--app-text)]">{{ summary.total }}</p>
          </div>
          <div>
            <p class="m-0 text-[var(--app-muted)] font-semibold">Durasi Proses</p>
            <p class="m-0 text-[24px] font-extrabold text-[var(--app-text)]">{{ summary.duration }}</p>
          </div>
          <div>
            <p class="m-0 text-[var(--app-muted)] font-semibold">Pengguna Terlibat</p>
            <p class="m-0 text-[24px] font-extrabold text-[var(--app-text)]">{{ summary.uniqueUsers }}</p>
          </div>
        </div>
        <div v-if="summary.longestStage" class="mt-4 text-[14px] text-[var(--app-subtext)]">
          Tahap paling lama: <strong>{{ summary.longestStage }}</strong>
        </div>
      </div>

      <div class="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[24px] p-6 shadow-sm">
        <div class="flex items-center justify-between">
          <h3 class="m-0 text-[20px] font-bold text-[var(--app-text)]">Timeline Aktivitas Real-Time</h3>
        </div>

        <div v-if="logsStore.detailLoading" class="py-10 text-center text-[var(--app-subtext)]">
          Memuat timeline...
        </div>

        <div v-else-if="timelineItems.length === 0" class="py-10 text-center text-[var(--app-subtext)]">
          Belum ada aktivitas yang tercatat.
        </div>

        <div v-else class="mt-6 flex flex-col gap-6">
          <div v-for="(item, index) in timelineItems" :key="item.id" class="flex gap-6">
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-full bg-[var(--app-soft-card)] border-2 border-[var(--app-accent)] flex items-center justify-center text-[var(--app-accent)] font-bold">
                {{ index + 1 }}
              </div>
              <div
                v-if="index < timelineItems.length - 1"
                class="w-[6px] flex-1 bg-gradient-to-b from-[var(--app-accent)] to-[var(--app-accent-2)] rounded-full mt-2"
              ></div>
            </div>

            <VCard class="flex-1" paddingClass="p-6">
              <div class="flex flex-col gap-3">
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h4 class="m-0 text-[18px] font-bold text-[var(--app-text)]">
                      {{ item.title || getActionLabel(item) }}
                    </h4>
                    <p class="m-0 text-[13px] text-[var(--app-muted)]">{{ formatDateTime(item.created_at) }}</p>
                  </div>
                  <VChip :label="formatStatus(item)" :variant="getStatusVariant(item)" />
                </div>

                <div class="flex items-center gap-3 text-[13px] text-[var(--app-subtext)]">
                  <div class="w-8 h-8 rounded-full bg-[var(--app-soft-card)] flex items-center justify-center text-[12px] font-semibold">
                    {{ getInitials(item.actor_name) }}
                  </div>
                  <div>
                    <p class="m-0 text-[14px] font-semibold text-[var(--app-text)]">
                      {{ item.actor_name || 'Sistem' }}
                    </p>
                    <p class="m-0 text-[12px] text-[var(--app-muted)]">{{ item.actor_role || '-' }}</p>
                  </div>
                </div>

                <div class="text-[14px] text-[var(--app-subtext)]">
                  {{ item.description || getActionDetail(item) }}
                </div>

                <div v-if="noteText(item)" class="bg-[var(--app-input-muted-bg)] rounded-[16px] p-4 text-[13px] text-[var(--app-subtext)]">
                  <div class="font-semibold text-[var(--app-muted)] mb-1">Catatan:</div>
                  <div>{{ noteText(item) }}</div>
                </div>
              </div>
            </VCard>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/plugins/axios'
import { useAuthStore } from '@/stores/users/auth'
import { useGlobalAlert } from '@/composables/useGlobalAlert'
import { useActivityLogsStore, type ActivityLogItem, type SuratType } from '@/stores/activity_logs'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VActionButton from '@/components/common/VActionButton.vue'
import VCard from '@/components/common/VCard.vue'
import VChip from '@/components/common/VChip.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const logsStore = useActivityLogsStore()
const { showAlert } = useGlobalAlert()

const suratInfo = ref({
  id: '-',
  title: '-',
  status: '-',
  fields: [] as Array<{ label: string; value: string }>,
})

const statusChipVariant = computed(() => {
  const status = suratInfo.value.status.toLowerCase()
  if (['verified', 'disetujui', 'selesai'].includes(status)) return 'deep'
  if (['rejected', 'ditolak'].includes(status)) return 'secondary'
  if (['pending', 'diproses'].includes(status)) return 'primary'
  return 'tertiary'
})

const suratType = computed(() => String(route.params.surat_type || ''))
const suratId = computed(() => Number(route.params.surat_id || 0))

const timelineItems = computed(() => logsStore.timeline)

const summary = computed(() => {
  const items = logsStore.timeline
  const total = items.length
  const uniqueUsers = new Set(items.map((item) => item.actor_name || '')).size

  let duration = '-'
  if (items.length > 1) {
    const start = new Date(items[0].created_at).getTime()
    const end = new Date(items[items.length - 1].created_at).getTime()
    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      duration = formatDuration(end - start)
    }
  }

  const stage = logsStore.longestStage
  const longestStage = stage?.label
    ? `${stage.label} (${stage.jumlah_hari_kerja} hari kerja)`
    : ''

  return {
    total,
    uniqueUsers,
    duration,
    longestStage,
  }
})

const formatDuration = (ms: number) => {
  const totalMinutes = Math.floor(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0 && minutes <= 0) {
    return '0 menit'
  }

  if (hours <= 0) {
    return `${minutes} menit`
  }

  return `${hours} jam ${minutes} menit`
}

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getActionLabel = (log: ActivityLogItem) => {
  const action = String(log.action || '')
  if (action === 'created') return 'Pengajuan dibuat'
  if (action === 'revision_created') return 'Revisi diajukan'
  if (action === 'status_changed') return 'Status berubah'
  if (action === 'disposition_added') return 'Disposisi ditambahkan'
  if (action === 'deleted') return 'Dokumen dihapus'
  return action || '-'
}

const getActionDetail = (log: ActivityLogItem) => {
  if (log.action === 'status_changed') {
    const fromStatus = log.status_from || '-'
    const toStatus = log.status_to || '-'
    return `Status berubah dari ${fromStatus} ke ${toStatus}.`
  }
  if (log.action === 'revision_created') {
    const revisionId = log.metadata?.revision_of_id
    return revisionId ? `Revisi dibuat dari surat #${revisionId}.` : 'Revisi dibuat.'
  }
  if (log.action === 'disposition_added') {
    const target = log.metadata?.target_role
    return target ? `Disposisi ditujukan ke ${target}.` : 'Disposisi ditambahkan.'
  }
  if (log.action === 'deleted') {
    return 'Dokumen persuratan dihapus.'
  }
  return String(log.metadata?.catatan || '-')
}

const formatStatus = (log: ActivityLogItem) => {
  return String(log.status_to || log.status_from || '-').trim() || '-'
}

const getStatusVariant = (log: ActivityLogItem) => {
  const status = String(log.status_to || log.status_from || '').toLowerCase()
  if (['verified', 'disetujui', 'selesai'].includes(status)) return 'deep'
  if (['rejected', 'ditolak'].includes(status)) return 'secondary'
  if (['pending', 'diproses'].includes(status)) return 'primary'
  return 'tertiary'
}

const getInitials = (name?: string | null) => {
  if (!name) return 'S'
  const parts = name.split(' ').filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase())
  return initials.join('') || 'S'
}

const noteText = (log: ActivityLogItem) => {
  if (log.action === 'disposition_added') {
    const instruksi = log.metadata?.instruksi
    if (instruksi) return String(instruksi)
  }

  if (log.action === 'status_changed') {
    const statusTo = String(log.status_to || '').toLowerCase()
    if (['rejected', 'ditolak'].includes(statusTo)) {
      const catatan = log.metadata?.catatan
      if (catatan) return String(catatan)
    }
  }

  const catatan = log.metadata?.catatan
  if (catatan) return String(catatan)

  return ''
}

const buildSuratInfo = (payload: Record<string, any>, type: SuratType) => {
  if (type === 'surat_masuk') {
    suratInfo.value = {
      id: String(payload.id_surat_masuk || suratId.value || '-'),
      title: payload.perihal || 'Surat Masuk',
      status: payload.status || '-',
      fields: [
        { label: 'Nomor Agenda', value: String(payload.nomor_agenda || '-') },
        {
          label: 'Nomor Surat',
          value: String(payload.nomor_surat_sistem || payload.nomor_surat_pengirim || '-'),
        },
        { label: 'Pengirim', value: payload.pengirim?.nama_instansi || '-' },
        { label: 'Tanggal Terima', value: formatDate(payload.tanggal_terima) },
        { label: 'Perihal', value: payload.perihal || '-' },
      ],
    }
    return
  }

  suratInfo.value = {
    id: String(payload.id_pengajuan || suratId.value || '-'),
    title: payload.template_nama || payload.template_jenis || 'Surat Keluar',
    status: payload.status || '-',
    fields: [
      { label: 'Template Surat', value: payload.template_nama || '-' },
      { label: 'Nomor Surat', value: payload.nomor_surat || '-' },
      { label: 'Siswa', value: payload.siswa_nama || '-' },
      { label: 'Tanggal Pengajuan', value: formatDate(payload.tanggal_pengajuan) },
      { label: 'Klasifikasi', value: payload.klasifikasi || '-' },
    ],
  }
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const fetchSuratInfo = async (type: SuratType, id: number) => {
  try {
    if (type === 'surat_masuk') {
      const response = await api.get(`/api/surat-masuk/${id}/`)
      const payload = response.data?.data || response.data || {}
      buildSuratInfo(payload, type)
      return
    }

    const response = await api.get(`/api/letters/requests/${id}`)
    const payload = response.data?.data || response.data || {}
    buildSuratInfo(payload, type)
  } catch (error) {
    showAlert('error', 'Gagal memuat detail surat.', 'Error')
  }
}

const loadDetail = async () => {
  const type = suratType.value as SuratType
  if (!type || !suratId.value) {
    showAlert('error', 'Parameter surat tidak valid.', 'Error')
    return
  }

  try {
    await Promise.all([logsStore.fetchTimeline(type, suratId.value), fetchSuratInfo(type, suratId.value)])
  } catch {
    showAlert('error', 'Gagal memuat detail log aktivitas.', 'Error')
  }
}

const goBack = () => {
  const role = String(authStore.role || '').toUpperCase()
  if (role === 'ADMIN') {
    router.push('/admin/activity-logs')
    return
  }
  if (role === 'KEPSEK') {
    router.push('/kepsek/activity-logs')
    return
  }
  router.push('/status')
}

watch([suratType, suratId], loadDetail)

onMounted(loadDetail)
</script>