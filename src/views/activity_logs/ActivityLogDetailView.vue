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

const suratType = computed(() => String(route.params.surat_type || ''))
const suratId = computed(() => Number(route.params.surat_id || 0))
const timelineItems = computed(() => logsStore.timeline)

const suratAvatarText = computed(() => {
  return suratType.value === 'surat_masuk' ? 'SM' : 'SK'
})

const normalizeStatus = (value?: string) => {
  return String(value || '').toLowerCase().trim()
}

const statusIncludes = (status: string, keywords: string[]) => {
  return keywords.some((keyword) => status.includes(keyword))
}

const getChipVariantByStatus = (statusValue: string) => {
  const status = normalizeStatus(statusValue)

  if (
    statusIncludes(status, [
      'dibatalkan',
      'cancelled',
      'canceled',
      'ditolak',
      'rejected',
    ])
  ) {
    return 'danger' as const
  }

  if (
    statusIncludes(status, [
      'dihapus',
      'terhapus',
      'deleted',
    ])
  ) {
    return 'deleted' as const
  }

  if (
    statusIncludes(status, [
      'verified',
      'terverifikasi',
      'disetujui',
      'approved',
      'selesai',
    ])
  ) {
    return 'deep' as const
  }

  if (
    statusIncludes(status, [
      'menunggu',
      'pending',
      'diproses',
      'verifikasi',
    ])
  ) {
    return 'warning' as const
  }

  if (
    statusIncludes(status, [
      'diajukan',
      'submitted',
    ])
  ) {
    return 'tertiary' as const
  }

  return 'tertiary' as const
}

const statusChipVariant = computed(() => {
  return getChipVariantByStatus(suratInfo.value.status)
})

