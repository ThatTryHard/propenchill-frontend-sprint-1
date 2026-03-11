<template>
  <DashboardLayout>
    <template #sidebar>
      <AdminSidebar userName="Matcha Addict" userEmail="matcha.addict@gmail.com" />
    </template>
    <div class="p-8 flex flex-col gap-6 h-full">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-[#1a202c]">Kelola Wali Murid</h1>
          <p class="text-[#718096] text-sm mt-1">Daftar akun wali murid yang terdaftar</p>
        </div>
        <VButton variant="primary" @click="$router.push('/admin/parents/create')">
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
                  <div class="flex items-center gap-2">
                    <button
                      @click="$router.push(`/admin/parents/${parent.id}/edit`)"
                      class="p-2 rounded-lg text-[#3F9760] hover:bg-[#e8f3eb] transition-colors"
                      title="Edit"
                    >
                      <Pencil :size="16" />
                    </button>
                    <button
                      @click="openDeleteModal(parent)"
                      class="p-2 rounded-lg text-[#A0453B] hover:bg-[#fde8e8] transition-colors"
                      title="Hapus"
                    >
                      <Trash2 :size="16" />
                    </button>
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

      <!-- Delete Modal -->
      <!-- <VModal
        :show="deleteModal.show"
        icon="delete"
        title="Hapus Wali Murid"
        :description="`Apakah Anda yakin ingin menghapus akun ${deleteModal.parentName}? Tindakan ini tidak dapat dibatalkan.`"
        confirmText="Hapus"
        cancelText="Batal"
        :loading="deleteModal.loading"
        @close="deleteModal.show = false"
        @confirm="handleDelete"
      /> -->
      <VModal
        v-model:is-open="deleteModal.show"
        title="Hapus Wali Murid"
        :description="`Apakah Anda yakin ingin menghapus akun ${deleteModal.parentName}? Tindakan ini tidak dapat dibatalkan.`"
        :buttons="deleteButtons"
      >
        <template #icon>
          <Trash2 class="w-10 h-10 text-red-500" />
        </template>
      </VModal>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useParentStore, type Parent } from '@/stores/parents'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VModal from '@/components/common/VModal.vue'
import VAlert from '@/components/common/VAlert.vue'

const store = useParentStore()
const route = useRoute()

const searchQuery = ref('')

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
  store.fetchParents(page, searchQuery.value)
}

const openDeleteModal = (parent: Parent) => {
  deleteModal.parentId = parent.id
  deleteModal.parentName = parent.nama
  deleteModal.show = true
}

// Konfigurasi Tombol Modal Delete
const deleteButtons = computed(
    (): Array<{ label: string; variant: 'primary' | 'secondary'; action: () => void }> => [
  {
    label: deleteModal.loading ? 'Menghapus...' : 'Hapus',
    variant: 'primary',
    action: () => {
      if (!deleteModal.loading) handleDelete()
    }
  },
  {
    label: 'Batal',
    variant: 'secondary',
    action: () => {
      deleteModal.show = false
    }
  }
])

const handleDelete = async () => {
  if (!deleteModal.parentId) return
  deleteModal.loading = true
  try {
    const data = await store.deleteParent(deleteModal.parentId)
    alert.visible = true
    alert.type = 'success'
    alert.title = 'Success Alert'
    alert.message = data.message || 'Akun wali murid berhasil dihapus.'
    deleteModal.show = false
    store.fetchParents(store.pagination.currentPage, searchQuery.value)
  } catch (error) {
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
