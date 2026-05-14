<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <div class="p-8 flex flex-col gap-6 h-full">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-[var(--app-heading)]">Kelola Guru</h1>
          <p class="text-[var(--app-muted)] text-sm mt-1">
            Daftar guru yang terdaftar dalam sistem.
          </p>
        </div>
        <VButton v-if="!isKepsek" variant="primary" @click="openCreateModal">
          <template #leftIcon><Plus :size="18" /></template>
          Tambah Guru
        </VButton>
      </div>

      <VAlert v-if="alert.visible" v-bind="alert" @close="alert.visible = false" />

      <div class="flex gap-4 w-full max-w-[700px]">
        <div class="flex-1">
          <VInputField
            v-model="searchQuery"
            state="search"
            placeholder="Cari nama atau NIY..."
            @update:modelValue="debouncedSearch"
          />
        </div>
        <div class="w-[240px]">
          <VDropdown
            v-model="selectedJabatan"
            :options="jabatanOptions"
            placeholder="Semua Jabatan"
            @change="handleFilter"
          />
        </div>
      </div>

      <div
        class="bg-[var(--app-card)] rounded-2xl border border-[var(--app-card-border)] overflow-hidden flex-1 flex flex-col shadow-sm"
      >
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-[var(--app-card-border)] bg-[var(--app-table-head-bg)]">
                <th
                  class="px-6 py-4 text-[13px] font-semibold text-[var(--app-subtext)] uppercase w-16"
                >
                  No
                </th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[var(--app-subtext)] uppercase">
                  Nama
                </th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[var(--app-subtext)] uppercase">
                  NIY
                </th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[var(--app-subtext)] uppercase">
                  Jabatan
                </th>
                <th
                  class="px-6 py-4 text-[13px] font-semibold text-[var(--app-subtext)] uppercase text-center"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.isLoading">
                <td colspan="5" class="px-6 py-12 text-center text-[var(--app-muted)]">
                  Memuat data guru...
                </td>
              </tr>

              <tr v-else-if="!store.teachers || store.teachers.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-[var(--app-muted)]">
                  Data guru tidak ditemukan.
                </td>
              </tr>

              <tr
                v-else
                v-for="(teacher, index) in store.teachers"
                :key="teacher.id"
                class="border-b border-[var(--app-card-border)] hover:bg-[var(--app-bg)]"
              >
                <td class="px-6 py-4 text-[14px] text-[var(--app-text-soft)]">
                  {{
                    ((store.pagination?.currentPage || 1) - 1) * (store.pagination?.limit || 10) +
                    index +
                    1
                  }}
                </td>
                <td class="px-6 py-4 text-[14px] font-medium text-[var(--app-text)]">
                  {{ teacher.nama }}
                </td>
                <td class="px-6 py-4 text-[14px] text-[var(--app-text-soft)]">
                  {{ teacher.niy }}
                </td>
                <td class="px-6 py-4 text-[14px] text-[var(--app-text-soft)]">
                  {{ teacher.jabatan }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-2">
                    <VButton
                      variant="secondary"
                      class="!h-[26px] !min-w-[58px] !px-[10px] !py-0 !rounded-[8px] !text-[12px] !font-medium"
                      @click="openEditModal(teacher.id)"
                    >
                      <template #leftIcon>
                        <Pencil :size="12" />
                      </template>
                      Edit
                    </VButton>
                    <VButton
                      variant="primary"
                      class="!h-[26px] !min-w-[64px] !px-[10px] !py-0 !rounded-[8px] !text-[12px] !font-medium"
                      @click="openDeleteModal(teacher)"
                    >
                      <template #leftIcon>
                        <Trash2 :size="12" />
                      </template>
                      Hapus
                    </VButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="flex items-center justify-between px-6 py-4 border-t border-[var(--app-card-border)]"
        >
          <span class="text-[13px] text-[var(--app-muted)]">
            Halaman {{ currentPage }} dari {{ store.pagination.totalPages }} ({{
              store.pagination.totalData
            }}
            data)
          </span>

          <VPagination
            v-model:currentPage="currentPage"
            :totalPages="store.pagination.totalPages"
            @page-change="loadTeachers"
          />
        </div>
      </div>

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
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
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
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VAlert from '@/components/common/VAlert.vue'
import VPagination from '@/components/common/VPagination.vue'

const store = useTeacherStore()
const route = useRoute()
const authStore = useAuthStore()
const isKepsek = String(authStore.role || '').toUpperCase() === 'KEPSEK'

const searchQuery = ref('')
const selectedJabatan = ref('')
const jabatanOptions = [
  { label: 'Semua Jabatan', value: '' },
  { label: 'Kepala Sekolah', value: 'Kepala Sekolah' },
  { label: 'Wakil Bidang Akademik', value: 'Wakil Bidang Akademik' },
  { label: 'Wakil Bidang Kesiswaan', value: 'Wakil Bidang Kesiswaan' },
  { label: 'Wakil Bidang Agama', value: 'Wakil Bidang Agama' },
  { label: 'Guru', value: 'Guru' },
]
const currentPage = ref(1)
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedTeacherId = ref<number | null>(null)
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
  await store.fetchTeachers(currentPage.value, searchQuery.value, selectedJabatan.value)
}

onMounted((): void => {
  if (route.query.success) {
    alert.visible = true
    alert.type = 'success'
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
  alert.message = message
  currentPage.value = 1
  await loadTeachers()
}

const handleTeacherUpdated = async (message: string): Promise<void> => {
  alert.visible = true
  alert.type = 'success'
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
    alert.message = message
  } finally {
    deleteModal.loading = false
  }
}
</script>