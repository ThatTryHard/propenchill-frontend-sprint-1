<template>
  <DashboardLayout>
    <template #sidebar>
    <AdminSidebar 
        :userName="authStore.user?.nama || 'Matcha Addict'" 
        :userEmail="authStore.user?.email || 'matcha.addict@gmail.com'" 
      />
    </template>

    <div class="p-8 flex flex-col gap-6 h-full font-sans">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-[#1a202c]">Kelola Akun Staff/Admin</h1>
          <p class="text-[#718096] text-sm mt-1">Daftar akun pengelola sistem yang terdaftar</p>
        </div>
        <VButton variant="primary" @click="$router.push('/admin-management/create')">
          <template #leftIcon><Plus :size="18" /></template>
          Tambah Admin
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
          placeholder="Cari nama admin..."
          @update:modelValue="debouncedSearch"
        />
      </div>

      <div class="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden flex-1 shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[#e2e8f0] bg-[#f8fafc]">
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider">No</th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider">Nama</th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider">Email</th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider">Role</th>
                <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="adminStore.isLoading">
                <td colspan="5" class="px-6 py-12 text-center text-[#718096]">Memuat data admin...</td>
              </tr>
              <tr v-else-if="adminStore.admins.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-[#718096]">Data tidak tersedia</td>
              </tr>
              <tr
                v-else
                v-for="(admin, index) in adminStore.admins"
                :key="admin.id"
                class="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
              >
                <td class="px-6 py-4 text-[14px] text-[#4a5568]">{{ index + 1 }}</td>
                <td class="px-6 py-4 text-[14px] font-medium text-[#1a202c]">{{ admin.nama }}</td>
                <td class="px-6 py-4 text-[14px] text-[#4a5568]">{{ admin.email }}</td>
                <td class="px-6 py-4 text-[14px] text-[#4a5568]">
                  <span class="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-semibold uppercase">
                    {{ admin.role }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="$router.push('/admin-management/edit/' + admin.id)"
                      class="p-2 rounded-lg text-[#3F9760] hover:bg-[#e8f3eb] transition-colors"
                      title="Edit"
                    >
                      <Pencil :size="16" />
                    </button>
                    <button
                      @click="openDeleteConfirm(admin)"
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
      </div>

      <VModal
        v-model:is-open="formModal.show"
        :title="isEdit ? 'Edit Informasi Admin' : 'Tambah Admin Baru'"
        :description="isEdit ? 'Perbarui data pengelola sistem agar tetap akurat.' : 'Daftarkan akun admin baru untuk mengelola sistem SIMP.'"
        :buttons="formButtons"
      >
        <template #icon>
          <component :is="isEdit ? UserCheck : UserPlus" class="w-10 h-10 text-[#3f9760]" />
        </template>

        <div class="w-full flex flex-col gap-5 mt-4 text-left">
          <VInputField
            v-model="form.nama"
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap admin"
            :state="errors.nama ? 'error' : 'default'"
            :message="errors.nama"
            :disabled="formModal.loading"
          />

          <VInputField
            v-model="form.email"
            label="Alamat Email"
            type="email"
            placeholder="contoh: admin@simp.com"
            :state="errors.email ? 'error' : 'default'"
            :message="errors.email"
            :disabled="formModal.loading"
          />
          
          <div class="flex flex-col gap-2">
            <label class="text-[16px] font-semibold text-[#111827]">Role Akses</label>
            <select 
              v-model="form.role"
              class="w-full p-[14px] rounded-[12px] border-2 border-[#b2b5ba] focus:border-[#3f9760] outline-none bg-white text-[16px]"
              :disabled="formModal.loading"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="BIDANG_AGAMA">BIDANG AGAMA</option>
              <option value="BIDANG_KESISWAAN">BIDANG KESISWAAN</option>
              <option value="BIDANG_KURIKULUM">BIDANG KURIKULUM</option>
              <option value="KEPSEK">KEPALA SEKOLAH</option>
            </select>
          </div>
        </div>
      </VModal>

      <VModal
        v-model:is-open="deleteModal.show"
        title="Nonaktifkan Akun"
        :description="`Apakah Anda yakin ingin menonaktifkan akun ${deleteModal.adminName}? Akses ke sistem akan segera dicabut.`"
        :buttons="deleteButtons"
      >
        <template #icon>
          <UserX class="w-10 h-10 text-red-500" />
        </template>
      </VModal>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus, Pencil, Trash2, UserPlus, UserCheck, UserX } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VModal from '@/components/common/VModal.vue'
import VAlert from '@/components/common/VAlert.vue'
import { useAuthStore } from '@/stores/users/auth'

const adminStore = useAdminStore()
const searchQuery = ref('')
const isEdit = ref(false)
const selectedId = ref<number | null>(null)
const authStore = useAuthStore()

const alert = reactive({
  visible: false,
  type: 'success',
  title: '',
  message: '',
})

const formModal = reactive({ show: false, loading: false })
const deleteModal = reactive({ show: false, adminName: '', loading: false })

const form = ref({ nama: '', email: '', role: 'ADMIN' })
const errors = ref<Record<string, string>>({})

onMounted(() => adminStore.fetchAdmins())

// Debounced Search sesuai ListView.vue
let searchTimeout: any = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    adminStore.fetchAdmins(searchQuery.value)
  }, 400)
}

