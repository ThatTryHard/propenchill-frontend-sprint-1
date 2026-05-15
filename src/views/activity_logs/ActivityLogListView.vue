<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <div
      class="w-full min-h-screen bg-[var(--app-bg)] p-8 max-[768px]:px-4 flex flex-col gap-6 font-sans"
    >
      <section class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="m-0 text-[28px] leading-[120%] font-extrabold text-[var(--app-heading)]">
            Log dan Riwayat Aktivitas Persuratan
          </h1>
          <p class="mt-1 mb-0 text-[16px] leading-[140%] text-[var(--app-subtext)]">
            Lihat dan kelola log dan riwayat aktivitas persuratan
          </p>
        </div>
        <VActionButton variant="secondary" @click="refreshLogs"> Refresh </VActionButton>
      </section>

      <div
        class="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[24px] p-6 shadow-sm"
      >
        <div class="flex flex-wrap items-end gap-4 w-full">
          <div class="flex-[1.2] min-w-[180px]">
            <VInputField type="date" v-model="filters.date" label="Tanggal" />
          </div>

          <div class="flex-[1.2] min-w-[190px] flex flex-col gap-2">
            <label class="text-[16px] font-semibold leading-[120%] text-[var(--app-text)]"
              >Jenis Surat</label
            >
            <VDropdown
              v-model="filters.surat_type"
              :options="jenisSuratOptions"
              placeholder="Semua Jenis"
            />
          </div>

          <div class="flex-[1.2] min-w-[200px] flex flex-col gap-2">
            <label class="text-[16px] font-semibold leading-[120%] text-[var(--app-text)]"
              >Status</label
            >
            <VDropdown
              v-model="filters.status"
              :options="statusOptions"
              placeholder="Semua Status"
            />
          </div>

          <div class="flex-[1.6] min-w-[220px]">
            <VInputField v-model="filters.actor" label="Pengguna" placeholder="Nama pengguna" />
          </div>
        </div>
      </div>

      <div
        class="bg-[var(--app-card)] border border-[var(--app-card-border)] rounded-[24px] p-6 shadow-sm"
      >
        <VInputField v-model="searchQuery" state="search" placeholder="Cari log aktivitas..." />
      </div>

      <VTable :columns="tableColumns" :rows="tableRows" :isLoading="logsStore.loading">
        <template #cell-id="{ row }">
          <span class="font-semibold text-[var(--app-text)]">{{ row.log.surat_id || row.index }}</span>
        </template>

        <template #cell-waktu="{ row }">
          {{ formatDateTime(row.log.created_at) }}
        </template>

        <template #cell-nama="{ row }">
          <div class="flex flex-col">
            <span class="font-semibold text-[var(--app-text)]">{{
              row.log.actor_name || '-'
            }}</span>
            <span class="text-[12px] text-[var(--app-muted)]">{{ row.log.actor_role || '-' }}</span>
          </div>
        </template>

        <template #cell-jenis="{ row }">
          {{ getJenisSuratLabel(row.log.surat_type) }}
        </template>

        <template #cell-aktivitas="{ row }">
          <div class="flex flex-col">
            <span class="font-semibold text-[var(--app-text)]">{{ getActionLabel(row.log) }}</span>
            <span class="text-[12px] text-[var(--app-muted)]">{{ getActionDetail(row.log) }}</span>
          </div>
        </template>

        <template #cell-status="{ row }">
          <VChip :label="formatStatus(row.log)" :variant="getStatusVariant(row.log)" />
        </template>

        <template #cell-aksi="{ row }">
          <VActionButton variant="primary" @click="goToDetail(row.log)">Detail</VActionButton>
        </template>
      </VTable>

      <div class="flex items-center justify-between text-[13px] text-[var(--app-subtext)]">
        <span>Menampilkan {{ paginatedLogs.length }} dari {{ filteredLogs.length }} data</span>
      </div>

      <div v-if="totalPages > 1" class="flex justify-center">
        <VPagination v-model:current-page="currentPage" :total-pages="totalPages" />
      </div>
    </div>
  </DashboardLayout>
</template>

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
    return `${fromStatus} -> ${toStatus}`
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
  const s = String(raw).trim().toLowerCase()
  if (['diajukan', 'pending', 'diproses'].includes(s)) return 'diajukan'
  if (['menunggu verifikasi kepsek', 'menunggu_verifikasi_kepsek', 'menunggu verifikasi'].includes(s)) return 'menunggu_verifikasi_kepsek'
  if (['verified', 'disetujui', 'selesai'].includes(s)) return 'verified'
  if (['rejected', 'ditolak'].includes(s)) return 'rejected'
  if (['dibatalkan'].includes(s)) return 'dibatalkan'
  if (['dihapus', 'deleted'].includes(s)) return 'dihapus'
  return s
}

const formatStatus = (log: ActivityLogItem) => {
  if (log.action === 'deleted') return 'Dihapus'
  const raw = String(log.status_to || log.status_from || '')
  const normalized = normalizeStatusValue(raw)
  if (!normalized) return '-'
  // display in title case
  return normalized
    .replace(/_/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const getStatusVariant = (log: ActivityLogItem) => {
  if (log.action === 'deleted') return 'secondary'
  const status = normalizeStatusValue(String(log.status_to || log.status_from || ''))
  if (status === 'diajukan') return 'tertiary'
  if (status === 'menunggu_verifikasi_kepsek') return 'warning'
  if (status === 'verified') return 'deep'
  if (['rejected', 'dibatalkan', 'dihapus'].includes(status)) return 'secondary'
  return 'tertiary'
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
  const normalized = query.toLowerCase()
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

  return haystack.includes(normalized)
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
    const statusRaw = latest.action === 'deleted' ? 'dihapus' : String(latest.status_to || latest.status_from || '')
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
  paginatedLogs.value.map((group, idx) => ({
    index: rowStartIndex.value + idx + 1,
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
