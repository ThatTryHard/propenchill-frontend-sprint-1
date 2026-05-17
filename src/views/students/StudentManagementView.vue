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
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VCard from '@/components/common/VCard.vue'
import StatCard from '@/components/common/StatCard.vue'
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
    kelas.value,
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
      { key: 'nomor', label: 'Nomor', align: 'center' as const },
      { key: 'nama', label: 'Nama', align: 'center' as const },
      { key: 'email', label: 'Email', align: 'center' as const },
      { key: 'kelas', label: 'Kelas', align: 'center' as const },
      { key: 'aksi', label: 'Aksi', align: 'center' as const },
    ]
  }

  return [
    { key: 'nomor', label: 'Nomor', align: 'center' as const },
    { key: 'nama', label: 'Nama', align: 'center' as const },
    { key: 'nisn', label: 'NISN', align: 'center' as const },
    { key: 'nis', label: 'NIS', align: 'center' as const },
    { key: 'email', label: 'Email', align: 'center' as const },
    { key: 'kelas', label: 'Kelas', align: 'center' as const },
    { key: 'aksi', label: 'Aksi', align: 'center' as const },
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
      <SIMPSidebar />
    </template>

    <main
      class="
        min-h-full bg-[var(--app-bg)] px-10 py-6
        font-[var(--font-sans)] text-[var(--app-text)]
        max-[768px]:px-4
      "
    >
      <div class="mx-auto flex w-full max-w-[1180px] flex-col gap-4">
        <section
          class="
            flex items-start justify-between gap-6
            max-[900px]:flex-col max-[900px]:items-start
          "
        >
          <div class="flex flex-col gap-2">
            <h1
              class="
                m-0 text-[length:var(--app-page-title-font)]
                font-extrabold leading-[1.2] text-[var(--app-heading)]
              "
            >
              Manajemen Siswa dan Staf
            </h1>

            <p
              class="
                m-0 text-[length:var(--app-page-subtitle-font)]
                leading-[1.2] text-[var(--app-muted)]
              "
            >
              Lihat dan kelola Siswa dan Staf
            </p>
          </div>

          <div
            class="
              flex shrink-0 items-center justify-end gap-3
              max-[900px]:w-full max-[900px]:justify-start
              max-[640px]:flex-col max-[640px]:items-stretch
            "
          >
            <VButton
              variant="primary"
              @click="openCreateModal"
            >
              <template #leftIcon>
                <Plus :size="18" />
              </template>

              Tambah Data Siswa
            </VButton>

            <VButton
              variant="secondary"
              @click="openStaffModal"
            >
              <template #leftIcon>
                <Plus :size="18" />
              </template>

              Tambah Data Staf
            </VButton>
          </div>
        </section>

        <section class="grid grid-cols-3 gap-4 max-[768px]:grid-cols-1">
          <StatCard
            title="Total Data"
            :value="totalData"
            :icon-src="databaseIcon"
            icon-alt="Database Icon"
          />

          <StatCard
            title="Siswa"
            :value="totalSiswa"
            :icon-src="studentIcon"
            icon-alt="Student Icon"
          />

          <StatCard
            title="Staf"
            :value="totalStaf"
            :icon-src="staffIcon"
            icon-alt="Staff Icon"
          />
        </section>

        <VCard
          padding-class="p-3"
          class="w-full"
        >
          <div class="flex w-full flex-col gap-3">
            <div
              class="
                flex items-center justify-between gap-4
                max-[640px]:flex-col max-[640px]:items-start
              "
            >
              <div class="flex items-center gap-2">
                <Filter class="h-6 w-6 text-[var(--app-heading)]" />

                <b
                  class="
                    text-[length:var(--app-card-title-font)]
                    font-bold leading-[1.2] text-[var(--app-heading)]
                  "
                >
                  Filter Data
                </b>
              </div>

              <VButton
                variant="tertiary"
                size="sm"
                @click="resetFilter"
              >
                <template #leftIcon>
                  <RotateCcw :size="16" />
                </template>

                Reset
              </VButton>
            </div>

            <div
              class="
                grid grid-cols-2 gap-x-5 gap-y-3
                max-[900px]:grid-cols-1
              "
            >
              <div
                class="
                  grid grid-cols-[80px_280px] items-center gap-3
                  max-[900px]:grid-cols-[92px_1fr]
                "
              >
                <label
                  class="
                    text-[length:var(--app-input-label-font)]
                    font-semibold leading-[1.2] text-[var(--app-heading)]
                  "
                >
                  Nama
                </label>

                <VInputField
                  v-model="namaFilter"
                  placeholder="Masukkan nama"
                />
              </div>

              <div
                class="
                  grid grid-cols-[110px_280px] items-center gap-3
                  max-[900px]:grid-cols-[120px_1fr]
                "
              >
                <label
                  class="
                    text-[length:var(--app-input-label-font)]
                    font-semibold leading-[1.2] text-[var(--app-heading)]
                  "
                >
                  Nomor Induk
                </label>

                <VInputField
                  v-model="nomorInduk"
                  placeholder="NIS / NISN"
                />
              </div>

              <div
                class="
                  grid grid-cols-[80px_280px] items-center gap-3
                  max-[900px]:grid-cols-[92px_1fr]
                "
              >
                <label
                  class="
                    text-[length:var(--app-input-label-font)]
                    font-semibold leading-[1.2] text-[var(--app-heading)]
                  "
                >
                  Kelas
                </label>

                <VInputField
                  v-model="kelas"
                  placeholder="Masukkan kelas"
                />
              </div>

              <div
                class="
                  grid grid-cols-[110px_280px] items-center gap-3
                  max-[900px]:grid-cols-[120px_1fr]
                "
              >
                <label
                  class="
                    text-[length:var(--app-input-label-font)]
                    font-semibold leading-[1.2] text-[var(--app-heading)]
                  "
                >
                  Tipe Data
                </label>

                <VDropdown
                  v-model="selectedDataType"
                  :options="dataTypeOptions"
                  placeholder="Pilih Data"
                />
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
          class="
            rounded-[14px] border border-[var(--app-danger-border)]
            bg-[var(--app-danger-bg)] px-[26px] py-[22px]
            text-[length:var(--app-font-sm)] font-semibold
            text-[var(--app-danger)]
          "
        >
          {{ studentStore.error }}
        </div>

        <div
          v-if="selectedDataType === 'Staf'"
          class="
            rounded-[14px] border border-[var(--app-card-border)]
            bg-[var(--app-card)] px-[26px] py-[22px]
            text-[length:var(--app-font-sm)] font-semibold
            text-[var(--app-heading)]
          "
        >
          Data staf belum tersedia.
        </div>

        <div
          v-else
          class="flex flex-col gap-4"
        >
          <VTable
            :columns="tableColumns"
            :rows="tableRows"
            :is-loading="studentStore.loading"
          >
            <template #cell-nomor="{ value }">
              <span class="text-inherit">
                {{ value }}
              </span>
            </template>

            <template #cell-nama="{ value }">
              <span class="font-medium text-inherit">
                {{ value }}
              </span>
            </template>

            <template #cell-nisn="{ value }">
              <span class="text-inherit">
                {{ value }}
              </span>
            </template>

            <template #cell-nis="{ value }">
              <span class="text-inherit">
                {{ value }}
              </span>
            </template>

            <template #cell-email="{ value }">
              <span class="break-all text-inherit">
                {{ value }}
              </span>
            </template>

            <template #cell-kelas="{ value }">
              <span class="text-inherit">
                {{ value }}
              </span>
            </template>

            <template #cell-jenis_kelamin_label="{ value }">
              <span class="text-inherit">
                {{ value }}
              </span>
            </template>

            <template #cell-aksi="{ row }">
              <div class="flex justify-center gap-2">
                <VButton
                  variant="tertiary"
                  size="sm"
                  @click="openDetailModal(row)"
                >
                  <template #leftIcon>
                    <Eye :size="14" />
                  </template>

                  Detail
                </VButton>

                <VButton
                  variant="secondary"
                  size="sm"
                  @click="openEditModal(row)"
                >
                  <template #leftIcon>
                    <Pencil :size="14" />
                  </template>

                  Edit
                </VButton>

                <VButton
                  variant="primary"
                  size="sm"
                  @click="openDeleteModal(row.id_siswa, row.nama)"
                >
                  <template #leftIcon>
                    <Trash2 :size="14" />
                  </template>

                  Hapus
                </VButton>
              </div>
            </template>
          </VTable>

          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div
                class="
                  text-[length:var(--app-font-sm)]
                  font-semibold text-[var(--app-muted)]
                "
              >
                Show All
              </div>

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
                @click="isImportModalOpen = true"
              >
                <template #leftIcon>
                  <Upload :size="18" />
                </template>

                Import
              </VButton>

              <VButton
                variant="primary"
                @click="isExportModalOpen = true"
              >
                <template #leftIcon>
                  <Download :size="18" />
                </template>

                Export
              </VButton>
            </div>
          </div>
        </div>
      </div>
    </main>

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