const summary = computed(() => {
  const items = logsStore.timeline
  const total = items.length
  const uniqueUsers = new Set(items.map((item) => item.actor_name || '')).size

  let duration = '-'

  if (items.length > 1) {
    const start = new Date(items[0]?.created_at || 0).getTime()
    const end = new Date(items[items.length - 1]?.created_at || 0).getTime()

    if (!Number.isNaN(start) && !Number.isNaN(end) && end >= start) {
      duration = formatDuration(end - start)
    }
  }

  const stage = logsStore.longestStage
  const longestStage = stage?.label ? `${stage.label} (${stage.jumlah_hari_kerja} hari kerja)` : ''

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
  if (log.action === 'deleted') return 'dihapus'

  return String(log.status_to || log.status_from || '-').trim() || '-'
}

const getStatusVariant = (log: ActivityLogItem) => {
  if (log.action === 'deleted') {
    return 'deleted' as const
  }

  return getChipVariantByStatus(formatStatus(log))
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

const applyTimelineHeader = (type: SuratType, id: number) => {
  const header = logsStore.timelineHeader

  if (!header) return false

  const title = header.perihal || (type === 'surat_masuk' ? 'Surat Masuk' : 'Surat Keluar')

  suratInfo.value = {
    id: String(id || '-'),
    title,
    status: String(header.status_display || '-').toLowerCase(),
    fields: [
      { label: 'Nomor Surat', value: String(header.nomor || '-') },
      { label: 'Pengirim', value: String(header.pengirim || '-') },
      { label: 'Tanggal', value: String(header.tanggal || '-') },
      { label: 'Perihal', value: String(header.perihal || '-') },
    ],
  }

  return true
}

const fetchSuratInfo = async (type: SuratType, id: number) => {
  try {
    if (type === 'surat_masuk') {
      const response = await api.get(`/api/surat-masuk/${id}/`, {
        params: { include_deleted: 1 },
      })

      const payload = response.data?.data || response.data || {}

      buildSuratInfo(payload, type)
      return
    }

    const response = await api.get(`/api/letters/requests/${id}`)
    const payload = response.data?.data || response.data || {}

    buildSuratInfo(payload, type)
  } catch (error) {
    const status = (error as any)?.response?.status

    if (status === 404) {
      if (applyTimelineHeader(type, id)) {
        return
      }

      try {
        if (!logsStore.timeline || logsStore.timeline.length === 0) {
          await logsStore.fetchTimeline(type, id)
        }

        let foundPayload: Record<string, any> | null = null

        for (const entry of logsStore.timeline) {
          const metadata = entry.metadata || {}

          if (metadata.snapshot && typeof metadata.snapshot === 'object') {
            foundPayload = metadata.snapshot as Record<string, any>
            break
          }

          if (metadata.payload && typeof metadata.payload === 'object') {
            foundPayload = metadata.payload as Record<string, any>
            break
          }

          if (Object.keys(metadata).length > 0) {
            const keys = Object.keys(metadata).map((key) => key.toLowerCase())

            if (
              keys.includes('perihal') ||
              keys.includes('nomor_surat') ||
              keys.includes('id_surat_masuk')
            ) {
              foundPayload = metadata as Record<string, any>
              break
            }
          }
        }

        if (foundPayload) {
          buildSuratInfo(foundPayload, type)
          return
        }
      } catch {
        // fallback ke sentinel dokumen dihapus
      }

      suratInfo.value = {
        id: String(id || '-'),
        title: 'Dokumen Dihapus',
        status: 'dihapus',
        fields: [
          {
            label: 'Info',
            value: 'Detail surat tidak tersedia karena dokumen telah dihapus.',
          },
        ],
      }

      return
    }

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
    await logsStore.fetchTimeline(type, suratId.value)
    await fetchSuratInfo(type, suratId.value)
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

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main class="activity-detail-page">
      <section class="activity-detail-header">
        <VActionButton variant="secondary" @click="goBack">
          Kembali
        </VActionButton>

        <div class="activity-detail-heading-group">
          <h1 class="activity-detail-title">
            Detail Informasi Surat
          </h1>

          <p class="activity-detail-subtitle">
            Berikut detail informasi surat dan riwayat aktivitasnya.
          </p>
        </div>
      </section>

      <VCard class="activity-detail-card">
        <div class="letter-overview">
          <div class="letter-main-info">
            <div class="letter-avatar">
              {{ suratAvatarText }}
            </div>

            <div class="letter-title-group">
              <h2 class="letter-title">
                {{ suratInfo.title }}
              </h2>

              <p class="letter-id">
                ID: {{ suratInfo.id }}
              </p>
            </div>
          </div>

          <VChip
            :label="suratInfo.status"
            :variant="statusChipVariant"
          />
        </div>

        <div class="letter-field-grid">
          <div
            v-for="field in suratInfo.fields"
            :key="field.label"
            class="letter-field-item"
          >
            <p class="letter-field-label">
              {{ field.label }}
            </p>

            <p class="letter-field-value">
              {{ field.value }}
            </p>
          </div>
        </div>
      </VCard>

      <VCard class="activity-detail-card">
        <h3 class="activity-section-title">
          Ringkasan Log
        </h3>

        <div class="summary-grid">
          <div class="summary-item">
            <p class="summary-label">
              Total Aktivitas
            </p>

            <p class="summary-value">
              {{ summary.total }}
            </p>
          </div>

          <div class="summary-item">
            <p class="summary-label">
              Durasi Proses
            </p>

            <p class="summary-value">
              {{ summary.duration }}
            </p>
          </div>

          <div class="summary-item">
            <p class="summary-label">
              Pengguna Terlibat
            </p>

            <p class="summary-value">
              {{ summary.uniqueUsers }}
            </p>
          </div>
        </div>

        <p
          v-if="summary.longestStage"
          class="summary-note"
        >
          Tahap paling lama:
          <strong>{{ summary.longestStage }}</strong>
        </p>
      </VCard>

      <VCard class="activity-detail-card">
        <div class="timeline-header">
          <h3 class="activity-section-title">
            Timeline Aktivitas Real-Time
          </h3>
        </div>

        <div
          v-if="logsStore.detailLoading"
          class="timeline-state"
        >
          Memuat timeline...
        </div>

        <div
          v-else-if="timelineItems.length === 0"
          class="timeline-state"
        >
          Belum ada aktivitas yang tercatat.
        </div>

        <div
          v-else
          class="timeline-list"
        >
          <div
            v-for="(item, index) in timelineItems"
            :key="item.id"
            class="timeline-item"
          >
            <div class="timeline-marker-column">
              <div class="timeline-marker">
                {{ index + 1 }}
              </div>

              <div
                v-if="index < timelineItems.length - 1"
                class="timeline-line"
              ></div>
            </div>

            <VCard class="timeline-content-card">
              <div class="timeline-content">
                <div class="timeline-top">
                  <div class="timeline-title-group">
                    <h4 class="timeline-title">
                      {{ item.title || getActionLabel(item) }}
                    </h4>

                    <p class="timeline-time">
                      {{ formatDateTime(item.created_at) }}
                    </p>
                  </div>

                  <VChip
                    :label="formatStatus(item)"
                    :variant="getStatusVariant(item)"
                  />
                </div>

                <div class="timeline-actor">
                  <div class="timeline-actor-avatar">
                    {{ getInitials(item.actor_name) }}
                  </div>

                  <div class="timeline-actor-info">
                    <p class="timeline-actor-name">
                      {{ item.actor_name || 'Sistem' }}
                    </p>

                    <p class="timeline-actor-role">
                      {{ item.actor_role || '-' }}
                    </p>
                  </div>
                </div>

                <p class="timeline-description">
                  {{ item.description || getActionDetail(item) }}
                </p>

                <div
                  v-if="noteText(item)"
                  class="timeline-note"
                >
                  <p class="timeline-note-label">
                    Catatan:
                  </p>

                  <p class="timeline-note-text">
                    {{ noteText(item) }}
                  </p>
                </div>
              </div>
            </VCard>
          </div>
        </div>
      </VCard>
    </main>
  </DashboardLayout>
</template>

<style scoped>
.activity-detail-page {
  display: flex;
  width: 100%;
  min-height: 100vh;
  flex-direction: column;
  gap: 24px;
  background: var(--app-bg);
  color: var(--app-text);
  font-family: var(--font-sans);
  padding: 32px;
}

.activity-detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-detail-heading-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-detail-title {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-page-title-font);
  font-weight: 800;
  line-height: 1.2;
}

.activity-detail-subtitle {
  margin: 0;
  color: var(--app-subtext);
  font-size: var(--app-page-subtitle-font);
  line-height: 1.4;
}

.activity-detail-card {
  border-color: var(--app-card-border);
  background: var(--app-card);
  color: var(--app-text);
  box-shadow: var(--app-card-shadow);
}

.letter-overview {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.letter-main-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.letter-avatar {
  display: flex;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(90.74deg, var(--app-accent), var(--app-accent-2));
  color: var(--app-text-inverse);
  font-size: var(--app-font-sm);
  font-weight: 700;
  line-height: 1.2;
}

.letter-title-group {
  min-width: 0;
}

.letter-title {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-section-title-font);
  font-weight: 700;
  line-height: 1.25;
}

.letter-id {
  margin: 2px 0 0;
  color: var(--app-subtext);
  font-size: var(--app-font-sm);
  line-height: 1.4;
}

.letter-field-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.letter-field-item {
  min-width: 0;
}

.letter-field-label,
.letter-field-value,
.summary-label,
.summary-value,
.summary-note,
.timeline-time,
.timeline-actor-name,
.timeline-actor-role,
.timeline-description,
.timeline-note-label,
.timeline-note-text {
  margin: 0;
}

.letter-field-label {
  color: var(--app-muted);
  font-size: var(--app-font-sm);
  font-weight: 600;
  line-height: 1.4;
}

.letter-field-value {
  margin-top: 2px;
  color: var(--app-heading);
  font-size: var(--app-font-base);
  font-weight: 600;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.activity-section-title {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-section-title-font);
  font-weight: 700;
  line-height: 1.25;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin-top: 16px;
}

.summary-item {
  min-width: 0;
}

.summary-label {
  color: var(--app-muted);
  font-size: var(--app-font-sm);
  font-weight: 600;
  line-height: 1.4;
}

.summary-value {
  margin-top: 4px;
  color: var(--app-heading);
  font-size: var(--app-font-xl);
  font-weight: 800;
  line-height: 1.2;
}

.summary-note {
  margin-top: 16px;
  color: var(--app-subtext);
  font-size: var(--app-font-sm);
  line-height: 1.5;
}

.summary-note strong {
  color: var(--app-heading);
  font-weight: 700;
}

.timeline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-state {
  padding: 40px 16px;
  color: var(--app-subtext);
  font-size: var(--app-font-sm);
  line-height: 1.5;
  text-align: center;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 24px;
}

.timeline-item {
  display: flex;
  gap: 24px;
}

.timeline-marker-column {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
}

.timeline-marker {
  display: flex;
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--app-accent);
  border-radius: 999px;
  background: var(--app-soft-card);
  color: var(--app-accent);
  font-size: var(--app-font-sm);
  font-weight: 700;
  line-height: 1.2;
}

.timeline-line {
  width: 6px;
  flex: 1;
  min-height: 32px;
  margin-top: 8px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--app-accent), var(--app-accent-2));
}

