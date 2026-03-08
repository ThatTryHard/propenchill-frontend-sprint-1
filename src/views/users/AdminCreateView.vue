<template>
  <DashboardLayout>
    <template #sidebar>
      <AdminSidebar userName="Matcha Addict" userEmail="matcha.addict@gmail.com" />
    </template>
    
    <div class="p-8 flex flex-col gap-8 h-full font-sans bg-[#f8fafc]">
      <div class="flex flex-col gap-4">
        <button @click="$router.push('/admin-management')" class="flex items-center gap-2 text-[#718096] hover:text-[#1a202c] transition-colors">
          <ArrowLeft :size="18" />
          <span class="text-sm">Kembali</span>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-[#1a202c]">Tambah Admin Baru</h1>
          <p class="text-[#718096] text-sm mt-1">Buat akun baru untuk pengelola sistem</p>
        </div>
      </div>

      <div class="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm max-w-4xl">
        <div class="flex flex-col gap-6">
          <VInputField
            v-model="form.nama"
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            :state="errors.nama ? 'error' : 'default'"
            :message="errors.nama"
          />
          <VInputField
            v-model="form.email"
            label="Email"
            placeholder="nama@email.com"
            :state="errors.email ? 'error' : 'default'"
            :message="errors.email"
          />
          
          <div class="flex flex-col gap-2">
            <label class="text-[16px] font-semibold text-[#111827]">Role</label>
            <select v-model="form.role" class="w-full p-[14px] rounded-[12px] border-2 border-[#b2b5ba] focus:border-[#3f9760] outline-none bg-white">
              <option value="ADMIN">ADMIN</option>
              <option value="KEPSEK">KEPALA SEKOLAH</option>
              <option value="BIDANG_KURIKULUM">KURIKULUM</option>
            </select>
          </div>
        </div>

        <div class="flex gap-4 mt-10">
          <VButton variant="tertiary" class="px-8" @click="$router.push('/admin-management')">Batal</VButton>
          <VButton variant="primary" class="px-8" :loading="isLoading" @click="handleSave">Simpan</VButton>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'
import { useAuthStore } from '@/stores/users/auth'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import VInputField from '@/components/common/VInputField.vue'
import VButton from '@/components/common/VButton.vue'

const router = useRouter()
const adminStore = useAdminStore()
const authStore = useAuthStore()

const form = ref({ nama: '', email: '', role: 'ADMIN' })
const errors = ref<Record<string, string>>({})
const isLoading = ref(false)

const handleSave = async () => {
  isLoading.value = true
  errors.value = {}
  try {
    await adminStore.addAdmin(form.value)
    router.push({ path: '/admin-management', query: { success: 'Akun admin berhasil dibuat' }})
  } catch (err: any) {
    if (err.data) errors.value = err.data
  } finally {
    isLoading.value = false
  }
}
</script>