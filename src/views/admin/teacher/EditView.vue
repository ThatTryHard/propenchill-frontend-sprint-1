<template>
    <DashboardLayout>
      <template #sidebar>
        <AdminSidebar 
          :userName="authStore.user?.nama || 'Admin SIMP'" 
          :userEmail="authStore.user?.email || 'admin@sekolah.com'" 
        />
      </template>
  
      <div class="p-8 flex flex-col gap-6 max-w-[800px]">
        <button @click="$router.push('/admin/guru')" class="flex items-center gap-1 text-sm text-[#718096] mb-4 hover:text-[#3f9760] transition-colors">
          <ArrowLeft :size="16" /> Kembali
        </button>
        
        <h1 class="text-2xl font-bold text-[#1a202c]">Edit Data Guru</h1>
  
        <div v-if="isFetching" class="py-12 text-center text-[#718096]">Memuat data...</div>
  
        <template v-else>
          <VAlert v-if="alert.visible" v-bind="alert" @close="alert.visible = false" />
          
          <div class="flex flex-col gap-4 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-sm">
            <VInputField v-model="form.nama" label="Nama Lengkap" :state="errors.nama ? 'error' : 'default'" :message="errors.nama" />
            <VInputField v-model="form.email" label="Alamat Email" :state="errors.email ? 'error' : 'default'" :message="errors.email" />
            <VInputField v-model="form.niy" label="NIY" :state="errors.niy ? 'error' : 'default'" :message="errors.niy" />
            
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-[#4a5568]">Jabatan</label>
              <select v-model="form.jabatan" class="border border-[#e2e8f0] rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-[#3f9760]">
                <option value="Kepala Sekolah">Kepala Sekolah</option>
                <option value="Guru Bidang Kurikulum">Guru Bidang Kurikulum</option>
                <option value="Guru Bidang Kesiswaan">Guru Bidang Kesiswaan</option>
                <option value="Guru Bidang Agama">Guru Bidang Agama</option>
                <option value="Guru">Guru</option>
              </select>
              <span v-if="errors.jabatan" class="text-xs text-red-500 mt-1">{{ errors.jabatan }}</span>
            </div>
  
            <div class="flex gap-3 mt-4">
              <VButton variant="primary" class="h-[48px] px-8" :loading="isLoading" @click="updateModalShow = true">
                Simpan Perubahan
              </VButton>
            </div>
          </div>
        </template>
  
        <VModal v-model:is-open="updateModalShow" title="Simpan Perubahan?" description="Apakah Anda yakin ingin memperbarui data ini?" :buttons="updateButtons">
          <template #icon><UserCheck class="w-10 h-10 text-[#3f9760]" /></template>
        </VModal>
      </div>
    </DashboardLayout>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ArrowLeft, UserCheck } from 'lucide-vue-next'
  import { useTeacherStore, validateTeacherForm } from '@/stores/teacher'
  import { useAuthStore } from '@/stores/users/auth'
  
  import DashboardLayout from '@/components/common/DashboardLayout.vue'
  import AdminSidebar from '@/components/admin/AdminSidebar.vue'
  import VButton from '@/components/common/VButton.vue'
  import VInputField from '@/components/common/VInputField.vue'
  import VModal from '@/components/common/VModal.vue'
  import VAlert from '@/components/common/VAlert.vue'
  
  const store = useTeacherStore()
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  
  const form = reactive({ nama: '', email: '', niy: '', jabatan: '' })
  const errors = reactive({ nama: '', email: '', niy: '', jabatan: '' })
  const isFetching = ref(true)
  const isLoading = ref(false)
  const updateModalShow = ref(false)
  const alert = reactive({ visible: false, type: 'error' as 'error' | 'success', message: '' })
  
  onMounted(async (): Promise<void> => {
    try {
      const data = await store.fetchTeacherById(route.params.id as string)
      Object.assign(form, { nama: data.nama, email: data.email, niy: data.niy, jabatan: data.jabatan })
    } catch (e: any) {
      alert.visible = true; alert.message = 'Gagal memuat data guru.'
    } finally { isFetching.value = false }
  })
  
  const updateButtons = computed(() => [
    { label: isLoading.value ? 'Memproses...' : 'Ya, Simpan', variant: 'primary' as const, action: handleUpdate },
    { label: 'Batal', variant: 'secondary' as const, action: () => { updateModalShow.value = false } }
  ])
  
  const handleUpdate = async (): Promise<void> => {
    Object.assign(errors, { nama: '', email: '', niy: '', jabatan: '' })
    alert.visible = false
    
    const localValidation = validateTeacherForm(form)
    if (Object.keys(localValidation).length > 0) {
      Object.assign(errors, localValidation)
      alert.message = 'Periksa kembali data yang belum valid.'; alert.visible = true
      updateModalShow.value = false; return
    }
  
    isLoading.value = true
    try {
      await store.updateTeacher(route.params.id as string, form)
      router.push({ path: '/admin/guru', query: { success: 'Data guru berhasil diperbarui.' } })
    } catch (e: any) {
      if (e.details) {
        const keys = Object.keys(e.details)
        keys.forEach(k => { if (k in errors) (errors as any)[k] = e.details[k][0] })
        
        const msgs = keys.map(k => k === 'niy' ? 'NIY sudah digunakan' : k === 'email' ? 'Email sudah digunakan' : 'Data konflik')
        alert.message = `Gagal memperbarui ${msgs.join(' & ')}.`; alert.visible = true
      } else {
        alert.message = 'Terjadi kesalahan sistem.'; alert.visible = true
      }
      updateModalShow.value = false
    } finally { isLoading.value = false }
  }
  </script>