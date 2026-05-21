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

type ChipVariant = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger' | 'deleted'

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

const getChipVariantByStatus = (statusValue: string): ChipVariant => {
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
    return 'danger'
  }

  if (
    statusIncludes(status, [
      'dihapus',
      'terhapus',
      'deleted',
    ])
  ) {
    return 'deleted'
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
      return 'primary'
    }

  if (
    statusIncludes(status, [
      'menunggu',
      'pending',
      'diproses',
      'verifikasi',
    ])
  ) {
    return 'warning'
  }

  if (
    statusIncludes(status, [
      'diajukan',
      'submitted',
    ])
  ) {
    return 'tertiary'
  }

  return 'tertiary'
}

const statusChipVariant = computed(() => {
  return getChipVariantByStatus(suratInfo.value.status)
})

const statusChipLabel = computed(() => {
  const status = String(suratInfo.value.status || '').trim().toLowerCase().replace(/_/g, ' ')

  if (status === 'selesai') {
    return 'Verified'
  }

  return humanizeStatus(suratInfo.value.status)
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

const humanizeStatus = (value?: string | null) => {
  if (!value) return '-'

  const words = String(value)
    .trim()
    .replace(/_/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) return '-'

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const getActionLabel = (log: ActivityLogItem) => {
  const action = String(log.action || '')

  if (action === 'created') return 'Pengajuan dibuat'
  if (action === 'revision_created') return 'Revisi diajukan'
  if (action === 'status_changed') {
    const note = log.metadata?.kepsek_note || log.metadata?.catatan

    return note ? 'Disposisi diverifikasi' : 'Status berubah'
  }
  if (action === 'disposition_added') return 'Disposisi ke Kepala Sekolah'
  if (action === 'deleted') return 'Dokumen dihapus'

  return action || '-'
}

const getActionDetail = (log: ActivityLogItem) => {
  if (log.action === 'status_changed') {
    const fromStatus = log.status_from || '-'
    const toStatus = log.status_to || '-'
    const note = log.metadata?.kepsek_note || log.metadata?.catatan

    return note
      ? `Disposisi telah diverifikasi dari ${humanizeStatus(fromStatus)} ke ${humanizeStatus(toStatus)}.`
      : `Status berubah dari ${humanizeStatus(fromStatus)} ke ${humanizeStatus(toStatus)}.`
  }

  if (log.action === 'revision_created') {
    const revisionId = log.metadata?.revision_of_id

    return revisionId ? `Revisi dibuat dari surat #${revisionId}.` : 'Revisi dibuat.'
  }

  if (log.action === 'disposition_added') {
    const target = log.metadata?.target_role

    return target ? `Disposisi ke ${formatRole(String(target))}.` : 'Disposisi ke Kepala Sekolah.'
  }

  if (log.action === 'deleted') {
    return 'Dokumen persuratan dihapus.'
  }

  return String(log.metadata?.catatan || '-')
}

const formatStatus = (log: ActivityLogItem) => {
  if (log.action === 'deleted') return 'dihapus'

  const normalized = String(log.status_to || log.status_from || '').trim().toLowerCase().replace(/_/g, ' ')

  if (normalized === 'menunggu verifikasi kepsek') {
    return 'Menunggu Verifikasi'
  }

  if (normalized === 'selesai') {
    return 'Verified'
  }

  return humanizeStatus(log.status_to || log.status_from || '-')
}

const getStatusChipClass = (log: ActivityLogItem) => {
  const status = String(log.status_to || log.status_from || '').toLowerCase()

  if (status.includes('selesai') || status.includes('verified')) {
    return 'activity-detail-status-chip activity-detail-status-chip--done'
  }

  return 'activity-detail-status-chip'
}

const getStatusVariant = (log: ActivityLogItem): ChipVariant => {
  if (log.action === 'deleted') {
    return 'deleted'
  }

  return getChipVariantByStatus(formatStatus(log))
}

const getInitials = (name?: string | null) => {
  if (!name) return 'S'

  const parts = name.split(' ').filter(Boolean)
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase())

  return initials.join('') || 'S'
}

const formatRole = (role?: string | null) => {
  if (!role) return '-'

  const normalizedRole = String(role).trim().toLowerCase().replace(/_/g, ' ')

  if (normalizedRole === 'kepsek') {
    return 'Kepala Sekolah'
  }

  return String(role)
    .toLowerCase()
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const noteText = (log: ActivityLogItem) => {
  if (log.action === 'disposition_added') {
    const instruksi = log.metadata?.instruksi || log.metadata?.catatan

    if (instruksi) return String(instruksi)
  }

  if (log.action === 'status_changed') {
    const kepsekNote = log.metadata?.kepsek_note || log.metadata?.catatan

    if (kepsekNote) return String(kepsekNote)
  }

  const catatan = log.metadata?.catatan

  if (catatan) return String(catatan)

  return ''
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const buildSuratInfo = (payload: any, type: SuratType) => {
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
/* eslint-enable @typescript-eslint/no-explicit-any */

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
    const status = (error as unknown as { response?: { status?: number } })?.response?.status

    if (status === 404) {
      if (applyTimelineHeader(type, id)) {
        return
      }

      try {
        if (!logsStore.timeline || logsStore.timeline.length === 0) {
          await logsStore.fetchTimeline(type, id)
        }

        let foundPayload: Record<string, unknown> | null = null

        for (const entry of logsStore.timeline) {
          const metadata = entry.metadata || {}

            if (metadata.snapshot && typeof metadata.snapshot === 'object') {
            foundPayload = metadata.snapshot as Record<string, unknown>
            break
          }

          if (metadata.payload && typeof metadata.payload === 'object') {
            foundPayload = metadata.payload as Record<string, unknown>
            break
          }

          if (Object.keys(metadata).length > 0) {
            const keys = Object.keys(metadata).map((key) => key.toLowerCase())

            if (
              keys.includes('perihal') ||
              keys.includes('nomor_surat') ||
              keys.includes('id_surat_masuk')
            ) {
              foundPayload = metadata as Record<string, unknown>
              break
            }
          }
        }

        if (foundPayload) {
          buildSuratInfo(foundPayload, type)
          return
        }
      } catch {
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

    <!-- Page shell -->
    <main
      class="
        flex w-full min-h-screen flex-col gap-6
        bg-[var(--app-bg)] text-[var(--app-text)] font-[var(--font-sans)]
        px-8 py-8
        max-[900px]:px-6 max-[900px]:py-6
        max-[640px]:gap-[18px] max-[640px]:px-[18px] max-[640px]:py-[18px]
      "
    >

      <!--  Header row  -->
      <section
        class="
          flex items-center gap-3
          max-[640px]:flex-col max-[640px]:items-start
        "
      >
        <VActionButton variant="secondary" @click="goBack">
          Kembali
        </VActionButton>

        <div class="flex flex-col gap-1">
          <h1
            class="
              m-0 text-[length:var(--app-page-title-font)]
              font-extrabold leading-[1.2] text-[var(--app-heading)]
            "
          >
            Detail Informasi Surat
          </h1>

          <p
            class="
              m-0 text-[length:var(--app-page-subtitle-font)]
              leading-[1.4] text-[var(--app-subtext)]
            "
          >
            Berikut detail informasi surat dan riwayat aktivitasnya.
          </p>
        </div>
      </section>

      <!--  Letter overview card  -->
      <VCard
        class="activity-detail-shell activity-detail-shell--overview"
      >
        <!-- Avatar + title row -->
        <div
          class="
            flex items-start justify-between gap-4
            max-[640px]:flex-col max-[640px]:items-start
          "
        >
          <div class="flex min-w-0 items-center gap-3">
            <!-- Gradient avatar badge -->
            <div
              class="
                flex h-12 w-12 shrink-0 items-center justify-center
                rounded-[12px]
                bg-gradient-to-r from-[var(--app-accent)] to-[var(--app-accent-2)]
                text-[length:var(--app-font-sm)] font-bold leading-[1.2]
                text-[var(--app-text-inverse)]
              "
            >
              {{ suratAvatarText }}
            </div>

            <div class="min-w-0">
              <h2
                class="
                  m-0 text-[length:var(--app-section-title-font)]
                  font-bold leading-[1.25] text-[var(--app-heading)]
                "
              >
                {{ suratInfo.title }}
              </h2>

              <p
                class="
                  m-0 mt-0.5 text-[length:var(--app-font-sm)]
                  leading-[1.4] text-[var(--app-subtext)]
                "
              >
                ID: {{ suratInfo.id }}
              </p>
            </div>
          </div>

          <VChip
            :label="statusChipLabel"
            :variant="statusChipVariant"
          />
        </div>

        <!-- Field grid -->
        <div
          class="
            mt-6 grid grid-cols-3 gap-4
            max-[900px]:grid-cols-1
          "
        >
          <div
            v-for="field in suratInfo.fields"
            :key="field.label"
            class="min-w-0"
          >
            <p
              class="
                m-0 text-[length:var(--app-font-sm)]
                font-semibold leading-[1.4] text-[var(--app-muted)]
              "
            >
              {{ field.label }}
            </p>

            <p
              class="
                m-0 mt-0.5 text-[length:var(--app-font-base)]
                font-semibold leading-[1.45] text-[var(--app-heading)]
                [overflow-wrap:anywhere]
              "
            >
              {{ field.value }}
            </p>
          </div>
        </div>
      </VCard>

      <!--  Summary card  -->
      <VCard
        class="activity-detail-shell activity-detail-shell--summary"
      >
        <h3
          class="
            m-0 text-[length:var(--app-section-title-font)]
            font-bold leading-[1.25] text-[var(--app-heading)]
          "
        >
          Ringkasan Log
        </h3>

        <div
          class="
            mt-4 grid grid-cols-3 gap-6
            max-[900px]:grid-cols-1
          "
        >
          <div class="min-w-0">
            <p
              class="
                m-0 text-[length:var(--app-font-sm)]
                font-semibold leading-[1.4] text-[var(--app-muted)]
              "
            >
              Total Aktivitas
            </p>
            <p
              class="
                m-0 mt-1 text-[length:var(--app-font-xl)]
                font-extrabold leading-[1.2] text-[var(--app-heading)]
              "
            >
              {{ summary.total }}
            </p>
          </div>

          <div class="min-w-0">
            <p
              class="
                m-0 text-[length:var(--app-font-sm)]
                font-semibold leading-[1.4] text-[var(--app-muted)]
              "
            >
              Durasi Proses
            </p>
            <p
              class="
                m-0 mt-1 text-[length:var(--app-font-xl)]
                font-extrabold leading-[1.2] text-[var(--app-heading)]
              "
            >
              {{ summary.duration }}
            </p>
          </div>

          <div class="min-w-0">
            <p
              class="
                m-0 text-[length:var(--app-font-sm)]
                font-semibold leading-[1.4] text-[var(--app-muted)]
              "
            >
              Pengguna Terlibat
            </p>
            <p
              class="
                m-0 mt-1 text-[length:var(--app-font-xl)]
                font-extrabold leading-[1.2] text-[var(--app-heading)]
              "
            >
              {{ summary.uniqueUsers }}
            </p>
          </div>
        </div>

        <p
          v-if="summary.longestStage"
          class="
            m-0 mt-4 text-[length:var(--app-font-sm)]
            leading-[1.5] text-[var(--app-subtext)]
          "
        >
          Tahap paling lama:
          <strong class="font-bold text-[var(--app-heading)]">
            {{ summary.longestStage }}
          </strong>
        </p>
      </VCard>

      <!--  Timeline card  -->
      <VCard
        class="activity-detail-shell activity-detail-shell--timeline"
      >
        <!-- Timeline section title -->
        <div class="flex items-center justify-between">
          <h3
            class="
              m-0 text-[length:var(--app-section-title-font)]
              font-bold leading-[1.25] text-[var(--app-heading)]
            "
          >
            Timeline Aktivitas Real-Time
          </h3>
        </div>

        <!-- Loading state -->
        <div
          v-if="logsStore.detailLoading"
          class="
            py-10 text-center
            text-[length:var(--app-font-sm)] leading-[1.5] text-[var(--app-subtext)]
          "
        >
          Memuat timeline...
        </div>

        <!-- Empty state -->
        <div
          v-else-if="timelineItems.length === 0"
          class="
            py-10 text-center
            text-[length:var(--app-font-sm)] leading-[1.5] text-[var(--app-subtext)]
          "
        >
          Belum ada aktivitas yang tercatat.
        </div>

        <!-- Timeline list -->
        <div
          v-else
          class="mt-6 flex flex-col gap-6"
        >
          <div
            v-for="(item, index) in timelineItems"
            :key="item.id"
            class="flex gap-6 max-[640px]:gap-[14px]"
          >
            <!-- Numbered marker column -->
            <div class="flex shrink-0 flex-col items-center">
              <div
                class="
                  flex h-12 w-12 items-center justify-center
                  rounded-full border-2 border-[var(--app-accent)]
                  bg-[var(--app-soft-card)]
                  text-[length:var(--app-font-sm)] font-bold leading-[1.2] text-[var(--app-accent)]
                  max-[640px]:h-10 max-[640px]:w-10
                "
              >
                {{ index + 1 }}
              </div>

              <!-- Connector line -->
              <div
                v-if="index < timelineItems.length - 1"
                class="
                  mt-2 w-1.5 flex-1 min-h-8 rounded-full
                  bg-gradient-to-b from-[var(--app-accent)] to-[var(--app-accent-2)]
                  max-[640px]:w-1
                "
              />
            </div>

            <!-- Event card -->
            <VCard
              class="
                activity-detail-event-card
                min-w-0 flex-1
                border-[var(--app-card-border)] bg-[var(--app-card)]
              "
            >
              <div class="flex flex-col gap-3">

                <!-- Top: title + status chip -->
                <div
                  class="
                    flex items-start justify-between gap-4
                    max-[640px]:flex-col max-[640px]:items-start
                  "
                >
                  <div class="min-w-0">
                    <h4
                      class="
                        m-0 text-[length:var(--app-card-title-font)]
                        font-bold leading-[1.3] text-[var(--app-heading)]
                      "
                    >
                      {{ item.title || getActionLabel(item) }}
                    </h4>

                    <p
                      class="
                        m-0 mt-0.5
                        text-[length:var(--app-font-xs)] leading-[1.4] text-[var(--app-muted)]
                      "
                    >
                      {{ formatDateTime(item.created_at) }}
                    </p>
                  </div>

                  <VChip
                    :class="getStatusChipClass(item)"
                    :label="formatStatus(item)"
                    :variant="getStatusVariant(item)"
                  />
                </div>

                <!-- Actor row -->
                <div class="flex items-center gap-3 text-[var(--app-subtext)]">
                  <div
                    class="
                      flex h-8 w-8 shrink-0 items-center justify-center
                      rounded-full bg-[var(--app-soft-card)]
                      text-[length:var(--app-font-xs)] font-bold leading-[1.2] text-[var(--app-heading)]
                    "
                  >
                    {{ getInitials(item.actor_name) }}
                  </div>

                  <div>
                    <p
                      class="
                        m-0 text-[length:var(--app-font-sm)]
                        font-semibold leading-[1.35] text-[var(--app-heading)]
                      "
                    >
                      {{ item.actor_name || 'Sistem' }}
                    </p>

                    <p
                      class="
                        m-0 text-[length:var(--app-font-xs)]
                        leading-[1.35] text-[var(--app-muted)]
                      "
                    >
                      {{ formatRole(item.actor_role) }}
                    </p>
                  </div>
                </div>

                <!-- Description -->
                <p
                  class="
                    m-0 text-[length:var(--app-font-sm)]
                    leading-[1.55] text-[var(--app-subtext)]
                  "
                >
                  {{ item.description || getActionDetail(item) }}
                </p>

                <!-- Note block -->
                <div
                  v-if="noteText(item)"
                  class="rounded-[16px] bg-[var(--app-input-muted-bg)] p-4"
                >
                  <p
                    class="
                      m-0 text-[length:var(--app-font-xs)]
                      font-bold leading-[1.35] text-[var(--app-muted)]
                    "
                  >
                    Catatan:
                  </p>

                  <p
                    class="
                      m-0 mt-1 text-[length:var(--app-font-sm)]
                      leading-[1.5] text-[var(--app-subtext)]
                    "
                  >
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
