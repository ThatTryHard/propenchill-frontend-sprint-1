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
          <VButton variant="primary" @click="$router.push('/admin/guru/tambah')">
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
            <option value="Guru Bidang Agama">Guru Bidang Agama</option> <option value="Guru">Guru</option>
          </select>
        </div>
  
        <div class="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden flex-1 flex flex-col shadow-sm">
          <div class="overflow-x-auto flex-1">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-[#e2e8f0] bg-[#f8fafc]">
                  <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase w-16">No</th>
                  <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase">Nama</th>
                  <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase">NIY</th>
                  <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase">Jabatan</th>
                  <th class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase text-center">Aksi</th>
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
                    {{ ((store.pagination?.currentPage || 1) - 1) * (store.pagination?.limit || 10) + index + 1 }}
                  </td>
                  <td class="px-6 py-4 text-[14px] font-medium text-[#1a202c]">{{ teacher.nama }}</td>
                  <td class="px-6 py-4 text-[14px] text-[#4a5568]">{{ teacher.niy }}</td>
                  <td class="px-6 py-4 text-[14px] text-[#4a5568]">{{ teacher.jabatan }}</td>
                  <td class="px-6 py-4">
                    <div class="flex justify-center gap-2">
                      <button @click="$router.push(`/admin/guru/${teacher.id}/edit`)" class="p-2 text-[#3F9760] hover:bg-[#e8f3eb] rounded-lg transition-colors">
                        <Pencil :size="16" />
                      </button>
                      <button @click="openDeleteModal(teacher)" class="p-2 text-[#A0453B] hover:bg-[#fde8e8] rounded-lg transition-colors">
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <div v-if="store.pagination?.totalPages > 1" class="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
            <VPagination 
              :current-page="store.pagination.currentPage" 
              :total-pages="store.pagination.totalPages" 
              @page-change="(p: number) => store.fetchTeachers(p, searchQuery, selectedJabatan)" 
            />
          </div>
        </div>
  
        <VModal 
          v-model:is-open="deleteModal.show" 
          title="Hapus Akun Guru" 
          :description="`Apakah Anda yakin ingin menghapus data akun ${deleteModal.teacherName}?`" 
          :buttons="deleteButtons"
        >
          <template #icon>
            <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 class="w-6 h-6 text-red-600" />
            </div>
          </template>
        </VModal>
      </div>
    </DashboardLayout>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
  import { useTeacherStore } from '@/stores/teacher'
  import { useAuthStore } from '@/stores/users/auth'
  
  import DashboardLayout from '@/components/common/DashboardLayout.vue'
  import AdminSidebar from '@/components/admin/AdminSidebar.vue'
  import VButton from '@/components/common/VButton.vue'
  import VInputField from '@/components/common/VInputField.vue'
  import VModal from '@/components/common/VModal.vue'
  import VAlert from '@/components/common/VAlert.vue'
  import VPagination from '@/components/common/VPagination.vue'
  
  const store = useTeacherStore()
  const authStore = useAuthStore()
  const route = useRoute()
  
  const searchQuery = ref('')
  const selectedJabatan = ref('')
  const alert = reactive({ visible: false, type: 'success' as 'success' | 'error', title: '', message: '' })
  const deleteModal = reactive({ show: false, teacherId: null as number | null, teacherName: '', loading: false })
  
  onMounted((): void => {
    if (route.query.success) {
      alert.visible = true
      alert.type = 'success'
      alert.message = route.query.success as string
    }
    store.fetchTeachers(1, '', '')
  })
  
  let timeout: ReturnType<typeof setTimeout> | null = null
  const debouncedSearch = (): void => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      store.fetchTeachers(1, searchQuery.value, selectedJabatan.value)
    }, 400)
  }
  
  const handleFilter = (): Promise<void> => 
    store.fetchTeachers(1, searchQuery.value, selectedJabatan.value)
  
  const openDeleteModal = (teacher: any): void => {
    deleteModal.teacherId = teacher.id
    deleteModal.teacherName = teacher.nama
    deleteModal.show = true
  }
  
  const deleteButtons = computed(() => [
    { 
      label: deleteModal.loading ? 'Memproses...' : 'Ya, Hapus', 
      variant: 'primary' as const, 
      action: (): Promise<void> => handleDelete() 
    },
    { 
      label: 'Batal', 
      variant: 'secondary' as const, 
      action: (): void => { deleteModal.show = false } 
    }
  ])

  const handleDelete = async (): Promise<void> => {
    if (!deleteModal.teacherId) return
    deleteModal.loading = true
    try {
      await store.deleteTeacher(deleteModal.teacherId)
      alert.visible = true
      alert.type = 'success'
      alert.message = 'Akun guru berhasil dihapus dari sistem.'
      deleteModal.show = false
      await store.fetchTeachers(store.pagination.currentPage, searchQuery.value, selectedJabatan.value)
    } catch (e: any) {
      alert.visible = true
      alert.type = 'error'
      alert.message = e.message || 'Gagal menghapus data guru.'
    } finally {
      deleteModal.loading = false
    }
  }
  </script>