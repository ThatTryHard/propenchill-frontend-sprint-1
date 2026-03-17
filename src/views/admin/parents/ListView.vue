<template>
  <DashboardLayout>
    <template #sidebar>
      <AdminSidebar />
    </template>
    <div class="p-8 flex flex-col gap-6 h-full">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-[#1a202c]">Kelola Wali Murid</h1>
          <p class="text-[#718096] text-sm mt-1">Daftar akun wali murid yang terdaftar</p>
        </div>
        <VButton variant="primary" @click="openCreateModal">
          <template #leftIcon><Plus :size="18" /></template>
          Tambah Wali Murid
        </VButton>
      </div>

      <!-- Alert -->
      <VAlert
        v-if="alert.visible"
        :visible="alert.visible"
        :type="alert.type"
        :title="alert.title"
        :message="alert.message"
        @close="alert.visible = false"
      />

      <!-- Search -->
      <div class="w-full max-w-[400px]">
        <VInputField
          v-model="searchQuery"
          state="search"
          placeholder="Cari nama wali murid..."
          @update:modelValue="debouncedSearch"
        />
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden flex-1">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider">No</th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider">Nama</th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider">Email</th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider">No. HP</th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider">Tanggal Lahir</th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="store.isLoading">
                <td colspan="6" class="px-6 py-12 text-center text-[#718096]">Memuat data...</td>
              </tr>
              <tr v-else-if="store.parents.length === 0">
                <td colspan="6" class="px-6 py-12 text-center text-[#718096]">Tidak ada data wali murid</td>
              </tr>
              <tr
                v-else
                v-for="(parent, index) in store.parents"
                :key="parent.id"
                class="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
              >
                <td class="px-6 py-4 text-[14px] text-[#4a5568]">
                  {{ (store.pagination.currentPage - 1) * store.pagination.limit + index + 1 }}
                </td>
                <td class="px-6 py-4 text-[14px] font-medium text-[#1a202c]">{{ parent.nama }}</td>
                <td class="px-6 py-4 text-[14px] text-[#4a5568]">{{ parent.email }}</td>
                <td class="px-6 py-4 text-[14px] text-[#4a5568]">{{ parent.no_hp }}</td>
                <td class="px-6 py-4 text-[14px] text-[#4a5568]">{{ parent.tanggal_lahir || '-' }}</td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-2">
                    <VButton
                      variant="secondary"
                      class="!h-[26px] !min-w-[58px] !px-[10px] !py-0 !rounded-[8px] !text-[12px] !font-medium"
                      @click="openEditModal(parent.id)"
                    >
                      <template #leftIcon>
                        <Pencil :size="12" />
                      </template>
                      Edit
                    </VButton>

                    <VButton
                      variant="primary"
                      class="!h-[26px] !min-w-[64px] !px-[10px] !py-0 !rounded-[8px] !text-[12px] !font-medium"
                      @click="openDeleteModal(parent)"
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

        <!-- Pagination -->
        <div
          v-if="store.pagination.totalPages > 1"
          class="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0]"
        >
          <span class="text-[13px] text-[#718096]">
            Halaman {{ store.pagination.currentPage }} dari {{ store.pagination.totalPages }}
            ({{ store.pagination.totalData }} data)
          </span>
          
          <VPagination 
            :current-page="store.pagination.currentPage"
            :total-pages="store.pagination.totalPages"
            @page-change="changePage"
          />
        </div>
      </div>

      <ConfirmationModal
        :isOpen="deleteModal.show"
        title="Hapus Wali Murid"
        :description="`Apakah Anda yakin ingin menghapus akun ${deleteModal.parentName}? Tindakan ini tidak dapat dibatalkan.`"
        confirmText="Hapus"
        :loading="deleteModal.loading"
        :errorMessage="deleteModal.error"
        @update:isOpen="deleteModal.show = $event"
        @confirm="handleDelete"
      />

      <CreateParentModal
        :isOpen="isCreateModalOpen"
        @update:isOpen="isCreateModalOpen = $event"
        @created="handleParentCreated"
      />

      <EditParentModal
        :isOpen="isEditModalOpen"
        :parentId="selectedParentId"
        @update:isOpen="isEditModalOpen = $event"
        @updated="handleParentUpdated"
      />
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useParentStore, type Parent } from '@/stores/parents'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import CreateParentModal from '@/components/admin/parents/CreateParentModal.vue'
import EditParentModal from '@/components/admin/parents/EditParentModal.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VAlert from '@/components/common/VAlert.vue'

const store = useParentStore()
const route = useRoute()

const searchQuery = ref('')
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedParentId = ref<number | null>(null)

const alert = reactive({
  visible: false,
  type: 'success' as string,
  title: '',
  message: '',
})

const deleteModal = reactive({
  show: false,
  parentId: null as number | null,
  parentName: '',
  loading: false,
  error: '',
})

onMounted(() => {
  if (route.query.success) {
    alert.visible = true
    alert.type = 'success'
    alert.title = 'Success Alert'
    alert.message = route.query.success as string
  }
  store.fetchParents()
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    store.fetchParents(1, searchQuery.value)
  }, 400)
}

const changePage = (page: number) => {
  store.setParentPage(page)
}

const refreshCurrentPage = async () => {
  await store.fetchParents(store.pagination.currentPage, searchQuery.value)
}

const openCreateModal = () => {
  isCreateModalOpen.value = true
}

const openEditModal = (parentId: number) => {
  selectedParentId.value = parentId
  isEditModalOpen.value = true
}

const handleParentCreated = async (message: string) => {
  alert.visible = true
  alert.type = 'success'
  alert.title = 'Success Alert'
  alert.message = message
  await refreshCurrentPage()
}

const handleParentUpdated = async (message: string) => {
  alert.visible = true
  alert.type = 'success'
  alert.title = 'Success Alert'
  alert.message = message
  await refreshCurrentPage()
}

const openDeleteModal = (parent: Parent) => {
  deleteModal.parentId = parent.id
  deleteModal.parentName = parent.nama
  deleteModal.show = true
}

const handleDelete = async () => {
  if (!deleteModal.parentId) return
  deleteModal.loading = true
  deleteModal.error = ''
  try {
    const data = await store.deleteParent(deleteModal.parentId)
    alert.visible = true
    alert.type = 'success'
    alert.title = 'Success Alert'
    alert.message = data.message || 'Akun wali murid berhasil dihapus.'
    deleteModal.show = false
    await refreshCurrentPage()
  } catch (error) {
    deleteModal.error = (error as Error).message
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Error Alert'
    alert.message = (error as Error).message
    deleteModal.show = false
  } finally {
    deleteModal.loading = false
  }
}
</script>
