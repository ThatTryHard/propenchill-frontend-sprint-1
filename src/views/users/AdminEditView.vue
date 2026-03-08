<template>
  <DashboardLayout>
    <template #sidebar>
      <AdminSidebar userName="Matcha Addict" userEmail="matcha.addict@gmail.com" />
    </template>
    
    <div class="p-8 flex flex-col gap-8 h-full font-sans bg-[#f8fafc]">
      <div class="flex flex-col gap-4">
        <button @click="$router.push('/admin-management')" class="flex items-center gap-2 text-[#718096] hover:text-[#1a202c]">
          <ArrowLeft :size="18" />
          <span class="text-sm">Kembali</span>
        </button>
        <h1 class="text-2xl font-bold text-[#1a202c]">Edit Akun Admin</h1>
      </div>

      <div class="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm max-w-4xl">
        <div class="flex flex-col gap-6">
          <VInputField v-model="form.nama" label="Nama Lengkap" :state="errors.nama ? 'error' : 'default'" :message="errors.nama" />
          <VInputField v-model="form.email" label="Email" :state="errors.email ? 'error' : 'default'" :message="errors.email" />
        </div>

        <div class="flex justify-between mt-10">
        <VButton variant="tertiary" @click="handleDelete">
        <template #leftIcon><Trash2 :size="18" /></template>
        Hapus
        </VButton>
          <VButton 
            variant="primary" 
            class="px-8" 
            :loading="isLoading" 
            @click="handleUpdate"
            >
            Simpan Perubahan
            </VButton>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Trash2 } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/users/auth'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import VInputField from '@/components/common/VInputField.vue'
import VButton from '@/components/common/VButton.vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()
const authStore = useAuthStore() // WAJIB ADA agar tidak blank

const form = ref({ nama: '', email: '', role: '' })
const errors = ref<Record<string, string>>({})
const isLoading = ref(false)
const showDeleteConfirm = ref(false) // WAJIB ADA untuk tombol hapus

onMounted(async () => {
  const adminId = route.params.id
  try {
    // Memastikan ID dikirim sebagai string ke store
    const data = await adminStore.fetchAdminById(adminId as string)
    form.value = { 
      nama: data.nama, 
      email: data.email, 
      role: data.role 
    }
  } catch (err) {
    console.error("Gagal memuat data:", err)
  }
})

// Di dalam script setup AdminEditView.vue
const handleUpdate = async () => {
  // Pastikan form tidak kosong sebelum submit
  if (!form.value.nama || !form.value.email) {
    errors.value = { 
      nama: !form.value.nama ? 'Nama tidak boleh kosong' : '',
      email: !form.value.email ? 'Email tidak boleh kosong' : ''
    }
    return
  }

  isLoading.value = true
  try {
    const adminId = Number(route.params.id) // Konversi ke number
    await adminStore.updateAdmin(adminId, {
      nama: form.value.nama,
      email: form.value.email,
      role: form.value.role
    })
    
    // Redirect balik ke tabel dengan pesan sukses
    router.push({ 
      path: '/admin-management', 
      query: { success: 'Data admin berhasil diperbarui!' } 
    })
  } catch (err: any) {
    console.error("Update gagal:", err)
    if (err.data) {
      errors.value = err.data
    }
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async () => {
  const adminId = Number(route.params.id)
  try {
    await adminStore.deleteAdmin(adminId)
    router.push({ 
      path: '/admin-management', 
      query: { success: 'Akun admin telah dinonaktifkan.' } 
    })
  } catch (err) {
    alert("Gagal menghapus: Akun ini mungkin milik Anda sendiri.")
  }
}
</script>