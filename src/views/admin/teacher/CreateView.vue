<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <div class="p-8 max-w-4xl mx-auto">
      <div class="mb-8 flex flex-col gap-1">
        <button
          @click="$router.push('/admin/teachers')"
          class="flex items-center text-sm text-[#718096] hover:text-[#3f9760] transition-colors mb-2 w-fit"
        >
          <ChevronLeft :size="18" /> Kembali ke Daftar
        </button>
        <h1 class="text-2xl font-bold text-[#1a202c]">Tambah Guru Baru</h1>
        <p class="text-[#718096] text-sm">
          Pastikan data NIY dan Email belum pernah terdaftar sebelumnya dalam sistem.
        </p>
      </div>

      <div class="bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-sm">
        <VAlert
          v-if="alert.visible"
          :type="alert.type"
          :message="alert.message"
          @close="alert.visible = false"
          class="mb-6"
        />

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
            <VDropdown
              v-model="form.jabatan"
              :options="jabatanOptions"
              placeholder="Pilih Jabatan"
            />
            <span v-if="errors.jabatan" class="text-xs text-red-500 mt-1">{{
              errors.jabatan
            }}</span>
          </div>

          <div class="flex justify-end gap-4 mt-4 pt-6 border-t border-[#f1f5f9]">
            <VButton type="button" variant="secondary" @click="$router.push('/admin/teachers')"
              >Batal</VButton
            >
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

// Components
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VAlert from '@/components/common/VAlert.vue'

const router = useRouter()
const store = useTeacherStore()

const loading = ref(false)
const alert = reactive({ visible: false, type: 'error' as 'error' | 'success', message: '' })
const form = reactive({ nama: '', email: '', niy: '', jabatan: '' })
const jabatanOptions = [
  { label: 'Kepala Sekolah', value: 'Kepala Sekolah' },
  { label: 'Guru Bidang Akademik', value: 'Guru Bidang Akademik' },
  { label: 'Guru Bidang Kesiswaan', value: 'Guru Bidang Kesiswaan' },
  { label: 'Guru Bidang Agama', value: 'Guru Bidang Agama' },
  { label: 'Guru', value: 'Guru' },
]
const errors = ref<Record<string, string>>({})

type ErrorDetails = Record<string, string | string[]>

const getErrorPayload = (error: unknown): { message?: string; details?: ErrorDetails } => {
  if (typeof error === 'object' && error !== null) {
    const payload = error as { message?: string; details?: ErrorDetails }
    return payload
  }
  return {}
}

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
      path: '/admin/teachers',
      query: { success: 'Data guru berhasil didaftarkan.' },
    })
  } catch (error: unknown) {
    errors.value = {}
    const payload = getErrorPayload(error)

    if (payload.details && Object.keys(payload.details).length > 0) {
      const detailKeys = Object.keys(payload.details)
      detailKeys.forEach((key) => {
        const fieldError = payload.details?.[key]
        errors.value[key] = Array.isArray(fieldError) ? (fieldError[0] ?? '') : (fieldError ?? '')
      })

      const firstField = detailKeys[0]
      if (firstField && payload.details?.[firstField]) {
        const firstFieldError = payload.details[firstField]
        alert.message = Array.isArray(firstFieldError)
          ? (firstFieldError[0] ?? '')
          : firstFieldError
      }
      alert.visible = true
    } else {
      alert.message = payload.message || 'Terjadi kesalahan pada sistem.'
      alert.visible = true
    }
    alert.type = 'error'
  } finally {
    loading.value = false
  }
}
</script>
