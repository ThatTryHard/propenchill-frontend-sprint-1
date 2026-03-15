<template>
  <DashboardLayout>
    <template #sidebar>
      <AdminSidebar />
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
          <h1 class="text-2xl font-bold text-[#1a202c]">Edit Wali Murid</h1>
          <p class="text-[#718096] text-sm mt-1">Perbarui data akun wali murid</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isFetching" class="text-[#718096] py-12 text-center">Memuat data...</div>

      <template v-else>
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

            <div class="flex justify-between mt-4">
              <VButton
                variant="tertiary"
                :disabled="isLoading"
                @click="openDeleteModal"
              >
                <template #leftIcon><Trash2 :size="18" /></template>
                Hapus
              </VButton>
              <VButton
                variant="primary"
                class="px-8"
                :disabled="isLoading"
                @click="openUpdateModal"
              >
                {{ isLoading ? 'Memproses...' : 'Simpan Perubahan' }}
              </VButton>
            </div>
          </div>
        </div>
      </template>

      <!-- Update Modal -->
      <!-- <VModal
        :show="updateModal.show"
        title="Perbarui Wali Murid"
        description="Apakah Anda yakin ingin menyimpan perubahan data wali murid ini?"
        confirmText="Simpan"
        cancelText="Batal"
        :loading="isLoading"
        @close="updateModal.show = false"
        @confirm="handleUpdate"
      /> -->
      <VModal
        v-model:is-open="updateModal.show"
        title="Perbarui Wali Murid"
        description="Apakah Anda yakin ingin menyimpan perubahan data wali murid ini?"
        :buttons="updateButtons"
      >
        <template #icon>
          <UserCheck class="w-10 h-10 text-[#3f9760]" />
        </template>
      </VModal>
      <!-- Delete Modal -->
      <!-- <VModal
        :show="deleteModal.show"
        icon="delete"
        title="Hapus Wali Murid"
        :description="`Apakah Anda yakin ingin menghapus akun ${form.nama}? Tindakan ini tidak dapat dibatalkan.`"
        confirmText="Hapus"
        cancelText="Batal"
        :loading="deleteModal.loading"
        @close="deleteModal.show = false"
        @confirm="handleDelete"
      /> -->

      <VModal
        v-model:is-open="deleteModal.show"
        title="Hapus Wali Murid"
        :description="`Apakah Anda yakin ingin menghapus akun ${form.nama}? Tindakan ini tidak dapat dibatalkan.`"
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
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Trash2, UserCheck } from 'lucide-vue-next'
import { useParentStore, validateParentForm } from '@/stores/parents'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VModal from '@/components/common/VModal.vue'
import VAlert from '@/components/common/VAlert.vue'

const store = useParentStore()
const router = useRouter()
const route = useRoute()
const parentId = route.params.id as string

const form = reactive({ nama: '', email: '', no_hp: '', tanggal_lahir: '', alamat: '' })
const errors = reactive({ nama: '', email: '', no_hp: '' })
const isFetching = ref(true)
const isLoading = ref(false)

const alert = reactive({ visible: false, type: 'error' as string, title: '', message: '' })
const updateModal = reactive({ show: false })
const deleteModal = reactive({ show: false, loading: false })

const toDateInputValue = (value: string | null | undefined): string => {
  if (!value) return ''
  return value.includes('T') ? value.split('T')[0] : value
}

// Clear errors on input
watch(() => form.nama, () => (errors.nama = ''))
watch(() => form.email, () => (errors.email = ''))
watch(() => form.no_hp, () => (errors.no_hp = ''))

onMounted(async () => {
  try {
    const parent = await store.fetchParentById(parentId)
    form.nama = parent.nama || ''
    form.email = parent.email || ''
    form.no_hp = parent.no_hp || ''
    form.tanggal_lahir = toDateInputValue(parent.tanggal_lahir)
    form.alamat = parent.alamat || ''
  } catch (error) {
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Error Alert'
    alert.message = (error as Error).message
  } finally {
    isFetching.value = false
  }
})

const openUpdateModal = () => {
  const result = validateParentForm(form)
  errors.nama = result.nama || ''
  errors.email = result.email || ''
  errors.no_hp = result.no_hp || ''
  if (Object.keys(result).length > 0) return
  updateModal.show = true
}

const updateButtons = computed(
  (): Array<{ label: string; variant: 'primary' | 'secondary'; action: () => void }> => [
  {
    label: isLoading.value ? 'Memproses...' : 'Simpan',
    variant: 'primary',
    action: () => {
      if (!isLoading.value) handleUpdate()
    }
  },
  {
    label: 'Batal',
    variant: 'secondary',
    action: () => {
      updateModal.show = false
    }
  }
])

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

const openDeleteModal = () => {
  deleteModal.show = true
}

const handleUpdate = async () => {
  isLoading.value = true
  try {
    const body: Record<string, string> = {
      nama: form.nama.trim(),
      email: form.email.trim(),
      no_hp: form.no_hp.trim(),
    }
    if (form.tanggal_lahir) body.tanggal_lahir = form.tanggal_lahir
    if (form.alamat.trim()) body.alamat = form.alamat.trim()

    const data = await store.updateParent(parentId, body)
    updateModal.show = false
    router.push({
      path: '/admin/parents',
      query: { success: data.message || 'Data wali murid berhasil diperbarui.' },
    })
  } catch (error) {
    updateModal.show = false
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Error Alert'
    alert.message = (error as Error).message
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async () => {
  deleteModal.loading = true
  try {
    const data = await store.deleteParent(parentId)
    deleteModal.show = false
    router.push({
      path: '/admin/parents',
      query: { success: data.message || 'Akun wali murid berhasil dihapus.' },
    })
  } catch (error) {
    deleteModal.show = false
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Error Alert'
    alert.message = (error as Error).message
  } finally {
    deleteModal.loading = false
  }
}
</script>
