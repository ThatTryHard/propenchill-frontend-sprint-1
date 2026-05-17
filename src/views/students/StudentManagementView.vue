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
import { useTeacherStore, type Teacher } from '@/stores/teacher'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/users/auth'
import { useProfileStore } from '@/stores/profile'

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
import CreateTeacherModal from '@/components/admin/teachers/CreateTeacherModal.vue'
import EditTeacherModal from '@/components/admin/teachers/EditTeacherModal.vue'
import StaffDetailModal from '@/components/admin/teachers/StaffDetailModal.vue'

import databaseIcon from '@/assets/Database_Logo SVG.svg'
import studentIcon from '@/assets/Siswa SVG.svg'
import staffIcon from '@/assets/PC SVG.svg'

const studentStore = useStudentStore()
const teacherStore = useTeacherStore()
const adminStore = useAdminStore()
const authStore = useAuthStore()

const selectedDataType = ref<'Siswa' | 'Staf'>('Siswa')

const dataTypeOptions = [
  { label: 'Siswa', value: 'Siswa' },
  { label: 'Staf', value: 'Staf' },
]

const search = ref('')
const nomorInduk = ref('')
const namaFilter = ref('')
const emailFilter = ref('')
const currentPage = ref(1)
const limit = ref(10)

const isCreateModalOpen = ref(false)
const isCreateStaffModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isImportModalOpen = ref(false)
const isExportModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const isStaffDetailModalOpen = ref(false)

const selectedStudent = ref<Student | null>(null)
const selectedStudentId = ref<number | null>(null)
const selectedStudentName = ref('')
const selectedTeacher = ref<Teacher | null>(null)

const isAdmin = computed(() => authStore.role === 'ADMIN')

const combinedQuery = computed(() => search.value)


const loadStudents = async () => {
  await studentStore.fetchStudents(
    currentPage.value,
    limit.value,
    combinedQuery.value,
    '',
  )
}

const loadStaff = async () => {
  if (teacherStore.error) teacherStore.error = null
  await teacherStore.fetchTeachers(currentPage.value, combinedQuery.value, '', nomorInduk.value)
}

const loadSummary = async () => {
  await studentStore.fetchSummary()
}

const loadCurrentDataType = async () => {
  if (selectedDataType.value === 'Staf') {
    await loadStaff()
  } else {
    await loadStudents()
  }
}

const openCreateModal = () => { isCreateModalOpen.value = true }
const openStaffModal = () => { isCreateStaffModalOpen.value = true }

const openDetailModal = async (student: Student) => {
  const detail = await studentStore.getStudentDetail(student.id_siswa)
  const profileStore = useProfileStore()
  let profile = null

  if (authStore.user?.email && authStore.user.email === student.email) {
    profile = profileStore.profile
    if (!profile) {
      try {
        profile = await profileStore.fetchProfile()
      } catch {
        profile = null
      }
    }
  }

  selectedStudent.value = ({
    ...(detail || student),
    tanggal_lahir: profile?.tanggal_lahir ?? (detail?.tanggal_lahir ?? null),
    no_hp: profile?.nomor_hp ?? (detail?.no_hp ?? null),
    alamat: profile?.alamat ?? (detail?.alamat ?? null),
  } as unknown) as Student

  isDetailModalOpen.value = true
}

const openStaffDetail = async (teacher: Teacher) => {
  try {
    const detail = await teacherStore.fetchTeacherById(teacher.id)

    const profileStore = useProfileStore()
    let profile = null

    if (authStore.user?.email && authStore.user.email === teacher.email) {
      profile = profileStore.profile
      if (!profile) {
        profile = await profileStore.fetchProfile()
      }
    }

    selectedTeacher.value = ({
      ...detail,
      tanggal_lahir: profile?.tanggal_lahir ?? detail.tanggal_lahir ?? null,
      nomor_hp: profile?.nomor_hp ?? detail.nomor_hp ?? null,
      alamat: profile?.alamat ?? detail.alamat ?? null,
      is_verified: profile?.is_email_verified ?? detail.is_verified ?? false,
    } as unknown) as Teacher
  } catch {
    selectedTeacher.value = teacher
  }

  isStaffDetailModalOpen.value = true
}

