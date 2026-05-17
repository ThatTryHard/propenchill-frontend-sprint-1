<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import { useGlobalAlert } from '@/composables/useGlobalAlert'
import { useActivityLogsStore, type ActivityLogItem, type SuratType } from '@/stores/activity_logs'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VActionButton from '@/components/common/VActionButton.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VInputField from '@/components/common/VInputField.vue'
import VTable from '@/components/common/VTable.vue'
import VChip from '@/components/common/VChip.vue'
import VPagination from '@/components/common/VPagination.vue'
import VCard from '@/components/common/VCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const logsStore = useActivityLogsStore()
const { showAlert } = useGlobalAlert()

const filters = reactive({
  date: '',
  surat_type: '' as SuratType | '',
  status: '',
  actor: '',
})

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const jenisSuratOptions = [
  { label: 'Semua Jenis', value: '' },
  { label: 'Surat Keluar', value: 'surat_keluar' },
  { label: 'Surat Masuk', value: 'surat_masuk' },
]

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Diajukan', value: 'diajukan' },
  { label: 'Menunggu Verifikasi Kepsek', value: 'menunggu_verifikasi_kepsek' },
  { label: 'Verified', value: 'verified' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Dibatalkan', value: 'dibatalkan' },
  { label: 'Dihapus', value: 'dihapus' },
]

const tableColumns = [
  { key: 'id', label: 'ID Surat' },
  { key: 'waktu', label: 'Waktu' },
  { key: 'nama', label: 'Nama Pengguna' },
  { key: 'jenis', label: 'Jenis Surat' },
  { key: 'aktivitas', label: 'Aktivitas' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: 'Aksi' },
]

const formatDateKey = (value?: string) => {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('en-CA')
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

const getJenisSuratLabel = (jenis?: SuratType) => {
  if (jenis === 'surat_keluar') return 'Surat Keluar'
  if (jenis === 'surat_masuk') return 'Surat Masuk'

  return '-'
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

    return `${fromStatus} → ${toStatus}`
  }

  if (log.action === 'revision_created') {
    const revisionId = log.metadata?.revision_of_id

    return revisionId ? `Revisi dari surat #${revisionId}` : 'Revisi baru'
  }

  if (log.action === 'disposition_added') {
    const target = log.metadata?.target_role

    return target ? `Target: ${target}` : 'Disposisi surat masuk'
  }

  return log.metadata?.catatan ? String(log.metadata.catatan) : '-'
}

const normalizeStatusValue = (raw?: string) => {
  if (!raw) return ''

  const status = String(raw).trim().toLowerCase()

  if (['diajukan', 'pending', 'diproses', 'submitted'].includes(status)) {
    return 'diajukan'
  }

  if (
    [
      'menunggu verifikasi kepsek',
      'menunggu_verifikasi_kepsek',
      'menunggu verifikasi',
      'waiting principal verification',
    ].includes(status)
  ) {
    return 'menunggu_verifikasi_kepsek'
  }

  if (['verified', 'terverifikasi', 'disetujui', 'approved', 'selesai'].includes(status)) {
    return 'verified'
  }

  if (['rejected', 'ditolak'].includes(status)) {
    return 'rejected'
  }

  if (['dibatalkan', 'cancelled', 'canceled'].includes(status)) {
    return 'dibatalkan'
  }

  if (['dihapus', 'terhapus', 'deleted'].includes(status)) {
    return 'dihapus'
  }

  return status
}

