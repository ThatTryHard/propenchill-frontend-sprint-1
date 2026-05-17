<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useParentStore, validateParentForm } from '@/stores/parents'

import VModal from '@/components/common/VModal.vue'
import VInputField from '@/components/common/VInputField.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'

type AlertType = 'success' | 'error' | 'warning' | 'information'

const props = defineProps<{
  isOpen: boolean
  parentId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'updated', message: string): void
}>()

const store = useParentStore()

const form = reactive({
  nama: '',
  email: '',
  no_hp: '',
  tanggal_lahir: '',
  alamat: '',
})

const errors = reactive({
  nama: '',
  email: '',
  no_hp: '',
})

const alert = reactive({
  visible: false,
  type: 'error' as AlertType,
  title: '',
  message: '',
})

const isFetching = ref(false)
const isLoading = ref(false)

const toDateInputValue = (value: string | null | undefined): string => {
  if (!value) return ''

  return (value.includes('T') ? value.split('T')[0] : value) || ''
}

const resetErrors = () => {
  errors.nama = ''
  errors.email = ''
  errors.no_hp = ''
}

const resetAlert = () => {
  alert.visible = false
  alert.type = 'error'
  alert.title = ''
  alert.message = ''
}

const resetForm = () => {
  form.nama = ''
  form.email = ''
  form.no_hp = ''
  form.tanggal_lahir = ''
  form.alamat = ''
}

const handleModalVisibilityChange = (value: boolean) => {
  if (!value && isLoading.value) return

  emit('update:isOpen', value)

  if (!value) {
    resetErrors()
    resetAlert()
  }
}

const loadParent = async () => {
  if (!props.parentId) return

  isFetching.value = true
  resetErrors()
  resetAlert()

  try {
    const parent = await store.fetchParentById(String(props.parentId))

    form.nama = parent.nama || ''
    form.email = parent.email || ''
    form.no_hp = parent.no_hp || ''
    form.tanggal_lahir = toDateInputValue(parent.tanggal_lahir)
    form.alamat = parent.alamat || ''
  } catch (error) {
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Gagal Memuat Data'
    alert.message = (error as Error).message || 'Data wali murid gagal dimuat.'
  } finally {
    isFetching.value = false
  }
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      loadParent()
      return
    }

    resetForm()
    resetErrors()
    resetAlert()
  },
)

watch(
  () => props.parentId,
  () => {
    if (props.isOpen) {
      loadParent()
    }
  },
)

watch(
  () => form.nama,
  () => {
    errors.nama = ''
  },
)

watch(
  () => form.email,
  () => {
    errors.email = ''
  },
)

watch(
  () => form.no_hp,
  () => {
    errors.no_hp = ''
  },
)

const validateForm = () => {
  const result = validateParentForm(form)

  errors.nama = result.nama || ''
  errors.email = result.email || ''
  errors.no_hp = result.no_hp || ''

  return Object.keys(result).length === 0
}

const closeModal = () => {
  handleModalVisibilityChange(false)
}

const handleSubmit = async () => {
  if (!props.parentId || isLoading.value) return
  if (!validateForm()) return

  isLoading.value = true
  resetAlert()

  try {
    const body: Record<string, string> = {
      nama: form.nama.trim(),
      email: form.email.trim(),
      no_hp: form.no_hp.trim(),
    }

    if (form.tanggal_lahir) {
      body.tanggal_lahir = form.tanggal_lahir
    }

    if (form.alamat.trim()) {
      body.alamat = form.alamat.trim()
    }

    const data = await store.updateParent(String(props.parentId), body)

    emit('updated', data.message || 'Data wali murid berhasil diperbarui.')
    emit('update:isOpen', false)
  } catch (error) {
    alert.visible = true
    alert.type = 'error'
    alert.title = 'Gagal Memperbarui Data'
    alert.message = (error as Error).message || 'Data wali murid gagal diperbarui.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <VModal
    :is-open="isOpen"
    title="Edit Wali Murid"
    max-width-class="max-w-[460px]"
    :buttons="[]"
    @update:is-open="handleModalVisibilityChange"
  >
    <div class="parent-modal-body">
      <div
        v-if="isFetching"
        class="parent-modal-loading"
      >
        Memuat data...
      </div>

      <form
        v-else
        class="parent-modal-form"
        @submit.prevent="handleSubmit"
      >
        <VAlert
          v-if="alert.visible"
          :visible="alert.visible"
          :type="alert.type"
          :title="alert.title"
          :message="alert.message"
          class="parent-modal-alert"
          @close="alert.visible = false"
        />

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
          placeholder="Masukkan email"
          :disabled="isLoading"
          :state="errors.email ? 'error' : 'default'"
          :message="errors.email"
        />

        <VInputField
          v-model="form.no_hp"
          label="Nomor HP"
          placeholder="Masukkan nomor HP"
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

        <VTextareaField
          v-model="form.alamat"
          label="Alamat"
          placeholder="Masukkan alamat"
          :disabled="isLoading"
          :rows="2"
        />

        <div class="parent-modal-actions">
          <VButton
            type="button"
            variant="secondary"
            class="parent-modal-button"
            :disabled="isLoading"
            @click="closeModal"
          >
            Batal
          </VButton>

          <VButton
            type="submit"
            variant="primary"
            class="parent-modal-button"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Menyimpan...' : 'Simpan' }}
          </VButton>
        </div>
      </form>
    </div>
  </VModal>
</template>

<style scoped>
.parent-modal-body {
  width: 100%;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  padding: 0 2px 2px;
  color: var(--app-text);
  font-family: var(--font-sans);
  text-align: left;
}

.parent-modal-body::-webkit-scrollbar {
  width: 6px;
}

.parent-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.parent-modal-body::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--app-border);
}

.parent-modal-subtitle {
  margin: -2px 0 12px;
  color: var(--app-subtext);
  font-size: var(--app-modal-desc-font);
  line-height: 1.4;
  text-align: center;
}

.parent-modal-loading {
  padding: 28px 12px;
  color: var(--app-muted);
  font-size: var(--app-font-sm);
  line-height: 1.5;
  text-align: center;
}

.parent-modal-form {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 9px;
}

.parent-modal-alert {
  margin-bottom: 2px;
}

.parent-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.parent-modal-button {
  min-width: 108px;
  min-height: 38px;
}

.parent-modal :deep(.flex.flex-col.gap-2) {
  gap: 5px;
}

.parent-modal :deep(label) {
  font-size: var(--app-input-label-font);
  line-height: 1.2;
}

.parent-modal :deep(input) {
  min-height: 38px;
  padding-top: 8px;
  padding-bottom: 8px;
  font-size: var(--app-input-font);
}

.parent-modal :deep(textarea) {
  min-height: 70px;
  max-height: 100px;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: var(--app-input-font);
  resize: vertical;
}

@media (max-width: 640px) {
  .parent-modal-body {
    max-height: calc(100vh - 150px);
  }

  .parent-modal-actions {
    flex-direction: column-reverse;
  }

  .parent-modal-button {
    width: 100%;
    min-width: 0;
  }
}
</style>