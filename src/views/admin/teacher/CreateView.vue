<template>
    <DashboardLayout>
      <template #sidebar>
        <AdminSidebar 
          :userName="authStore.user?.nama || 'Admin SIMP'" 
          :userEmail="authStore.user?.email || 'admin@sekolah.com'" 
        />
      </template>
  
      <div class="p-8 max-w-4xl mx-auto">
        <div class="mb-8 flex flex-col gap-1">
          <button 
            @click="$router.push('/admin/guru')" 
            class="flex items-center text-sm text-[#718096] hover:text-[#3f9760] transition-colors mb-2 w-fit"
          >
            <ChevronLeft :size="18" /> Kembali ke Daftar
          </button>
          <h1 class="text-2xl font-bold text-[#1a202c]">Tambah Guru Baru</h1>
          <p class="text-[#718096] text-sm">Pastikan data NIY dan Email belum pernah terdaftar sebelumnya dalam sistem.</p>
        </div>
  
        <div class="bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-sm">
          <VAlert v-if="alert.visible" :type="alert.type" :message="alert.message" @close="alert.visible = false" class="mb-6" />
  
          <form @submit.prevent="handleSubmit" class="flex flex-col gap-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-[#4a5568]">Nama Lengkap</label>
                <VInputField 
                  v-model="form.nama" 
                  placeholder="Masukkan nama lengkap" 
                  :state="errors.nama ? 'error' : 'default'" 
                  :message="errors.nama" 
                />
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-semibold text-[#4a5568]">NIY (8 Digit Angka)</label>
                <VInputField 
                  v-model="form.niy" 
                  placeholder="Contoh: 12345678" 
                  :state="errors.niy ? 'error' : 'default'" 
                  :message="errors.niy" 
                />
              </div>
            </div>
  
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-[#4a5568]">Alamat Email</label>
              <VInputField 
                v-model="form.email" 
                type="email" 
                placeholder="contoh@sekolah.com" 
                :state="errors.email ? 'error' : 'default'" 
                :message="errors.email" 
              />
            </div>
  
            <div class="flex flex-col gap-2">
              <label class="text-sm font-semibold text-[#4a5568]">Jabatan / Bidang</label>
              <select 
                v-model="form.jabatan" 
                class="w-full border border-[#e2e8f0] rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-[#3f9760] outline-none bg-white transition-all"
                :class="{'border-red-500': errors.jabatan}"
              >
                <option value="" disabled>Pilih Jabatan</option>
                <option value="Kepala Sekolah">Kepala Sekolah</option>
                <option value="Guru Bidang Kurikulum">Guru Bidang Kurikulum</option>
                <option value="Guru Bidang Kesiswaan">Guru Bidang Kesiswaan</option>
                <option value="Guru Bidang Agama">Guru Bidang Agama</option>
                <option value="Guru">Guru</option>
              </select>
              <span v-if="errors.jabatan" class="text-xs text-red-500 mt-1">{{ errors.jabatan }}</span>
            </div>
  
            <div class="flex justify-end gap-4 mt-4 pt-6 border-t border-[#f1f5f9]">
              <VButton type="button" variant="secondary" @click="$router.push('/admin/guru')">Batal</VButton>
              <VButton type="submit" variant="primary" :loading="loading">Simpan Akun Guru</VButton>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { ChevronLeft } from 'lucide-vue-next'
  import { useTeacherStore, validateTeacherForm } from '@/stores/teacher'
  import { useAuthStore } from '@/stores/users/auth'
  
  // Components
  import DashboardLayout from '@/components/common/DashboardLayout.vue'
  import AdminSidebar from '@/components/admin/AdminSidebar.vue'
  import VButton from '@/components/common/VButton.vue'
  import VInputField from '@/components/common/VInputField.vue'
  import VAlert from '@/components/common/VAlert.vue'
  
  const router = useRouter()
  const store = useTeacherStore()
  const authStore = useAuthStore() 
  
  const loading = ref(false)
  const alert = reactive({ visible: false, type: 'error' as 'error' | 'success', message: '' })
  const form = reactive({ nama: '', email: '', niy: '', jabatan: '' })
  const errors = ref<Record<string, string>>({})
  
  const handleSubmit = async (): Promise<void> => {
    errors.value = {}
    alert.visible = false
  
    const localErrors = validateTeacherForm(form)
    if (Object.keys(localErrors).length > 0) {
      errors.value = localErrors
      alert.message = 'Gagal menyimpan data. Silakan lengkapi seluruh kolom yang wajib diisi.'
      alert.type = 'error'
      alert.visible = true
      return
    }
  
    loading.value = true
    try {
      await store.createTeacher(form)
      router.push({ 
        path: '/admin/guru', 
        query: { success: 'Data guru berhasil didaftarkan.' } 
      })
    } catch (error: any) {
      if (error.details) {
        const detailKeys = Object.keys(error.details)
        
        detailKeys.forEach((key) => {
          errors.value[key] = Array.isArray(error.details[key]) ? error.details[key][0] : error.details[key]
        })
  
        const specificMessages: string[] = []
        if (error.details.niy) specificMessages.push('Nomor Induk Yayasan (NIY) sudah terdaftar')
        if (error.details.email) specificMessages.push('Alamat email sudah terdaftar')
        
        alert.message = specificMessages.length > 0 
          ? `Gagal menyimpan data. ${specificMessages.join(' dan ')}!` 
          : 'Terjadi kesalahan validasi pada sistem.'
      } else {
        alert.message = error.message || 'Terjadi kesalahan pada sistem.'
      }
      alert.type = 'error'
      alert.visible = true
    } finally {
      loading.value = false
    }
  }
  </script>