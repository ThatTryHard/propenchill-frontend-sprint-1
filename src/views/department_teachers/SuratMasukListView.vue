<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import { useGlobalAlert } from '@/composables/useGlobalAlert'
import { useSuratMasukStore } from '@/stores/surat-masuk'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VCard from '@/components/common/VCard.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VTable from '@/components/common/VTable.vue'
import VChip from '@/components/common/VChip.vue'
import VPagination from '@/components/common/VPagination.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import { SearchIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const suratMasukStore = useSuratMasukStore()
const { showAlert } = useGlobalAlert()

const isAdmin = computed(() => authStore.role === 'ADMIN')
const isKepsek = computed(() => authStore.role === 'KEPSEK')
const canDeleteArsip = computed(() => !isKepsek.value)

const getCurrentUserId = () => {
  const rawUser = JSON.parse(localStorage.getItem('user') || 'null') as { id?: number } | null

  if (typeof rawUser?.id === 'number') {
    return rawUser.id
  }

  const rawUserData = JSON.parse(localStorage.getItem('user_data') || 'null') as {
    id?: number
  } | null

  if (typeof rawUserData?.id === 'number') {
    return rawUserData.id
  }

  return null
}

const isRowOwnedByCurrentUser = (row: {
  pencatat_id?: number | null
  pencatat_nama?: string | null
}) => {
  const currentUserId = getCurrentUserId()
  const currentUserName = (authStore.user?.nama || '').trim().toLowerCase()
  const pencatatName = (row.pencatat_nama || '').trim().toLowerCase()

  const isOwnerById = currentUserId !== null && row.pencatat_id === currentUserId
  const isOwnerByName = Boolean(currentUserName && pencatatName && currentUserName === pencatatName)

  return isOwnerById || isOwnerByName
}

const canDeleteRow = (row: {
  status?: string
  pencatat_id?: number | null
  pencatat_nama?: string | null
}) => {
  const status = String(row.status || '')

  if (!canDeleteArsip.value) {
    return false
  }

  if (isAdmin.value) {
    return status === 'diajukan'
  }

  return status === 'diajukan' && isRowOwnedByCurrentUser(row)
}

const filters = reactive({
  search: '',
  start_date: '',
  end_date: '',
  status: '',
})

const deleteModal = reactive({
  isOpen: false,
  targetId: null as number | null,
})

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Diajukan', value: 'diajukan' },
  { label: 'Menunggu Verifikasi', value: 'menunggu_verifikasi_kepsek' },
]

const tableColumns = [
  { key: 'nomor_surat', label: 'No. Surat', align: 'center' as const },
  { key: 'tanggal_terima', label: 'Tgl Terima', align: 'center' as const },
  { key: 'pengirim', label: 'Instansi Pengirim', align: 'center' as const },
  { key: 'perihal', label: 'Perihal', align: 'center' as const },
  { key: 'status', label: 'Status', align: 'center' as const },
  { key: 'aksi', label: 'Aksi', align: 'center' as const },
]

