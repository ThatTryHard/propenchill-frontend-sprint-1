<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import { useGlobalAlert } from '@/composables/useGlobalAlert'
import { useSuratMasukStore } from '@/stores/surat-masuk' // IMPORT STORE

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import DepartmentTeacherSidebar from '@/components/department_teachers/DepartmentTeacherSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VTable from '@/components/common/VTable.vue'
import VChip from '@/components/common/VChip.vue'
import VPagination from '@/components/common/VPagination.vue'
import { SearchIcon } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const suratMasukStore = useSuratMasukStore() // INISIALISASI
const { showAlert } = useGlobalAlert()

// STATE FILTER
const filters = reactive({
  search: '',
  start_date: '',
  end_date: '',
  status: '',
})

const statusOptions = [
  { label: 'Semua Status', value: '' },
  { label: 'Diajukan', value: 'diajukan' },
  { label: 'Menunggu Verifikasi', value: 'menunggu_verifikasi_pimpinan' },
]

const tableColumns = [
  { key: 'nomor_agenda', label: 'No. Agenda' },
  { key: 'tanggal_terima', label: 'Tgl Terima' },
  { key: 'pengirim', label: 'Instansi Pengirim' },
  { key: 'perihal', label: 'Perihal' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: 'Aksi' },
]

// REVISI: Fungsi Fetch pake Store
const fetchSurat = async (page = 1) => {
  try {
    await suratMasukStore.fetchSuratMasukList({
      page: page,
      search: filters.search,
      start_date: filters.start_date,
      end_date: filters.end_date,
      status: filters.status,
    })
  } catch (error) {
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
  if (status === 'menunggu_verifikasi_pimpinan') return 'Menunggu Verifikasi'
  return status
}

const getChipVariant = (status: string) => {
  if (status === 'diajukan') return 'secondary'
  if (status === 'menunggu_verifikasi_pimpinan') return 'primary'
  return 'tertiary'
}

const handlePageChange = (newPage: number) => {
  fetchSurat(newPage)
}

const goToDetail = (id: number) => router.push(`/department-teachers/surat-masuk/${id}`)
const openFile = (fileUrl: string) => window.open(fileUrl, '_blank')

// PBI-14: Implementasi Hapus pake Store
const confirmDelete = async (id: number) => {
  if (confirm('Apakah Anda yakin ingin menghapus surat ini?')) {
    try {
      await suratMasukStore.deleteSuratMasuk(id)
      showAlert('success', 'Data surat berhasil dihapus.', 'Berhasil')
      fetchSurat(suratMasukStore.pagination.halaman_saat_ini)
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Gagal menghapus surat.'
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
      <DepartmentTeacherSidebar
        :userName="authStore.user?.nama"
        :userEmail="authStore.user?.email"
      />
    </template>

    <div class="w-full min-h-screen bg-transparent">
      <div class="w-full max-w-[1120px] mx-auto px-8 py-8 max-[768px]:px-4 flex flex-col gap-6">
        <section class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="m-0 text-[28px] leading-[120%] font-extrabold text-[#111827]">
              Arsip Surat Masuk
            </h1>
            <p class="mt-1 mb-0 text-[16px] leading-[140%] text-[#71757b]">
              Kelola dan pantau seluruh daftar surat masuk kedinasan.
            </p>
          </div>
        </section>

        <div class="bg-white border border-[#e2e8f0] rounded-[28px] p-6">
          <div class="flex flex-col md:flex-row items-end gap-4">
            <div class="w-full md:w-[35%]">
              <VInputField
                v-model="filters.search"
                state="search"
                placeholder="Cari no surat, perihal..."
              />
            </div>
            <div class="w-full md:w-[20%]">
              <VInputField type="date" v-model="filters.start_date" label="Dari Tanggal" />
            </div>
            <div class="w-full md:w-[20%]">
              <VInputField type="date" v-model="filters.end_date" label="Sampai Tanggal" />
            </div>
            <div class="w-full md:w-[25%]">
              <label class="text-[16px] font-semibold leading-[120%] text-[#111827] mb-2 block">
                Status Surat
              </label>
              <VDropdown
                v-model="filters.status"
                :options="statusOptions"
                placeholder="Semua Status"
              />
            </div>
            <div class="w-full md:w-auto">
              <button
                @click="fetchSurat(1)"
                class="h-[52px] px-6 rounded-[12px] bg-[#3f9760] hover:bg-[#2f8a50] text-white font-semibold transition-colors"
              >
                Cari
              </button>
            </div>
          </div>
        </div>

        <div class="w-full">
          <VTable
            :columns="tableColumns"
            :rows="suratMasukStore.suratList"
            :isLoading="suratMasukStore.loadingList"
          >
            <template #cell-tanggal_terima="{ value }">
              {{ formatDate(value) }}
            </template>

            <template #cell-pengirim="{ row }">
              {{ row.pengirim?.nama_instansi || '-' }}
            </template>

            <template #cell-status="{ value }">
              <VChip :label="formatStatus(value)" :variant="getChipVariant(value)" />
            </template>

            <template #cell-aksi="{ row }">
              <div class="flex items-center gap-2">
                <VButton
                  v-if="row.file_lampiran"
                  variant="tertiary"
                  @click="openFile(row.file_lampiran)"
                  class="!px-3 !py-1.5 !text-sm !rounded-[12px]"
                >
                  Lihat File
                </VButton>

                <VButton
                  variant="secondary"
                  @click="goToDetail(row.id_surat_masuk)"
                  class="!px-3 !py-1.5 !text-sm !rounded-[12px]"
                >
                  Detail
                </VButton>

                <VButton
                  variant="login"
                  @click="confirmDelete(row.id_surat_masuk)"
                  class="!px-3 !py-1.5 !text-sm !rounded-[12px] !bg-[#A0453B] hover:!bg-[#81413c]"
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
    </div>
  </DashboardLayout>
</template>
