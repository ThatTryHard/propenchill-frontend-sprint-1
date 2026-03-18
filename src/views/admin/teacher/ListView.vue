<template>
  <DashboardLayout>
    <template #sidebar>
      <AdminSidebar
        :userName="authStore.user?.nama || 'Admin SIMP'"
        :userEmail="authStore.user?.email || 'admin@sekolah.com'"
      />
    </template>

    <div class="p-8 flex flex-col gap-6 h-full">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-[#1a202c]">Kelola Guru</h1>
          <p class="text-[#718096] text-sm mt-1">Daftar guru yang terdaftar dalam sistem.</p>
        </div>
        <VButton variant="primary" @click="openCreateModal">
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
        <select
          v-model="selectedJabatan"
          @change="handleFilter"
          class="border border-[#e2e8f0] rounded-lg pl-3 pr-10 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-[#3f9760]"
        >
          <option value="">Semua Jabatan</option>
          <option value="Kepala Sekolah">Kepala Sekolah</option>
          <option value="Guru Bidang Kurikulum">Guru Bidang Kurikulum</option>
          <option value="Guru Bidang Kesiswaan">Guru Bidang Kesiswaan</option>
          <option value="Guru Bidang Agama">Guru Bidang Agama</option>
          <option value="Guru">Guru</option>
        </select>
      </div>

      <div
        class="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden flex-1 flex flex-col shadow-sm"
      >
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase w-16">
                  No
                </th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase">Nama</th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase">NIY</th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase">
                  Jabatan
                </th>
                <th
                  class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase text-center"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.isLoading">
                <td colspan="5" class="px-6 py-12 text-center text-[#718096]">
                  Memuat data guru...
                </td>
              </tr>

              <tr v-else-if="!store.teachers || store.teachers.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-[#718096]">
                  Data guru tidak ditemukan.
                </td>
              </tr>

              <tr
                v-else
                v-for="(teacher, index) in store.teachers"
                :key="teacher.id"
                class="border-b border-[#f1f5f9] hover:bg-[#f8fafc]"
              >
                <td class="px-6 py-4 text-[14px] text-[#4a5568]">
                  {{
                    ((store.pagination?.currentPage || 1) - 1) * (store.pagination?.limit || 10) +
                    index +
                    1
                  }}
                </td>
                <td class="px-6 py-4 text-[14px] font-medium text-[#1a202c]">{{ teacher.nama }}</td>
                <td class="px-6 py-4 text-[14px] text-[#4a5568]">{{ teacher.niy }}</td>
                <td class="px-6 py-4 text-[14px] text-[#4a5568]">{{ teacher.jabatan }}</td>
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

        <div class="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0]">
          <span class="text-[13px] text-[#718096]">
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
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useTeacherStore } from '@/stores/teacher'
import { useAuthStore } from '@/stores/users/auth'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import CreateTeacherModal from '@/components/admin/teachers/CreateTeacherModal.vue'
import EditTeacherModal from '@/components/admin/teachers/EditTeacherModal.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VAlert from '@/components/common/VAlert.vue'
import VPagination from '@/components/common/VPagination.vue'

const store = useTeacherStore()
const authStore = useAuthStore()
const route = useRoute()

const searchQuery = ref('')
const selectedJabatan = ref('')
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

const openDeleteModal = (teacher: any): void => {
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
  } catch (e: any) {
    deleteModal.error = e.message || 'Gagal menghapus data guru.'
    alert.visible = true
    alert.type = 'error'
    alert.message = e.message || 'Gagal menghapus data guru.'
  } finally {
    deleteModal.loading = false
  }
}
</script>