const openEditModal = async (student: Student) => {
  const detail = await studentStore.getStudentDetail(student.id_siswa)
  selectedStudent.value = detail || student
  isEditModalOpen.value = true
}

const isEditTeacherModalOpen = ref(false)
const editTeacherId = ref<number | null>(null)

const openEditTeacherView = (teacher: Teacher) => {
  editTeacherId.value = teacher.id
  isEditTeacherModalOpen.value = true
}

const isDeleteTeacherModalOpen = ref(false)
const selectedTeacherIdForDelete = ref<number | null>(null)
const selectedTeacherNameForDelete = ref('')
const deleteTeacherLoading = ref(false)

const openDeleteTeacher = (teacher: Teacher) => {
  selectedTeacherIdForDelete.value = teacher.id
  selectedTeacherNameForDelete.value = teacher.nama
  isDeleteTeacherModalOpen.value = true
}

const confirmDeleteTeacher = async () => {
  if (!selectedTeacherIdForDelete.value) return
  deleteTeacherLoading.value = true
  try {
    await teacherStore.deleteTeacher(selectedTeacherIdForDelete.value)
    toast.success('Data staf berhasil dihapus.')
    isDeleteTeacherModalOpen.value = false
    await loadSummary()
    if (selectedDataType.value === 'Staf') await loadStaff()
  } catch {
    toast.error('Gagal menghapus data staf.')
  } finally {
    deleteTeacherLoading.value = false
  }
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

const handleStaffCreated = async () => {
  toast.custom(VToast, {
    componentProps: {
      message: 'Data staf berhasil ditambahkan.',
    },
  })
  await loadSummary()
  if (selectedDataType.value === 'Staf') {
    await loadStaff()
  }
}

const downloadTemplate = async () => {
  try {
    if (selectedDataType.value === 'Staf') {
      await adminStore.downloadStaffTemplate()
    } else {
      await studentStore.downloadStudentTemplate()
    }
    toast.success('Template berhasil diunduh.')
  } catch (err) {
    console.error('Download template error:', err)
    toast.error('Gagal mengunduh template.')
  }
}

const handleExportStaff = async () => {
  try {
    await adminStore.exportStaff()
    toast.success('Data staf berhasil diekspor.')
  } catch {
    toast.error('Gagal mengekspor data staf.')
  }
}

const staffImportRef = ref<HTMLInputElement | null>(null)

const openStaffImport = () => {
  staffImportRef.value?.click()
}

const handleStaffImportFile = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const result = await adminStore.importStaff(file)
    toast.success(result?.message || 'Data staf berhasil diimpor.')
    await loadSummary()
    await loadStaff()
  } catch (err: unknown) {
    let msg = 'Gagal mengimpor data staf.'
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const maybe = err?.response?.data || err?.data
    if (maybe) {
      msg = maybe.message || maybe.error || msg
    }
    toast.error(msg)
  } finally {
    if (staffImportRef.value) staffImportRef.value.value = ''
  }
}

const resetFilter = async () => {
  search.value = ''
  nomorInduk.value = ''
  namaFilter.value = ''
  emailFilter.value = ''
  currentPage.value = 1
  await loadCurrentDataType()
}

