<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import {
  Download,
  Upload,
  Plus,
  Pencil,
  Trash2,
  Filter,
  RotateCcw,
  Eye,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import VToast from '@/components/common/VToast.vue'
import { useStudentStore, type Student } from '@/stores/students'
import { useAuthStore } from '@/stores/users/auth'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import StudentSidebar from '@/components/admin/students/StudentSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VCard from '@/components/common/VCard.vue'
import VTable from '@/components/common/VTable.vue'
import VPagination from '@/components/common/VPagination.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import CreateStudentModal from '@/components/admin/students/CreateStudentModal.vue'
import EditStudentModal from '@/components/admin/students/EditStudentModal.vue'
import DeleteConfirmationModal from '@/components/admin/students/DeleteConfirmationModal.vue'
import ImportStudentModal from '@/components/admin/students/ImportStudentModal.vue'
import ExportStudentModal from '@/components/admin/students/ExportStudentModal.vue'
import StudentDetailModal from '@/components/admin/students/StudentDetailModal.vue'

import databaseIcon from '@/assets/Database_Logo SVG.svg'
import studentIcon from '@/assets/Siswa SVG.svg'
import staffIcon from '@/assets/PC SVG.svg'

const studentStore = useStudentStore()
const authStore = useAuthStore()

const selectedDataType = ref<'Siswa' | 'Staf'>('Siswa')

const dataTypeOptions = [
  { label: 'Siswa', value: 'Siswa' },
  { label: 'Staf', value: 'Staf' },
]

const search = ref('')
const kelas = ref('')
const nomorInduk = ref('')
const namaFilter = ref('')
const currentPage = ref(1)
const limit = ref(10)

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isImportModalOpen = ref(false)
const isExportModalOpen = ref(false)
const isDetailModalOpen = ref(false)

const selectedStudent = ref<Student | null>(null)
const selectedStudentId = ref<number | null>(null)
const selectedStudentName = ref('')

const isAdmin = computed(() => authStore.role === 'ADMIN')

const combinedQuery = computed(() => {
  return search.value || namaFilter.value || nomorInduk.value
})

const loadStudents = async () => {
  if (selectedDataType.value === 'Staf') return

  await studentStore.fetchStudents(
    currentPage.value,
    limit.value,
    combinedQuery.value,
    kelas.value
  )
}

const loadSummary = async () => {
  await studentStore.fetchSummary()
}

const openCreateModal = () => {
  isCreateModalOpen.value = true
}

const openStaffModal = () => {
  toast.custom(VToast, {
    componentProps: {
      message: 'Manajemen data staf belum tersedia.',
    },
  })
}

const openDetailModal = async (student: Student) => {
  const detail = await studentStore.getStudentDetail(student.id_siswa)
  selectedStudent.value = detail || student
  isDetailModalOpen.value = true
}

const openEditModal = async (student: Student) => {
  const detail = await studentStore.getStudentDetail(student.id_siswa)
  selectedStudent.value = detail || student
  isEditModalOpen.value = true
}

const openDeleteModal = (id_siswa: number, name: string) => {
  selectedStudentId.value = id_siswa
  selectedStudentName.value = name
  isDeleteModalOpen.value = true
}

const handleStudentCreated = async () => {
  await loadStudents()
  await loadSummary()
}

const handleStudentUpdated = async () => {
  await loadStudents()
}

const handleStudentDeleted = async () => {
  if (studentStore.students.length === 1 && currentPage.value > 1) {
    currentPage.value--
  }

  await loadStudents()
  await loadSummary()
}

const handleStudentImported = async () => {
  currentPage.value = 1
  await loadStudents()
  await loadSummary()
  isImportModalOpen.value = false
}

const resetFilter = async () => {
  search.value = ''
  kelas.value = ''
  nomorInduk.value = ''
  namaFilter.value = ''
  currentPage.value = 1
  await loadStudents()
}

const totalData = computed(() => studentStore.summary.total_data)
const totalSiswa = computed(() => studentStore.summary.total_siswa)
const totalStaf = computed(() => studentStore.summary.total_staff)

const tableColumns = computed(() => {
  if (selectedDataType.value === 'Staf') {
    return [
      { key: 'nomor', label: 'Nomor' },
      { key: 'nama', label: 'Nama' },
      { key: 'email', label: 'Email' },
      { key: 'kelas', label: 'Kelas' },
      { key: 'aksi', label: 'Aksi' },
    ]
  }

  return [
    { key: 'nomor', label: 'Nomor' },
    { key: 'nama', label: 'Nama' },
    { key: 'nisn', label: 'NISN' },
    { key: 'nis', label: 'NIS' },
    { key: 'email', label: 'Email' },
    { key: 'kelas', label: 'Kelas' },
    { key: 'aksi', label: 'Aksi' },
  ]
})

const tableRows = computed(() => {
  if (selectedDataType.value === 'Staf') return []

  return studentStore.students.map((student, index) => ({
    ...student,
    nomor:
      (studentStore.pagination.halaman_sekarang - 1) *
        studentStore.pagination.limit +
      index +
      1,
  }))
})

watch([search, kelas, namaFilter, nomorInduk], async () => {
  currentPage.value = 1
  await loadStudents()
})

watch(currentPage, async () => {
  await loadStudents()
})

watch(selectedDataType, async () => {
  currentPage.value = 1
  await loadStudents()
})

onMounted(async () => {
  await Promise.all([loadStudents(), loadSummary()])
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <StudentSidebar
        :userName="authStore.user?.nama"
        :userEmail="authStore.user?.email"
      />
    </template>

    <div class="w-full max-w-[1180px] mx-auto px-10 py-8 flex flex-col gap-6 max-[768px]:px-4">
      <section class="flex items-start justify-between gap-8 max-[1200px]:flex-col max-[1200px]:items-start">
        <div class="flex flex-col gap-2">
          <h1 class="m-0 text-[32px] leading-[120%] font-extrabold text-[#111827]">
            Manajemen Basis Data Siswa dan Staf
          </h1>
          <p class="m-0 text-[20px] leading-[120%] text-[#858a91]">
            Lihat dan kelola Basis Data Siswa dan Staf
          </p>
        </div>

        <div class="flex flex-col gap-4 w-[320px] max-[1200px]:w-full">
          <div class="flex flex-col gap-4 w-full max-[1200px]:flex-row max-[640px]:flex-col">
            <VButton
              variant="primary"
              class="!h-[48px] !rounded-[20px] !text-[16px] !font-semibold"
              @click="openCreateModal"
            >
              <template #leftIcon><Plus :size="18" /></template>
              Tambah Data Siswa
            </VButton>

            <VButton
              variant="secondary"
              class="!h-[48px] !rounded-[20px] !text-[16px] !font-semibold !bg-[#c9e9da] !text-[#111827] !border-0"
              @click="openStaffModal"
            >
              <template #leftIcon><Plus :size="18" /></template>
              Tambah Data Staf
            </VButton>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-3 gap-5 max-[1200px]:grid-cols-1">
        <VCard paddingClass="p-0">
          <div class="relative h-[186px] overflow-hidden rounded-[28px]">
            <div class="absolute top-[48px] left-1/2 -translate-x-1/2 w-[218px] flex flex-col items-center gap-[14px] z-[2]">
              <b class="w-full text-center text-[32px] leading-[120%] text-[#111827]">Total Data</b>
              <b class="w-full text-center text-[32px] leading-[120%] bg-[radial-gradient(77.91%_77.91%_at_50%_100%,#3f9760_4.91%,#0c4923)] bg-clip-text text-transparent">
                {{ totalData }}
              </b>
            </div>
            <img
              :src="databaseIcon"
              alt="Database Icon"
              class="absolute left-[-14px] bottom-[-6px] w-[100px] h-[100px] object-contain z-[1]"
            />
          </div>
        </VCard>

        <VCard paddingClass="p-0">
          <div class="relative h-[186px] overflow-hidden rounded-[28px]">
            <div class="absolute top-[34px] left-1/2 -translate-x-1/2 w-[218px] flex flex-col items-center gap-[14px] z-[2]">
              <b class="w-full text-center text-[32px] leading-[120%] text-[#111827]">Siswa</b>
              <b class="w-full text-center text-[32px] leading-[120%] bg-[radial-gradient(77.91%_77.91%_at_50%_100%,#3f9760_4.91%,#0c4923)] bg-clip-text text-transparent">
                {{ totalSiswa }}
              </b>
            </div>
            <img
              :src="studentIcon"
              alt="Student Icon"
              class="absolute left-[-14px] bottom-[-6px] w-[100px] h-[100px] object-contain z-[1]"
            />
          </div>
        </VCard>

        <VCard paddingClass="p-0">
          <div class="relative h-[186px] overflow-hidden rounded-[28px]">
            <div class="absolute top-[34px] left-1/2 -translate-x-1/2 w-[218px] flex flex-col items-center gap-[14px] z-[2]">
              <b class="w-full text-center text-[32px] leading-[120%] text-[#111827]">Staf</b>
              <b class="w-full text-center text-[32px] leading-[120%] bg-[radial-gradient(77.91%_77.91%_at_50%_100%,#3f9760_4.91%,#0c4923)] bg-clip-text text-transparent">
                {{ totalStaf }}
              </b>
            </div>
            <img
              :src="staffIcon"
              alt="Staff Icon"
              class="absolute left-[-9px] bottom-[-4px] w-[84px] h-[84px] object-contain z-[1]"
            />
          </div>
        </VCard>
      </section>

      <VCard paddingClass="px-4 py-[34px]">
        <div class="flex flex-col gap-5 w-full">
          <div class="flex items-center justify-between gap-5 max-[1100px]:flex-col max-[1100px]:items-start">
            <div class="flex items-center gap-[10px]">
              <Filter class="w-10 h-10 text-[#111827]" />
              <b class="text-[24px] leading-[120%] text-[#111827] font-bold">Filter Data</b>
            </div>

            <div class="w-[254px] max-[1100px]:w-full">
              <VDropdown
                v-model="selectedDataType"
                :options="dataTypeOptions"
                placeholder="Pilih Data"
              />
            </div>
          </div>

          <div class="grid grid-cols-4 gap-4 items-end max-[1200px]:grid-cols-2 max-[768px]:grid-cols-1">
            <div class="flex items-center gap-3">
              <div class="min-w-[72px] text-[20px] leading-[120%] font-semibold text-[#111827]">
                Nama
              </div>
              <VInputField
              v-model="namaFilter"
              placeholder="Masukkan nama"
              class="flex-1"
              />
            </div>

            <div class="flex items-center gap-3">
              <div class="min-w-[120px] text-[20px] leading-[120%] font-semibold text-[#111827]">
                Nomor Induk
              </div>
              <VInputField
                v-model="nomorInduk"
                placeholder="NIS / NISN"
                class="flex-1"
              />
            </div>

            <div class="flex items-center gap-3">
              <div class="min-w-[108px] text-[20px] leading-[120%] font-semibold text-[#111827]">
                Kelas
              </div>
              <VInputField
                v-model="kelas"
                placeholder="Masukkan kelas"
                class="flex-1"
              />
            </div>

            <div class="flex justify-end max-[768px]:justify-start">
              <button
                @click="resetFilter"
                type="button"
                class="h-[52px] w-[56px] rounded-[12px] border-2 border-transparent bg-[linear-gradient(#f8fafc,#f8fafc)_padding-box,linear-gradient(90.74deg,#3f9760,#d1955f)_border-box] flex items-center justify-center"
              >
                <RotateCcw class="w-6 h-6 text-[#111827]" />
              </button>
            </div>
          </div>
        </div>
      </VCard>

      <VInputField
        v-model="search"
        state="search"
        placeholder="Cari data siswa"
      />

      <div
        v-if="studentStore.error && !studentStore.loading && selectedDataType === 'Siswa'"
        class="bg-white rounded-[14px] px-[26px] py-[22px] text-[14px] font-semibold text-[#b42318]"
      >
        {{ studentStore.error }}
      </div>

      <div
        v-if="selectedDataType === 'Staf'"
        class="bg-white rounded-[14px] px-[26px] py-[22px] text-[14px] font-semibold text-[#111827]"
      >
        Data staf belum tersedia.
      </div>

      <div v-else class="flex flex-col gap-4">
        <VTable :columns="tableColumns" :rows="tableRows" :isLoading="studentStore.loading">
          <template #cell-nomor="{ value }">
            <div class="text-center text-[14px] text-[#202632]">{{ value }}</div>
          </template>

          <template #cell-nama="{ value }">
            <div class="text-center text-[14px] text-[#202632] font-medium">{{ value }}</div>
          </template>

          <template #cell-nisn="{ value }">
            <div class="text-center text-[14px] text-[#202632]">{{ value }}</div>
          </template>

          <template #cell-nis="{ value }">
            <div class="text-center text-[14px] text-[#202632]">{{ value }}</div>
          </template>

          <template #cell-email="{ value }">
            <div class="text-center text-[14px] text-[#202632] break-all">{{ value }}</div>
          </template>

          <template #cell-kelas="{ value }">
            <div class="text-center text-[14px] text-[#202632]">{{ value }}</div>
          </template>

          <template #cell-jenis_kelamin_label="{ value }">
            <div class="text-center text-[14px] text-[#202632]">{{ value }}</div>
          </template>

          <template #cell-aksi="{ row }">
            <div class="flex justify-center gap-2">
              <VButton
                variant="secondary"
                class="!h-[26px] !min-w-[66px] !px-[10px] !py-0 !rounded-[8px] !text-[12px] !font-medium !bg-[#e9f5ee] !text-[#111827] !border-0"
                @click="openDetailModal(row)"
              >
                <template #leftIcon><Eye :size="12" /></template>
                Detail
              </VButton>

              <VButton
                variant="secondary"
                class="!h-[26px] !min-w-[58px] !px-[10px] !py-0 !rounded-[8px] !text-[12px] !font-medium !bg-[#c9e9da] !text-[#111827] !border-0"
                @click="openEditModal(row)"
              >
                <template #leftIcon><Pencil :size="12" /></template>
                Edit
              </VButton>

              <VButton
                variant="primary"
                class="!h-[26px] !min-w-[64px] !px-[10px] !py-0 !rounded-[8px] !text-[12px] !font-medium"
                @click="openDeleteModal(row.id_siswa, row.nama)"
              >
                <template #leftIcon><Trash2 :size="12" /></template>
                Hapus
              </VButton>
            </div>
          </template>
        </VTable>

        <div class="flex flex-col gap-4">
          <div class="flex justify-between items-center">
            <div class="text-[16px] font-semibold text-[#858a91]">Show All</div>

            <VPagination
              v-model:currentPage="currentPage"
              :totalPages="studentStore.pagination.total_halaman"
              @page-change="loadStudents"
            />
          </div>

          <div
            v-if="isAdmin"
            class="flex items-center justify-between gap-4 max-[640px]:flex-col"
          >
            <VButton
              variant="secondary"
              class="!flex-1 !h-[48px] !rounded-[20px] !text-[16px] !font-semibold !bg-[#c9e9da] !text-[#111827] !border-0"
              @click="isImportModalOpen = true"
            >
              <template #leftIcon><Upload :size="18" /></template>
              Import
            </VButton>

            <VButton
              variant="primary"
              class="!flex-1 !h-[48px] !rounded-[20px] !text-[16px] !font-semibold !bg-[linear-gradient(90.74deg,#3f9760,#d1955f)] !text-white !border-0"
              @click="isExportModalOpen = true"
            >
              <template #leftIcon><Download :size="18" /></template>
              Export
            </VButton>
          </div>
        </div>
      </div>
    </div>

    <CreateStudentModal
      :isOpen="isCreateModalOpen"
      @update:isOpen="isCreateModalOpen = $event"
      @created="handleStudentCreated"
    />

    <StudentDetailModal
      :isOpen="isDetailModalOpen"
      :student="selectedStudent"
      @update:isOpen="isDetailModalOpen = $event"
    />

    <EditStudentModal
      :isOpen="isEditModalOpen"
      :student="selectedStudent"
      @update:isOpen="isEditModalOpen = $event"
      @updated="handleStudentUpdated"
    />

    <DeleteConfirmationModal
      :isOpen="isDeleteModalOpen"
      :studentId="selectedStudentId"
      :studentName="selectedStudentName"
      @update:isOpen="isDeleteModalOpen = $event"
      @confirmed="handleStudentDeleted"
    />

    <ImportStudentModal
      :isOpen="isImportModalOpen"
      @update:isOpen="isImportModalOpen = $event"
      @imported="handleStudentImported"
    />

    <ExportStudentModal
    :isOpen="isExportModalOpen"
    @update:isOpen="isExportModalOpen = $event"
    />
  </DashboardLayout>
</template>