const openAddModal = () => {
  isEdit.value = false
  form.value = { nama: '', email: '', role: 'ADMIN' }
  errors.value = {}
  formModal.show = true
}

const openEditModal = (admin: any) => {
  isEdit.value = true
  selectedId.value = admin.id
  form.value = { nama: admin.nama, email: admin.email, role: admin.role }
  errors.value = {}
  formModal.show = true
}

const openDeleteConfirm = (admin: any) => {
  selectedId.value = admin.id
  deleteModal.adminName = admin.nama
  deleteModal.show = true
}

const handleDelete = async () => {
  if (!selectedId.value) return
  deleteModal.loading = true
  try {
    await adminStore.deleteAdmin(selectedId.value)
    showAlert('success', 'Terhapus!', 'Akun berhasil dinonaktifkan.')
    deleteModal.show = false
  } catch (err) {
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

const handleSave = async () => {
  errors.value = {} // Reset error setiap klik simpan
  
  // Validasi lokal sederhana sebelum tembak API
  if (!form.value.nama.trim()) {
    errors.value.nama = 'Nama wajib diisi!'
    return
  }
  if (!form.value.email.trim()) {
    errors.value.email = 'Email wajib diisi!'
    return
  }

  formModal.loading = true
  try {
    if (isEdit.value && selectedId.value) {
      // PBI-MAP6: Update
      await adminStore.updateAdmin(selectedId.value, form.value)
      showAlert('success', 'Berhasil!', 'Data admin berhasil diperbarui.')
    } else {
      // PBI-MAP4: Create
      await adminStore.addAdmin(form.value)
      showAlert('success', 'Berhasil!', 'Admin baru berhasil didaftarkan.')
    }
    closeModal()
  } catch (err: any) {
    // Menangkap error 400/409 dari Django (Misal: email duplikat)
    if (err.data) {
      errors.value = err.data // Memasukkan error backend ke state UI
    } else {
      showAlert('error', 'Gagal!', 'Terjadi kesalahan pada sistem.')
    }
  } finally {
    formModal.loading = false
  }
}

const closeModal = () => {
  formModal.show = false
  errors.value = {}
  form.value = { nama: '', email: '', role: 'ADMIN' }
}

// Konfigurasi Tombol Modal Form (Tambah/Edit)
const formButtons = computed(
  (): Array<{ label: string; variant: 'primary' | 'secondary'; action: () => void }> => [
  {
    label: formModal.loading ? 'Memproses...' : (isEdit.value ? 'Simpan Perubahan' : 'Tambah Admin'),
    variant: 'primary',
    action: () => {
      if (!formModal.loading) handleSave()
    }
  },
  {
    label: 'Batal',
    variant: 'secondary',
    action: () => {
      closeModal()
    }
  }
])

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
</script>