const formatStatus = (log: ActivityLogItem) => {
  if (log.action === 'deleted') return 'Dihapus'

  const rawStatus = String(log.status_to || log.status_from || '')
  const normalizedStatus = normalizeStatusValue(rawStatus)

  if (!normalizedStatus) return '-'

  return normalizedStatus
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getStatusVariant = (log: ActivityLogItem) => {
  if (log.action === 'deleted') {
    return 'deleted' as const
  }

  const status = normalizeStatusValue(String(log.status_to || log.status_from || ''))

  if (status === 'diajukan') return 'tertiary' as const
  if (status === 'menunggu_verifikasi_kepsek') return 'warning' as const
  if (status === 'verified') return 'deep' as const
  if (['rejected', 'dibatalkan'].includes(status)) return 'danger' as const
  if (status === 'dihapus') return 'deleted' as const

  return 'tertiary' as const
}

const toTimestamp = (value?: string) => {
  if (!value) return 0

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

const groupedLogs = computed(() => {
  const groups = new Map<string, { latest: ActivityLogItem; items: ActivityLogItem[] }>()

  logsStore.logs.forEach((log) => {
    const key = `${log.surat_type}-${log.surat_id}`
    const existing = groups.get(key)

    if (!existing) {
      groups.set(key, { latest: log, items: [log] })
      return
    }

    existing.items.push(log)

    if (toTimestamp(log.created_at) > toTimestamp(existing.latest.created_at)) {
      existing.latest = log
    }
  })

  return Array.from(groups.values()).sort(
    (a, b) => toTimestamp(b.latest.created_at) - toTimestamp(a.latest.created_at),
  )
})

const matchesSearch = (log: ActivityLogItem, query: string) => {
  if (!query) return true

  const normalizedQuery = query.toLowerCase()
  const haystack = [
    log.actor_name,
    log.actor_role,
    log.action,
    getActionLabel(log),
    getActionDetail(log),
    log.status_from,
    log.status_to,
    String(log.surat_id || ''),
  ]
    .filter(Boolean)
    .map((item) => String(item).toLowerCase())
    .join(' ')

  return haystack.includes(normalizedQuery)
}

const filteredLogs = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const dateFilter = filters.date
  const actorFilter = filters.actor.trim().toLowerCase()
  const statusFilter = filters.status.trim().toLowerCase()
  const typeFilter = filters.surat_type

  return groupedLogs.value.filter((group) => {
    const latest = group.latest

    const matchDate = !dateFilter || formatDateKey(latest.created_at) === dateFilter
    const matchActor = !actorFilter || latest.actor_name?.toLowerCase().includes(actorFilter)
    const matchType = !typeFilter || latest.surat_type === typeFilter

    const statusRaw =
      latest.action === 'deleted'
        ? 'dihapus'
        : String(latest.status_to || latest.status_from || '')

    const statusValue = normalizeStatusValue(statusRaw)
    const matchStatus = !statusFilter || statusValue === statusFilter
    const matchSearch = !query || matchesSearch(latest, query)

    return matchDate && matchActor && matchType && matchStatus && matchSearch
  })
})

const totalPages = computed(() => {
  const total = Math.ceil(filteredLogs.value.length / itemsPerPage)

  return total > 0 ? total : 1
})

const rowStartIndex = computed(() => (currentPage.value - 1) * itemsPerPage)

const paginatedLogs = computed(() => {
  const start = rowStartIndex.value

  return filteredLogs.value.slice(start, start + itemsPerPage)
})

const tableRows = computed(() =>
  paginatedLogs.value.map((group, index) => ({
    index: rowStartIndex.value + index + 1,
    log: group.latest,
  })),
)

const refreshLogs = async () => {
  try {
    await logsStore.fetchLogs({
      surat_type: filters.surat_type,
      status: filters.status,
      actor: filters.actor,
    })
  } catch {
    showAlert('error', 'Gagal memuat log aktivitas.', 'Error')
  }
}

const getBasePath = () => {
  const role = String(authStore.role || '').toUpperCase()

  if (role === 'ADMIN') return '/admin/activity-logs'
  if (role === 'KEPSEK') return '/kepsek/activity-logs'

  return '/status'
}

const goToDetail = (log: ActivityLogItem) => {
  const basePath = getBasePath()

  router.push(`${basePath}/${log.surat_type}/${log.surat_id}`)
}

watch([() => filters.surat_type, () => filters.status, () => filters.actor], () => {
  currentPage.value = 1
  refreshLogs()
})