const fetchSurat = async (page = 1) => {
  try {
    await suratMasukStore.fetchSuratMasukList({
      page,
      search: filters.search,
      start_date: filters.start_date,
      end_date: filters.end_date,
      status: filters.status,
    })
  } catch {
    showAlert('error', 'Gagal memuat data arsip surat masuk.', 'Error')
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatStatus = (status: string) => {
  if (status === 'diajukan') return 'Diajukan'
  if (status === 'menunggu_verifikasi_kepsek') return 'Menunggu Verifikasi'

  return status
}

const getChipVariant = (status: string) => {
  if (status === 'diajukan') return 'secondary'
  if (status === 'menunggu_verifikasi_kepsek') return 'primary'

  return 'tertiary'
}

const handlePageChange = (newPage: number) => {
  fetchSurat(newPage)
}

const goToDetail = (id: number) => {
  if (isAdmin.value) {
    router.push(`/admin/surat-masuk/${id}`)
  } else if (isKepsek.value) {
    router.push(`/kepsek/surat-masuk/${id}`)
  } else {
    router.push(`/department-teachers/surat-masuk/${id}`)
  }
}

const confirmDelete = (id: number) => {
  const row = suratMasukStore.suratList.find((item) => item.id_surat_masuk === id)

  if (!row || !canDeleteRow(row)) {
    return
  }

  deleteModal.targetId = id
  deleteModal.isOpen = true
}

const handleDeleteConfirmed = async () => {
  if (deleteModal.targetId === null) {
    return
  }

  const targetId = deleteModal.targetId

  try {
    await suratMasukStore.deleteSuratMasuk(targetId)
    showAlert('success', 'Data surat berhasil dihapus.', 'Berhasil')
    deleteModal.isOpen = false
    deleteModal.targetId = null
    fetchSurat(suratMasukStore.pagination.halaman_saat_ini)
  } catch (error: unknown) {
    const payload =
      typeof error === 'object' && error !== null
        ? (error as { response?: { data?: { error?: string } } })
        : undefined

    const msg = payload?.response?.data?.error || 'Gagal menghapus surat.'
    showAlert('error', msg, 'Gagal')
  }
}

onMounted(() => {
  fetchSurat()
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main
      class="
        flex min-h-screen w-full flex-col gap-6
        bg-[var(--app-bg)] p-8
        font-[var(--font-sans)] text-[var(--app-text)]
        max-[768px]:px-4
      "
    >
      <section
        class="
          flex items-start justify-between gap-4
          max-[768px]:flex-col
        "
      >
        <div>
          <h1
            class="
              m-0 text-[length:var(--app-page-title-font)]
              font-extrabold leading-[1.2] text-[var(--app-heading)]
            "
          >
            Arsip Surat Masuk
          </h1>

          <p
            class="
              mt-1 mb-0 text-[length:var(--app-page-subtitle-font)]
              leading-[1.4] text-[var(--app-muted)]
            "
          >
            Kelola dan pantau seluruh daftar surat masuk kedinasan.
          </p>
        </div>
      </section>

      <VCard
        padding-class="p-6"
        class="relative z-30 overflow-visible"
      >
        <div class="flex w-full flex-col gap-5">
          <div
            class="
              grid w-full grid-cols-[minmax(0,1fr)_auto]
              items-end gap-4
              max-[768px]:grid-cols-1
            "
          >
            <div class="flex min-w-0 flex-col gap-2">
              <label
                class="
                  text-[length:var(--app-input-label-font)]
                  font-semibold leading-[1.2] text-[var(--app-heading)]
                "
              >
                Pencarian
              </label>

              <VInputField
                v-model="filters.search"
                state="search"
                placeholder="Cari no surat, perihal..."
                @keyup.enter="fetchSurat(1)"
              />
            </div>

            <div class="flex justify-end max-[768px]:justify-stretch">
              <VButton
                variant="primary"
                size="sm"
                class="h-[40px] min-w-[112px] max-[768px]:w-full"
                @click="fetchSurat(1)"
              >
                <template #leftIcon>
                  <SearchIcon class="h-4 w-4" />
                </template>

                Cari
              </VButton>
            </div>
          </div>

          <div
            class="
              grid w-full grid-cols-3 gap-4
              max-[900px]:grid-cols-1
            "
          >
            <VInputField
              v-model="filters.start_date"
              type="date"
              label="Dari Tanggal"
            />

            <VInputField
              v-model="filters.end_date"
              type="date"
              label="Sampai Tanggal"
            />

            <div class="relative z-30 flex flex-col gap-2">
              <label
                class="
                  text-[length:var(--app-input-label-font)]
                  font-semibold leading-[1.2] text-[var(--app-heading)]
                "
              >
                Status Surat
              </label>

              <VDropdown
                v-model="filters.status"
                :options="statusOptions"
                placeholder="Semua Status"
              />
            </div>
          </div>
        </div>
      </VCard>

      <div class="relative z-10">
        <VTable
          :columns="tableColumns"
          :rows="suratMasukStore.suratList"
          :is-loading="suratMasukStore.loadingList"
        >
          <template #cell-nomor_surat="{ row }">
            <span
              class="
                text-[length:var(--app-table-cell-font)]
                font-semibold leading-[1.35] text-[var(--app-heading)]
              "
            >
              {{ row.nomor_surat_sistem || row.nomor_surat_pengirim || '-' }}
            </span>
          </template>

          <template #cell-tanggal_terima="{ value }">
            <span
              class="
                whitespace-nowrap text-[length:var(--app-table-cell-font)]
                leading-[1.35] text-[var(--app-muted)]
              "
            >
              {{ formatDate(value) }}
            </span>
          </template>

          <template #cell-pengirim="{ row }">
            <span
              class="
                line-clamp-2 text-[length:var(--app-table-cell-font)]
                leading-[1.35] text-[var(--app-text)]
              "
              :title="row.pengirim?.nama_instansi"
            >
              {{ row.pengirim?.nama_instansi || '-' }}
            </span>
          </template>

          <template #cell-perihal="{ value }">
            <span
              class="
                line-clamp-2 text-[length:var(--app-table-cell-font)]
                leading-[1.35] text-[var(--app-text)]
              "
              :title="value"
            >
              {{ value || '-' }}
            </span>
          </template>

          <template #cell-status="{ value }">
            <VChip
              :label="formatStatus(value)"
              :variant="getChipVariant(value)"
            />
          </template>

          <template #cell-aksi="{ row }">
            <div class="flex flex-wrap items-center justify-center gap-2">
              <VButton
                variant="secondary"
                size="sm"
                @click="goToDetail(row.id_surat_masuk)"
              >
                Detail
              </VButton>

              <VButton
                variant="primary"
                size="sm"
                :disabled="!canDeleteRow(row)"
                @click="confirmDelete(row.id_surat_masuk)"
              >
                Hapus
              </VButton>
            </div>
          </template>
        </VTable>
      </div>

      <div
        v-if="suratMasukStore.pagination.total_halaman > 1"
        class="flex w-full justify-end"
      >
        <VPagination
          :current-page="suratMasukStore.pagination.halaman_saat_ini"
          :total-pages="suratMasukStore.pagination.total_halaman"
          :sibling-count="1"
          @page-change="handlePageChange"
        />
      </div>

      <ConfirmationModal
        v-model:isOpen="deleteModal.isOpen"
        title="Hapus Surat Masuk"
        description="Apakah Anda yakin ingin menghapus surat ini? Tindakan ini tidak dapat dikembalikan."
        confirmText="Hapus"
        cancelText="Batal"
        :loading="suratMasukStore.deleting"
        @confirm="handleDeleteConfirmed"
      />
    </main>
  </DashboardLayout>
</template>