<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main class="teacher-page">
      <header class="teacher-header">
        <div class="teacher-heading-group">
          <h1 class="teacher-title">
            Kelola Guru
          </h1>

          <p class="teacher-subtitle">
            Daftar guru yang terdaftar dalam sistem.
          </p>
        </div>

        <VButton
          v-if="!isKepsek"
          variant="primary"
          @click="openCreateModal"
        >
          <template #leftIcon>
            <Plus :size="16" />
          </template>

          Tambah Guru
        </VButton>
      </header>

      <VAlert
        v-if="alert.visible"
        :visible="alert.visible"
        :type="alert.type"
        :title="alert.title"
        :message="alert.message"
        @close="alert.visible = false"
      />

      <VCard
        class="teacher-filter-card"
        paddingClass="p-5"
        overflowClass="overflow-visible"
      >
        <div class="teacher-filter-grid">
          <VInputField
            v-model="searchQuery"
            state="search"
            placeholder="Cari nama atau NIY..."
            @update:modelValue="debouncedSearch"
          />

          <VDropdown
            v-model="selectedJabatan"
            :options="jabatanOptions"
            placeholder="Semua Jabatan"
            @change="handleFilter"
          />
        </div>
      </VCard>

      <VCard
        class="teacher-list-card"
        paddingClass="p-5"
        overflowClass="overflow-visible"
      >
        <VTable
          :columns="teacherColumns"
          :rows="teacherRows"
          :is-loading="store.isLoading"
          loading-message="Memuat data guru..."
          empty-message="Data guru tidak ditemukan."
        >
          <template #cell-no="{ row }">
            <span class="teacher-table-text">
              {{ row.no }}
            </span>
          </template>

          <template #cell-nama="{ row }">
            <span class="teacher-table-name">
              {{ row.nama }}
            </span>
          </template>

          <template #cell-niy="{ row }">
            <span class="teacher-table-text">
              {{ row.niy || '-' }}
            </span>
          </template>

          <template #cell-jabatan="{ row }">
            <span class="teacher-table-text">
              {{ row.jabatan || '-' }}
            </span>
          </template>

          <template #cell-actions="{ row }">
            <div class="teacher-action-group">
              <VActionButton
                variant="secondary"
                @click="openEditModal(row.id)"
              >
                <Pencil :size="14" />
                <span>Edit</span>
              </VActionButton>

              <VActionButton
                variant="primary"
                @click="openDeleteModal(row)"
              >
                <Trash2 :size="14" />
                <span>Hapus</span>
              </VActionButton>
            </div>
          </template>
        </VTable>

        <div class="teacher-pagination-wrapper">
          <span class="teacher-pagination-text">
            Halaman {{ currentPage }} dari {{ store.pagination.totalPages }}
            ({{ store.pagination.totalData }} data)
          </span>

          <VPagination
            v-model:currentPage="currentPage"
            :totalPages="store.pagination.totalPages"
            @page-change="loadTeachers"
          />
        </div>
      </VCard>

      <CreateTeacherModal
        :isOpen="isCreateModalOpen"
        @update:isOpen="isCreateModalOpen = $event"
        @created="handleTeacherCreated"
      />

      <EditTeacherModal
        :isOpen="isEditModalOpen"
        :teacherId="selectedTeacherId"
        @update:isOpen="isEditModalOpen = $event"
        @updated="handleTeacherUpdated"
      />

      <ConfirmationModal
        :isOpen="deleteModal.show"
        title="Hapus Akun Guru"
        :description="`Apakah Anda yakin ingin menghapus data akun ${deleteModal.teacherName}?`"
        confirmText="Hapus"
        :loading="deleteModal.loading"
        :errorMessage="deleteModal.error"
        @update:isOpen="deleteModal.show = $event"
        @confirm="handleDelete"
      />
    </main>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useTeacherStore, type Teacher } from '@/stores/teacher'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import CreateTeacherModal from '@/components/admin/teachers/CreateTeacherModal.vue'
import EditTeacherModal from '@/components/admin/teachers/EditTeacherModal.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import VButton from '@/components/common/VButton.vue'
import VActionButton from '@/components/common/VActionButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VAlert from '@/components/common/VAlert.vue'
import VPagination from '@/components/common/VPagination.vue'
import VCard from '@/components/common/VCard.vue'
import VTable from '@/components/common/VTable.vue'

const store = useTeacherStore()
const route = useRoute()
const authStore = useAuthStore()

const isKepsek = String(authStore.role || '').toUpperCase() === 'KEPSEK'

const searchQuery = ref('')
const selectedJabatan = ref('')
const currentPage = ref(1)
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedTeacherId = ref<number | null>(null)

const jabatanOptions = [
  { label: 'Semua Jabatan', value: '' },
  { label: 'Kepala Sekolah', value: 'Kepala Sekolah' },
  { label: 'Wakil Bidang Akademik', value: 'Wakil Bidang Akademik' },
  { label: 'Wakil Bidang Kesiswaan', value: 'Wakil Bidang Kesiswaan' },
  { label: 'Wakil Bidang Agama', value: 'Wakil Bidang Agama' },
  { label: 'Guru', value: 'Guru' },
]