watch([searchQuery, () => filters.date], () => {
  currentPage.value = 1
})

watch(totalPages, (newTotal) => {
  if (currentPage.value > newTotal) {
    currentPage.value = newTotal
  }
})

onMounted(refreshLogs)
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main class="activity-logs-page">
      <section class="activity-logs-header">
        <div class="activity-logs-heading-group">
          <h1 class="activity-logs-title">
            Log dan Riwayat Aktivitas Persuratan
          </h1>

          <p class="activity-logs-subtitle">
            Lihat dan kelola log serta riwayat aktivitas persuratan.
          </p>
        </div>

        <VActionButton variant="secondary" @click="refreshLogs">
          Refresh
        </VActionButton>
      </section>

      <VCard
        class="activity-logs-filter-card"
        paddingClass="p-4"
        overflowClass="overflow-visible"
      >
        <div class="activity-logs-filter-grid">
          <div class="activity-logs-filter-field activity-logs-filter-field--date">
            <label class="activity-logs-label">
              Tanggal
            </label>

            <VInputField
              v-model="filters.date"
              type="date"
            />
          </div>

          <div class="activity-logs-filter-field activity-logs-filter-field--type">
            <label class="activity-logs-label">
              Jenis Surat
            </label>

            <VDropdown
              v-model="filters.surat_type"
              :options="jenisSuratOptions"
              placeholder="Semua Jenis"
            />
          </div>

          <div class="activity-logs-filter-field activity-logs-filter-field--status">
            <label class="activity-logs-label">
              Status
            </label>

            <VDropdown
              v-model="filters.status"
              :options="statusOptions"
              placeholder="Semua Status"
            />
          </div>

          <div class="activity-logs-filter-field activity-logs-filter-field--actor">
            <label class="activity-logs-label">
              Pengguna
            </label>

            <VInputField
              v-model="filters.actor"
              placeholder="Nama pengguna"
            />
          </div>
        </div>
      </VCard>

      <VCard
        class="activity-logs-list-card"
        paddingClass="p-4"
        overflowClass="overflow-visible"
      >
        <div class="activity-logs-search-wrapper">
          <VInputField
            v-model="searchQuery"
            state="search"
            placeholder="Cari log aktivitas..."
          />
        </div>

        <VTable
          :columns="tableColumns"
          :rows="tableRows"
          :is-loading="logsStore.loading"
        >
          <template #cell-id="{ row }">
            <span class="activity-logs-id">
              {{ row.log.surat_id || row.index }}
            </span>
          </template>

          <template #cell-waktu="{ row }">
            <span class="activity-logs-cell-text">
              {{ formatDateTime(row.log.created_at) }}
            </span>
          </template>

          <template #cell-nama="{ row }">
            <div class="activity-logs-main-cell">
              <span class="activity-logs-primary-text">
                {{ row.log.actor_name || '-' }}
              </span>

              <span class="activity-logs-secondary-text">
                {{ row.log.actor_role || '-' }}
              </span>
            </div>
          </template>

          <template #cell-jenis="{ row }">
            <span class="activity-logs-cell-text">
              {{ getJenisSuratLabel(row.log.surat_type) }}
            </span>
          </template>

          <template #cell-aktivitas="{ row }">
            <div class="activity-logs-main-cell">
              <span class="activity-logs-primary-text">
                {{ getActionLabel(row.log) }}
              </span>

              <span class="activity-logs-secondary-text">
                {{ getActionDetail(row.log) }}
              </span>
            </div>
          </template>

          <template #cell-status="{ row }">
            <VChip
              :label="formatStatus(row.log)"
              :variant="getStatusVariant(row.log)"
            />
          </template>

          <template #cell-aksi="{ row }">
            <VActionButton
              variant="primary"
              @click="goToDetail(row.log)"
            >
              Detail
            </VActionButton>
          </template>
        </VTable>

        <div class="activity-logs-footer">
          <span>
            Menampilkan {{ paginatedLogs.length }} dari {{ filteredLogs.length }} data
          </span>
        </div>

        <div
          v-if="totalPages > 1"
          class="activity-logs-pagination"
        >
          <VPagination
            v-model:current-page="currentPage"
            :total-pages="totalPages"
          />
        </div>
      </VCard>
    </main>
  </DashboardLayout>
