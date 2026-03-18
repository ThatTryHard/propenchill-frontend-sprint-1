<template>
  <DashboardLayout>
    <template #sidebar>
      <AdminSidebar />
    </template>

    <div class="p-8 flex flex-col gap-6 h-full font-sans">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-[#1a202c]">Kelola Akun Staff</h1>
          <p class="text-[#718096] text-sm mt-1">Daftar akun pengelola sistem yang terdaftar</p>
        </div>
        <VButton variant="primary" @click="openAddModal">
          <template #leftIcon><Plus :size="18" /></template>
          Tambah Staff
        </VButton>
      </div>

      <VAlert
        v-if="alert.visible"
        :visible="alert.visible"
        :type="alert.type"
        :title="alert.title"
        :message="alert.message"
        @close="alert.visible = false"
      />

      <div class="w-full max-w-[400px]">
        <VInputField
          v-model="searchQuery"
          state="search"
          placeholder="Cari nama staff..."
          @update:modelValue="debouncedSearch"
        />
      </div>

      <div class="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden flex-1 flex flex-col shadow-sm">
        <div class="overflow-x-auto flex-1">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th
                  class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider"
                >
                  No
                </th>
                <th
                  class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider"
                >
                  Nama
                </th>
                <th
                  class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider text-center"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="adminStore.isLoading">
                <td colspan="5" class="px-6 py-12 text-center text-[#718096]">
                  Memuat data admin...
                </td>
              </tr>
              <tr v-else-if="adminStore.admins.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-[#718096]">
                  Data tidak tersedia
                </td>
              </tr>
              <tr
                v-else
                v-for="(admin, index) in paginatedAdmins"
                :key="admin.id"
                class="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
              >
                <td class="px-6 py-4 text-[14px] text-[#4a5568]">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                <td class="px-6 py-4 text-[14px] font-medium text-[#1a202c]">{{ admin.nama }}</td>
                <td class="px-6 py-4 text-[14px] text-[#4a5568]">{{ admin.email }}</td>
                <td class="px-6 py-4 text-[14px] text-[#4a5568]">
                  <span
                    class="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-semibold uppercase"
                  >
                    {{ admin.role }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <VButton
                      variant="secondary"
                      class="!h-[26px] !min-w-[58px] !px-[10px] !py-0 !rounded-[8px] !text-[12px] !font-medium"
                      @click="openEditModal(admin)"
                    >
                      <template #leftIcon>
                        <Pencil :size="12" />
                      </template>
                      Edit
                    </VButton>
                    <VButton
                      variant="primary"
                      class="!h-[26px] !min-w-[64px] !px-[10px] !py-0 !rounded-[8px] !text-[12px] !font-medium"
                      @click="openDeleteConfirm(admin)"
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
            Halaman {{ currentPage }} dari {{ totalPages }} ({{ adminStore.admins.length }} data)
          </span>

          <VPagination
            v-model:currentPage="currentPage"
            :totalPages="totalPages"
          />
        </div>
      </div>

      <AdminAccountModal
        :isOpen="formModal.show"
        :isEdit="isEdit"
        :loading="formModal.loading"
        :errorMessage="formModal.error"
        :initialForm="form"
        @update:isOpen="formModal.show = $event"
        @submit="handleSave"
      />

      <ConfirmationModal
        :isOpen="deleteModal.show"
        title="Nonaktifkan Akun"
        :description="`Apakah Anda yakin ingin menonaktifkan akun ${deleteModal.adminName}? Akses ke sistem akan segera dicabut.`"
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
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminAccountModal from '@/components/admin/management/AdminAccountModal.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VAlert from '@/components/common/VAlert.vue'
import VPagination from '@/components/common/VPagination.vue'

const adminStore = useAdminStore()
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10
const isEdit = ref(false)
const selectedId = ref<number | null>(null)

const alert = reactive({
  visible: false,
  type: 'success',
  title: '',
  message: '',
})

const formModal = reactive({ show: false, loading: false, error: '' })
const deleteModal = reactive({ show: false, adminName: '', loading: false, error: '' })

const form = ref({ nama: '', email: '', role: 'ADMIN' })

const totalPages = computed(() => Math.max(1, Math.ceil(adminStore.admins.length / pageSize)))
const paginatedAdmins = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return adminStore.admins.slice(start, start + pageSize)
})

onMounted(() => adminStore.fetchAdmins())

watch(
  () => adminStore.admins.length,
  () => {
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  },
)

let searchTimeout: any = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    adminStore.fetchAdmins(searchQuery.value)
  }, 400)
}

const openAddModal = () => {
  isEdit.value = false
  form.value = { nama: '', email: '', role: 'ADMIN' }
  formModal.error = ''
  formModal.show = true
}

const openEditModal = (admin: any) => {
  isEdit.value = true
  selectedId.value = admin.id
  form.value = { nama: admin.nama, email: admin.email, role: admin.role }
  formModal.error = ''
  formModal.show = true
}

const openDeleteConfirm = (admin: any) => {
  selectedId.value = admin.id
  deleteModal.adminName = admin.nama
  deleteModal.error = ''
  deleteModal.show = true
}

const handleDelete = async () => {
  if (!selectedId.value) return
  deleteModal.loading = true
  deleteModal.error = ''
  try {
    await adminStore.deleteAdmin(selectedId.value)
    showAlert('success', 'Terhapus!', 'Akun berhasil dinonaktifkan.')
    deleteModal.show = false
  } catch (err) {
    deleteModal.error = 'Tidak bisa menghapus akun sendiri.'
    showAlert('error', 'Gagal!', 'Tidak bisa menghapus akun sendiri.')
    deleteModal.show = false
  } finally {
    deleteModal.loading = false
  }
}

const showAlert = (type: string, title: string, message: string) => {
  alert.visible = true
  alert.type = type
  alert.title = title
  alert.message = message
}

const handleSave = async (payload: { nama: string; email: string; role: string }) => {
  formModal.loading = true
  formModal.error = ''
  try {
    if (isEdit.value && selectedId.value) {
      await adminStore.updateAdmin(selectedId.value, payload)
      showAlert('success', 'Berhasil!', 'Data admin berhasil diperbarui.')
    } else {
      await adminStore.addAdmin(payload)
      showAlert('success', 'Berhasil!', 'Admin baru berhasil didaftarkan.')
    }
    closeModal()
    currentPage.value = 1
  } catch (err: any) {
    formModal.error = err?.data?.error || err?.data?.message || 'Terjadi kesalahan pada sistem.'
    showAlert('error', 'Gagal!', formModal.error)
  } finally {
    formModal.loading = false
  }
}

const closeModal = () => {
  formModal.show = false
  formModal.error = ''
  form.value = { nama: '', email: '', role: 'ADMIN' }
}
</script>