.timeline-content-card {
  flex: 1;
  min-width: 0;
  border-color: var(--app-card-border);
  background: var(--app-card);
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.timeline-title-group {
  min-width: 0;
}

.timeline-title {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-card-title-font);
  font-weight: 700;
  line-height: 1.3;
}

.timeline-time {
  margin-top: 2px;
  color: var(--app-muted);
  font-size: var(--app-font-xs);
  line-height: 1.4;
}

.timeline-actor {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--app-subtext);
}

.timeline-actor-avatar {
  display: flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--app-soft-card);
  color: var(--app-heading);
  font-size: var(--app-font-xs);
  font-weight: 700;
  line-height: 1.2;
}

.timeline-actor-name {
  color: var(--app-heading);
  font-size: var(--app-font-sm);
  font-weight: 600;
  line-height: 1.35;
}

.timeline-actor-role {
  color: var(--app-muted);
  font-size: var(--app-font-xs);
  line-height: 1.35;
}

.timeline-description {
  color: var(--app-subtext);
  font-size: var(--app-font-sm);
  line-height: 1.55;
}

.timeline-note {
  border-radius: 16px;
  background: var(--app-input-muted-bg);
  color: var(--app-subtext);
  padding: 16px;
}

.timeline-note-label {
  color: var(--app-muted);
  font-size: var(--app-font-xs);
  font-weight: 700;
  line-height: 1.35;
}

.timeline-note-text {
  margin-top: 4px;
  color: var(--app-subtext);
  font-size: var(--app-font-sm);
  line-height: 1.5;
}

@media (max-width: 900px) {
  .activity-detail-page {
    padding: 24px;
  }

  .letter-field-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .activity-detail-page {
    gap: 18px;
    padding: 18px;
  }

  .activity-detail-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .letter-overview,
  .timeline-top {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline-item {
    gap: 14px;
  }

  .timeline-marker {
    width: 40px;
    height: 40px;
  }

  .timeline-line {
    width: 4px;
  }
}
</style>