</template>

<style scoped>
.activity-logs-page {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 100vh;
  flex-direction: column;
  gap: 18px;
  overflow: visible;
  background: var(--app-bg);
  color: var(--app-text);
  font-family: var(--font-sans);
  padding: 28px;
}

.activity-logs-header {
  position: relative;
  z-index: 70;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.activity-logs-heading-group {
  min-width: 0;
}

.activity-logs-title {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-page-title-font);
  font-weight: 800;
  line-height: 1.2;
}

.activity-logs-subtitle {
  margin: 4px 0 0;
  color: var(--app-subtext);
  font-size: var(--app-page-subtitle-font);
  line-height: 1.4;
}

.activity-logs-filter-card {
  position: relative;
  z-index: 60;
  width: 100%;
  border-color: var(--app-card-border);
  background: var(--app-card);
  color: var(--app-text);
  box-shadow: var(--app-card-shadow);
}

.activity-logs-list-card {
  position: relative;
  z-index: 1;
  width: 100%;
  border-color: var(--app-card-border);
  background: var(--app-card);
  color: var(--app-text);
  box-shadow: var(--app-card-shadow);
}

.activity-logs-filter-grid {
  display: grid;
  width: 100%;
  grid-template-columns:
    minmax(140px, 0.8fr)
    minmax(170px, 1fr)
    minmax(210px, 1.15fr)
    minmax(170px, 1fr);
  align-items: end;
  gap: 12px;
}

.activity-logs-filter-field {
  position: relative;
  display: flex;
  min-width: 0;
  width: 100%;
  flex-direction: column;
  gap: 6px;
}

.activity-logs-filter-field:focus-within {
  z-index: 9999;
}

.activity-logs-label {
  display: block;
  margin: 0;
  color: var(--app-heading);
  font-family: var(--font-sans);
  font-size: var(--app-input-label-font);
  font-weight: 700;
  line-height: 1.2;
}

.activity-logs-filter-field :deep(.v-dropdown),
.activity-logs-filter-field :deep(.v-dropdown-trigger),
.activity-logs-filter-field :deep(input) {
  width: 100%;
  min-width: 0;
}

.activity-logs-filter-field :deep(.v-dropdown-trigger),
.activity-logs-filter-field :deep(input) {
  min-height: 40px;
  height: 40px;
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: var(--app-input-font);
}

.activity-logs-filter-field :deep(.v-dropdown-icon) {
  width: 20px;
  height: 20px;
}

.activity-logs-filter-field :deep(.flex.flex-col.gap-2) {
  gap: 0;
}

.activity-logs-search-wrapper {
  margin-bottom: 16px;
}

.activity-logs-search-wrapper :deep(input) {
  min-height: 40px;
  height: 40px;
}

.activity-logs-list-card :deep(.v-table-wrapper) {
  background: transparent;
  box-shadow: none;
}

.activity-logs-id,
.activity-logs-primary-text,
.activity-logs-cell-text {
  color: var(--app-text);
  font-size: var(--app-table-cell-font);
  line-height: 1.35;
}

.activity-logs-id,
.activity-logs-primary-text {
  font-weight: 600;
}

.activity-logs-main-cell {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.activity-logs-secondary-text {
  color: var(--app-muted);
  font-size: var(--app-font-xs);
  line-height: 1.35;
}

.activity-logs-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  color: var(--app-subtext);
  font-size: var(--app-font-xs);
  line-height: 1.4;
}

.activity-logs-pagination {
  display: flex;
  justify-content: center;
  margin-top: 14px;
}

@media (max-width: 1024px) {
  .activity-logs-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .activity-logs-page {
    gap: 18px;
    padding: 24px 16px;
  }

  .activity-logs-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .activity-logs-filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>