const teacherColumns = [
  { key: 'no', label: 'No', nowrap: true },
  { key: 'nama', label: 'Nama' },
  { key: 'niy', label: 'NIY' },
  { key: 'jabatan', label: 'Jabatan' },
  { key: 'actions', label: 'Aksi', align: 'center' as const, nowrap: true },
]

const teacherRows = computed(() => {
  return (store.teachers || []).map((teacher, index) => ({
    ...teacher,
    no:
      ((store.pagination?.currentPage || 1) - 1) *
        (store.pagination?.limit || 10) +
      index +
      1,
  }))
})

const alert = reactive({
  visible: false,
  type: 'success' as 'success' | 'error',
  title: '',
  message: '',
})

const deleteModal = reactive({
  show: false,
  teacherId: null as number | null,
  teacherName: '',
  loading: false,
  error: '',
})

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message

    if (typeof message === 'string' && message.length > 0) {
      return message
    }
  }

  return fallback
}

const loadTeachers = async (): Promise<void> => {
  await store.fetchTeachers(
    currentPage.value,
    searchQuery.value,
    selectedJabatan.value,
  )
}

onMounted((): void => {
  if (route.query.success) {
    alert.visible = true
    alert.type = 'success'
    alert.title = 'Berhasil'
    alert.message = route.query.success as string
  }

  loadTeachers()
})

let timeout: ReturnType<typeof setTimeout> | null = null

const debouncedSearch = (): void => {
  if (timeout) clearTimeout(timeout)

  timeout = setTimeout(() => {
    currentPage.value = 1
    loadTeachers()
  }, 400)
}

const handleFilter = (): Promise<void> => {
  currentPage.value = 1
  return loadTeachers()
}

watch(currentPage, async (page) => {
  if (page !== store.pagination.currentPage) {
    await loadTeachers()
  }
})

const openDeleteModal = (teacher: Teacher): void => {
  deleteModal.teacherId = teacher.id
  deleteModal.teacherName = teacher.nama
  deleteModal.error = ''
  deleteModal.show = true
}

const openCreateModal = (): void => {
  isCreateModalOpen.value = true
}

const openEditModal = (teacherId: number): void => {
  selectedTeacherId.value = teacherId
  isEditModalOpen.value = true
}

const handleTeacherCreated = async (message: string): Promise<void> => {
  alert.visible = true
  alert.type = 'success'
  alert.title = 'Berhasil'
  alert.message = message
  currentPage.value = 1

  await loadTeachers()
}

const handleTeacherUpdated = async (message: string): Promise<void> => {
  alert.visible = true
  alert.type = 'success'
  alert.title = 'Berhasil'
  alert.message = message

  await loadTeachers()
}

const handleDelete = async (): Promise<void> => {
  if (!deleteModal.teacherId) return

  deleteModal.loading = true
  deleteModal.error = ''

  try {
    await store.deleteTeacher(deleteModal.teacherId)

    alert.visible = true
    alert.type = 'success'
    alert.title = 'Berhasil'
    alert.message = 'Akun guru berhasil dihapus dari sistem.'

    deleteModal.show = false

    if (store.teachers.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1
    }

    await loadTeachers()
  } catch (e: unknown) {
    const message = getErrorMessage(e, 'Gagal menghapus data guru.')

    deleteModal.error = message
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Gagal'
    alert.message = message
  } finally {
    deleteModal.loading = false
  }
}
</script>

<style scoped>
.teacher-page {
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

.teacher-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.teacher-heading-group {
  min-width: 0;
}

.teacher-title {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-page-title-font);
  font-weight: 800;
  line-height: 1.2;
}

.teacher-subtitle {
  margin: 4px 0 0;
  color: var(--app-subtext);
  font-size: var(--app-page-subtitle-font);
  line-height: 1.4;
}

.teacher-filter-card {
  position: relative;
  z-index: 20;
  border-color: var(--app-card-border);
  background: var(--app-card);
  color: var(--app-text);
  box-shadow: var(--app-card-shadow);
}

.teacher-filter-grid {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
  gap: 16px;
  align-items: center;
}

.teacher-list-card {
  border-color: var(--app-card-border);
  background: var(--app-card);
  color: var(--app-text);
  box-shadow: var(--app-card-shadow);
}

.teacher-list-card :deep(.v-table-wrapper) {
  background: transparent;
  box-shadow: none;
}

.teacher-table-name {
  color: var(--app-heading);
  font-size: var(--app-table-cell-font);
  font-weight: 700;
  line-height: 1.35;
}

.teacher-table-text {
  color: var(--app-subtext);
  font-size: var(--app-table-cell-font);
  line-height: 1.35;
}

.teacher-action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.teacher-pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--app-card-border);
}

.teacher-pagination-text {
  color: var(--app-subtext);
  font-size: var(--app-font-xs);
  line-height: 1.4;
}

@media (max-width: 900px) {
  .teacher-page {
    padding: 24px;
  }

  .teacher-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .teacher-filter-grid {
    grid-template-columns: 1fr;
  }

  .teacher-pagination-wrapper {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .teacher-page {
    gap: 18px;
    padding: 18px;
  }

  .teacher-action-group {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>