const totalSiswa = computed(() => studentStore.summary.total_siswa)
// Use the live teacher pagination count when we have it, otherwise fall back to the summary
const totalStaf = computed(() =>
  teacherStore.pagination.totalData > 0
    ? teacherStore.pagination.totalData
    : studentStore.summary.total_staff
)
const totalData = totalSiswa.value + totalStaf.value
const tableColumns = computed(() => {
  if (selectedDataType.value === 'Staf') {
    return [
      { key: 'nomor', label: 'Nomor', align: 'center' as const },
      { key: 'nama', label: 'Nama', align: 'center' as const },
      { key: 'niy', label: 'NIY', align: 'center' as const },
      { key: 'email', label: 'Email', align: 'center' as const },
      { key: 'role', label: 'Role', align: 'center' as const },
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

const filteredStudents = computed(() => {
  const q = (search.value || '').toLowerCase().trim()
  return studentStore.students.filter((s: Student) => {
    if (q) {
      const matchQ = [s.nama, s.email, s.nis, s.nisn]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(q))
      if (!matchQ) return false
    }

    if (namaFilter.value && !s.nama.toLowerCase().includes(namaFilter.value.toLowerCase())) return false

    if (nomorInduk.value) {
      const n = nomorInduk.value.trim().toLowerCase()
      if (!(s.nis?.toLowerCase().includes(n) || s.nisn?.toLowerCase().includes(n))) return false
    }

    if (emailFilter.value && !s.email?.toLowerCase().includes(emailFilter.value.toLowerCase())) return false

    return true
  })
})

const filteredTeachers = computed(() => {
  const q = (search.value || '').toLowerCase().trim()
  return teacherStore.teachers.filter((t: Teacher) => {
    if (q) {
      const matchQ = [t.nama, t.email, t.niy]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(q))
      if (!matchQ) return false
    }

    if (namaFilter.value && !t.nama.toLowerCase().includes(namaFilter.value.toLowerCase())) return false

    if (nomorInduk.value) {
      const n = nomorInduk.value.trim().toLowerCase()
      if (!t.niy?.toLowerCase().includes(n)) return false
    }

    if (emailFilter.value && !t.email?.toLowerCase().includes(emailFilter.value.toLowerCase())) return false

    return true
  })
})

const tableRows = computed(() => {
  if (selectedDataType.value === 'Staf') {
    return filteredTeachers.value.map((teacher: Teacher, index: number) => ({
      ...teacher,
      nomor:
        ((teacherStore.pagination.currentPage || 1) - 1) *
          (teacherStore.pagination.limit || 10) +
        index +
        1,
      role: teacher.role ?? teacher.jabatan,
    }))
  }

  return filteredStudents.value.map((student, index) => ({
    ...student,
    nomor:
      (studentStore.pagination.halaman_sekarang - 1) *
        studentStore.pagination.limit +
      index +
      1,
  }))
})

// ── Watchers ─────────────────────────────────────────────────────────────────

watch([search, namaFilter, nomorInduk, emailFilter], async () => {
  currentPage.value = 1
  await loadCurrentDataType()
})

watch(currentPage, async () => {
  await loadCurrentDataType()
})

watch(selectedDataType, async () => {
  currentPage.value = 1
  await loadCurrentDataType()
})

onMounted(async () => {
  await Promise.all([loadStudents(), loadSummary(), loadStaff()])
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

        <!-- ── Page header ──────────────────────────────────────────────── -->
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
              Lihat dan kelola data Siswa dan Staf
            </p>
          </div>

          <div
            class="
              flex shrink-0 items-center justify-end gap-3
              max-[900px]:w-full max-[900px]:justify-start
              max-[640px]:flex-col max-[640px]:items-stretch
            "
          >
            <VButton variant="primary" @click="openCreateModal">
              <template #leftIcon>
                <Plus :size="18" />
              </template>
              Tambah Data Siswa
            </VButton>

            <VButton variant="secondary" @click="openStaffModal">
              <template #leftIcon>
                <Plus :size="18" />
              </template>
              Tambah Data Staf
            </VButton>
          </div>
        </section>

        <!-- ── Summary stat cards ─────────────────────────────────────── -->
        <section class="grid grid-cols-3 gap-4 max-[768px]:grid-cols-1">
          <StatCard title="Total Data" :value="totalData" :icon-src="databaseIcon" icon-alt="Database Icon" />
          <StatCard title="Siswa" :value="totalSiswa" :icon-src="studentIcon" icon-alt="Student Icon" />
          <StatCard title="Staf" :value="totalStaf" :icon-src="staffIcon" icon-alt="Staff Icon" />
        </section>

        <!-- ── Filter card ─────────────────────────────────────────────── -->
        <VCard padding-class="p-4" overflow-class="overflow-visible" class="w-full">
          <div class="flex w-full flex-col gap-4">

            <!-- Filter header row -->
            <div
              class="
                flex items-center justify-between gap-4
                max-[640px]:flex-col max-[640px]:items-start
              "
            >
              <div class="flex items-center gap-2">
                <Filter class="h-5 w-5 text-[var(--app-heading)]" />
                <b
                  class="
                    text-[length:var(--app-card-title-font)]
                    font-bold leading-[1.2] text-[var(--app-heading)]
                  "
                >
                  Filter Data
                </b>
              </div>

              <VButton variant="tertiary" size="sm" @click="resetFilter">
                <template #leftIcon>
                  <RotateCcw :size="16" />
                </template>
                Reset
              </VButton>
            </div>

            <!-- Filter inputs grid (adaptive: 2-col → 1-col on small screens) -->
            <div
              class="
                grid grid-cols-2 gap-x-5 gap-y-3
                max-[900px]:grid-cols-1
              "
            >
              <!-- Nama -->
              <div
                class="
                  grid items-center gap-3
                  grid-cols-[80px_1fr]
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

              <!-- Nomor Induk — label adapts to current data type -->
              <div
                class="
                  grid items-center gap-3
                  grid-cols-[110px_1fr]
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
                  :placeholder="selectedDataType === 'Staf' ? 'Masukkan NIY' : 'Masukkan NIS / NISN'"
                />
              </div>

              <!-- Email -->
              <div
                class="
                  grid items-center gap-3
                  grid-cols-[80px_1fr]
                  max-[900px]:grid-cols-[92px_1fr]
                "
              >
                <label
                  class="
                    text-[length:var(--app-input-label-font)]
                    font-semibold leading-[1.2] text-[var(--app-heading)]
                  "
                >
                  Email
                </label>
                <VInputField
                  v-model="emailFilter"
                  placeholder="Masukkan email"
                />
              </div>

              <!-- Tipe Data -->
              <div
                class="
                  grid items-center gap-3
                  grid-cols-[110px_1fr]
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

        <!-- ── Error states ─────────────────────────────────────────────── -->
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
          v-if="teacherStore.error && !teacherStore.loading && selectedDataType === 'Staf'"
          class="
            rounded-[14px] border border-[var(--app-danger-border)]
            bg-[var(--app-danger-bg)] px-[26px] py-[22px]
            text-[length:var(--app-font-sm)] font-semibold
            text-[var(--app-danger)]
          "
        >
          {{ teacherStore.error }}
        </div>

        <!-- ── Data table ───────────────────────────────────────────────── -->
        <div class="flex flex-col gap-4">
          <VTable
            :columns="tableColumns"
            :rows="tableRows"
            :is-loading="selectedDataType === 'Staf' ? teacherStore.loading : studentStore.loading"
          >
            <template #cell-nomor="{ value }">
              <span class="text-inherit">{{ value }}</span>
            </template>

            <template #cell-nama="{ value }">
              <span class="font-medium text-inherit">{{ value }}</span>
            </template>

            <!-- Student-only columns -->
            <template #cell-nisn="{ value }">
              <span class="text-inherit">{{ value }}</span>
            </template>

            <template #cell-nis="{ value }">
              <span class="text-inherit">{{ value }}</span>
            </template>

            <template #cell-kelas="{ value }">
              <span class="text-inherit">{{ value ?? '-' }}</span>
            </template>

            <!-- Staff-only columns -->
            <template #cell-niy="{ value }">
              <span class="text-inherit">{{ value ?? '-' }}</span>
            </template>

            <template #cell-role="{ value }">
              <span class="text-inherit">{{ value ?? '-' }}</span>
            </template>

            <!-- Shared columns -->
            <template #cell-email="{ value }">
              <span class="break-all text-inherit">{{ value }}</span>
            </template>

            <!-- Action column — routes by selectedDataType -->
            <template #cell-aksi="{ row }">
              <div class="flex items-center justify-center gap-2">
                <VButton
                  variant="tertiary"
                  size="sm"
                  @click="selectedDataType === 'Staf' ? openStaffDetail(row) : openDetailModal(row)"
                >
                  <template #leftIcon>
                    <Eye :size="14" />
                  </template>
                  Detail
                </VButton>

                <VButton
                  variant="secondary"
                  size="sm"
                  @click="selectedDataType === 'Staf' ? openEditTeacherView(row) : openEditModal(row)"
                >
                  <template #leftIcon>
                    <Pencil :size="14" />
                  </template>
                  Edit
                </VButton>

                <VButton
                  variant="primary"
                  size="sm"
                  @click="selectedDataType === 'Staf' ? openDeleteTeacher(row) : openDeleteModal(row.id_siswa, row.nama)"
                >
                  <template #leftIcon>
                    <Trash2 :size="14" />
                  </template>
                  Hapus
                </VButton>
              </div>
            </template>
          </VTable>

          <!-- ── Pagination ─────────────────────────────────────────────── -->
          <div class="flex items-center justify-end">
            <VPagination
              v-model:currentPage="currentPage"
              :totalPages="
                selectedDataType === 'Staf'
                  ? teacherStore.pagination.totalPages
                  : studentStore.pagination.total_halaman
              "
              @page-change="loadCurrentDataType"
            />
          </div>

          <!-- ── Bottom actions (admin only) ─────────────────────────── -->
          <div
            v-if="isAdmin && selectedDataType === 'Siswa'"
            class="flex items-center justify-end gap-3 max-[640px]:flex-col max-[640px]:items-stretch"
          >
            <VButton variant="tertiary" @click="downloadTemplate">
              <template #leftIcon>
                <Download :size="18" />
              </template>
              Download Template
            </VButton>

            <!-- Siswa: Import modal | Staf: hidden file input -->
            <VButton
              v-if="selectedDataType === 'Siswa'"
              variant="secondary"
              @click="isImportModalOpen = true"
            >
              <template #leftIcon>
                <Upload :size="18" />
              </template>
              Import
            </VButton>

            <VButton
              v-else
              variant="secondary"
              @click="openStaffImport"
            >
              <template #leftIcon>
                <Upload :size="18" />
              </template>
              Import Staf
            </VButton>

            <!-- Siswa: Export modal | Staf: direct download -->
            <VButton
              v-if="selectedDataType === 'Siswa'"
              variant="primary"
              @click="isExportModalOpen = true"
            >
              <template #leftIcon>
                <Download :size="18" />
              </template>
              Export
            </VButton>

            <VButton
              v-else
              variant="primary"
              @click="handleExportStaff"
            >
              <template #leftIcon>
                <Download :size="18" />
              </template>
              Export Staf
            </VButton>
          </div>
        </div>
      </div>
    </main>

    <!-- ── Modals ─────────────────────────────────────────────────────────── -->

    <CreateStudentModal
      :isOpen="isCreateModalOpen"
      @update:isOpen="isCreateModalOpen = $event"
      @created="handleStudentCreated"
    />

    <CreateTeacherModal
      :isOpen="isCreateStaffModalOpen"
      @update:isOpen="isCreateStaffModalOpen = $event"
      @created="handleStaffCreated"
    />

    <StudentDetailModal
      :isOpen="isDetailModalOpen"
      :student="selectedStudent"
      @update:isOpen="isDetailModalOpen = $event"
    />

    <StaffDetailModal
      :isOpen="isStaffDetailModalOpen"
      :teacher="selectedTeacher"
      @update:isOpen="isStaffDetailModalOpen = $event"
    />

    <EditStudentModal
      :isOpen="isEditModalOpen"
      :student="selectedStudent"
      @update:isOpen="isEditModalOpen = $event"
      @updated="handleStudentUpdated"
    />

    <EditTeacherModal
      :isOpen="isEditTeacherModalOpen"
      :teacherId="editTeacherId"
      @update:isOpen="isEditTeacherModalOpen = $event"
      @updated="async () => { await loadStaff(); toast.success('Data staf berhasil diperbarui.') }"
    />

    <DeleteConfirmationModal
      :isOpen="isDeleteModalOpen"
      :studentId="selectedStudentId"
      :studentName="selectedStudentName"
      @update:isOpen="isDeleteModalOpen = $event"
      @confirmed="handleStudentDeleted"
    />

    <DeleteConfirmationModal
      :isOpen="isDeleteTeacherModalOpen"
      :title="'Hapus Data Staf'"
      :studentName="selectedTeacherNameForDelete"
      :loading="deleteTeacherLoading"
      @update:isOpen="isDeleteTeacherModalOpen = $event"
      @confirmed="confirmDeleteTeacher"
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

    <!-- Hidden file input for staff import (no modal needed — direct upload) -->
    <input
      ref="staffImportRef"
      type="file"
      accept=".xlsx"
      class="hidden"
      @change="handleStaffImportFile"
    />
  </DashboardLayout>
</template>
