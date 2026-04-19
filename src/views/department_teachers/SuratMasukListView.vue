<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import { useGlobalAlert } from '@/composables/useGlobalAlert'
import { useSuratMasukStore } from '@/stores/surat-masuk'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VTable from '@/components/common/VTable.vue'
import VChip from '@/components/common/VChip.vue'
import VPagination from '@/components/common/VPagination.vue'
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

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Diajukan', value: 'diajukan' },
  { label: 'Menunggu Verifikasi', value: 'menunggu_verifikasi_kepsek' },
]

const tableColumns = [
  { key: 'nomor_surat', label: 'No. Surat' },
  { key: 'tanggal_terima', label: 'Tgl Terima' },
  { key: 'pengirim', label: 'Instansi Pengirim' },
  { key: 'perihal', label: 'Perihal' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: 'Aksi' },
]

const fetchSurat = async (page = 1) => {
  try {
    await suratMasukStore.fetchSuratMasukList({
      page: page,
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
    // Default buat Guru Bidang (Department Teachers)
    router.push(`/department-teachers/surat-masuk/${id}`)
  }
}

const confirmDelete = async (id: number) => {
  const row = suratMasukStore.suratList.find((item) => item.id_surat_masuk === id)

  if (!row || !canDeleteRow(row)) {
    return
  }

  if (confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
    try {
      await suratMasukStore.deleteSuratMasuk(id)
      showAlert('success', 'Data surat berhasil dihapus.', 'Berhasil')
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

    <div
      class="w-full min-h-screen bg-[#f8fafc] p-8 max-[768px]:px-4 flex flex-col gap-6 font-sans"
    >
      <section class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="m-0 text-[28px] leading-[120%] font-extrabold text-[#1e293b]">
            Arsip Surat Masuk
          </h1>
          <p class="mt-1 mb-0 text-[16px] leading-[140%] text-[#64748b]">
            Kelola dan pantau seluruh daftar surat masuk kedinasan.
          </p>
        </div>
      </section>

      <div class="bg-white border border-[#e2e8f0] rounded-[24px] p-6 shadow-sm">
        <div class="flex flex-wrap items-end gap-4 w-full">
          <div class="flex-[3] min-w-[280px] flex flex-col gap-2">
            <label class="text-[16px] font-semibold leading-[120%] text-[#111827]">Pencarian</label>
            <VInputField
              v-model="filters.search"
              state="search"
              placeholder="Cari no surat, perihal..."
              @keyup.enter="fetchSurat(1)"
            />
          </div>

          <div class="flex-[1.5] min-w-[150px]">
            <VInputField type="date" v-model="filters.start_date" label="Dari Tanggal" />
          </div>

          <div class="flex-[1.5] min-w-[150px]">
            <VInputField type="date" v-model="filters.end_date" label="Sampai Tanggal" />
          </div>

          <div class="flex-[2] min-w-[180px] flex flex-col gap-2">
            <label class="text-[16px] font-semibold leading-[120%] text-[#111827]"
              >Status Surat</label
            >
            <VDropdown
              v-model="filters.status"
              :options="statusOptions"
              placeholder="Semua Status"
            />
          </div>

          <div class="flex-[1] min-w-[120px]">
            <button
              @click="fetchSurat(1)"
              class="w-full h-[56px] rounded-[12px] bg-[#3f9760] hover:bg-[#2f8a50] text-white font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <SearchIcon class="w-5 h-5" /> Cari
            </button>
          </div>
        </div>
      </div>

      <div class="w-full bg-white border border-[#e2e8f0] rounded-[24px] shadow-sm overflow-hidden">
        <VTable
          :columns="tableColumns"
          :rows="suratMasukStore.suratList"
          :isLoading="suratMasukStore.loadingList"
          class="w-full table-fixed break-words"
        >
          <template #cell-nomor_surat="{ row }">
            <span class="font-semibold text-[#1e293b]">
              {{ row.nomor_surat_sistem || row.nomor_surat_pengirim || '-' }}
            </span>
          </template>

          <template #cell-tanggal_terima="{ value }">
            <span class="whitespace-nowrap text-[#64748b]">{{ formatDate(value) }}</span>
          </template>

          <template #cell-pengirim="{ row }">
            <span class="text-[#334155] line-clamp-2" :title="row.pengirim?.nama_instansi">
              {{ row.pengirim?.nama_instansi || '-' }}
            </span>
          </template>

          <template #cell-perihal="{ value }">
            <span class="text-[#334155] line-clamp-2" :title="value">{{ value }}</span>
          </template>

          <template #cell-status="{ value }">
            <VChip
              :label="formatStatus(value)"
              :variant="getChipVariant(value)"
              class="whitespace-nowrap"
            />
          </template>

          <template #cell-aksi="{ row }">
            <div class="flex items-center gap-2 flex-wrap">
              <VButton
                variant="secondary"
                @click="goToDetail(row.id_surat_masuk)"
                class="!px-3 !py-1.5 !text-[13px] !rounded-[10px] !bg-white"
              >
                Detail
              </VButton>

              <VButton
                variant="login"
                @click="confirmDelete(row.id_surat_masuk)"
                :disabled="!canDeleteRow(row)"
                class="!px-3 !py-1.5 !text-[13px] !rounded-[10px] !bg-[#fee2e2] !text-[#dc2626] !border-none hover:!bg-[#fecaca]"
              >
                Hapus
              </VButton>
            </div>
          </template>
        </VTable>
      </div>

      <div class="w-full flex justify-end" v-if="suratMasukStore.pagination.total_halaman > 1">
        <VPagination
          :currentPage="suratMasukStore.pagination.halaman_saat_ini"
          :totalPages="suratMasukStore.pagination.total_halaman"
          :siblingCount="1"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </DashboardLayout>
</template>
