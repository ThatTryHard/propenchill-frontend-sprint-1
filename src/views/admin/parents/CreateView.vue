<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>
    <div class="p-8 flex flex-col gap-8 h-full font-sans bg-[#f8fafc]">
      <!-- Header -->
      <div class="flex flex-col gap-4">
        <button
          @click="$router.push('/admin/parents')"
          class="flex items-center gap-2 text-[#718096] hover:text-[#1a202c] transition-colors"
        >
          <ArrowLeft :size="18" />
          <span class="text-sm">Kembali</span>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-[#1a202c]">Tambah Wali Murid</h1>
          <p class="text-[#718096] text-sm mt-1">Buat akun baru untuk wali murid</p>
        </div>
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

      <!-- Form Card -->
      <div class="bg-white p-8 rounded-2xl border border-[#e2e8f0] shadow-sm max-w-4xl">
        <div class="flex flex-col gap-6">
          <VInputField
            v-model="form.nama"
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            :disabled="isLoading"
            :state="errors.nama ? 'error' : 'default'"
            :message="errors.nama"
          />

          <VInputField
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="nama@email.com"
            :disabled="isLoading"
            :state="errors.email ? 'error' : 'default'"
            :message="errors.email"
          />

          <VInputField
            v-model="form.no_hp"
            label="Nomor HP"
            placeholder="08123456789"
            :disabled="isLoading"
            :state="errors.no_hp ? 'error' : 'default'"
            :message="errors.no_hp"
          />

          <VInputField
            v-model="form.tanggal_lahir"
            label="Tanggal Lahir"
            type="date"
            :disabled="isLoading"
          />

          <VInputField
            v-model="form.alamat"
            label="Alamat"
            placeholder="Masukkan alamat"
            :disabled="isLoading"
          />

          <div class="flex gap-4 mt-4">
            <VButton
              variant="tertiary"
              class="px-8"
              @click="$router.push('/admin/parents')"
              :disabled="isLoading"
            >
              Batal
            </VButton>
            <VButton
              variant="primary"
              class="px-8"
              :disabled="isLoading"
              @click="openConfirmModal"
            >
              {{ isLoading ? 'Memproses...' : 'Simpan' }}
            </VButton>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <!-- <VModal
        :show="showConfirm"
        title="Tambah Wali Murid"
        description="Apakah Anda yakin ingin menambahkan akun wali murid baru?"
        confirmText="Simpan"
        cancelText="Batal"
        :loading="isLoading"
        @close="showConfirm = false"
        @confirm="handleSubmit"
      /> -->
      <VModal
        v-model:is-open="showConfirm"
        title="Tambah Wali Murid"
        description="Apakah Anda yakin ingin menambahkan akun wali murid baru?"
        :buttons="modalButtons"
      >
        <template #icon>
          <UserPlus class="w-10 h-10 text-[#3f9760]" />
        </template>
      </VModal>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, UserPlus } from 'lucide-vue-next'
import { useParentStore, validateParentForm } from '@/stores/parents'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VModal from '@/components/common/VModal.vue'
import VAlert from '@/components/common/VAlert.vue'

const store = useParentStore()
const router = useRouter()

const form = reactive({ nama: '', email: '', no_hp: '', tanggal_lahir: '', alamat: '' })
const errors = reactive({ nama: '', email: '', no_hp: '' })
const isLoading = ref(false)
const showConfirm = ref(false)

const alert = reactive({ visible: false, type: 'error' as string, title: '', message: '' })

// Clear errors on input
watch(() => form.nama, () => (errors.nama = ''))
watch(() => form.email, () => (errors.email = ''))
watch(() => form.no_hp, () => (errors.no_hp = ''))

const openConfirmModal = () => {
  const result = validateParentForm(form)
  errors.nama = result.nama || ''
  errors.email = result.email || ''
  errors.no_hp = result.no_hp || ''
  if (Object.keys(result).length > 0) return
  showConfirm.value = true
}

const modalButtons = computed(
  (): Array<{ label: string; variant: 'primary' | 'secondary'; action: () => void }> => [
    {
      label: isLoading.value ? 'Memproses...' : 'Simpan',
      variant: 'primary',
      action: () => {
        if (!isLoading.value) handleSubmit()
      },
    },
    {
      label: 'Batal',
      variant: 'secondary',
      action: () => {
        showConfirm.value = false
      },
    },
  ],
)

const handleSubmit = async () => {
  isLoading.value = true
  try {
    const body: Record<string, string> = {
      nama: form.nama.trim(),
      email: form.email.trim(),
      no_hp: form.no_hp.trim(),
    }
    if (form.tanggal_lahir) body.tanggal_lahir = form.tanggal_lahir
    if (form.alamat.trim()) body.alamat = form.alamat.trim()

    const data = await store.createParent(body)
    showConfirm.value = false
    router.push({
      path: '/admin/parents',
      query: { success: data.message || 'Akun wali murid berhasil dibuat.' },
    })
  } catch (error) {
    showConfirm.value = false
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Error Alert'
    alert.message = (error as Error).message
  } finally {
    isLoading.value = false
  }
}
</script>
