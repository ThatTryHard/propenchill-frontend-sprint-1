<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { PlusCircle } from 'lucide-vue-next'
import { useTeacherStore, validateTeacherForm } from '@/stores/teacher'
import { parseFieldErrors } from '@/lib/fieldErrors'

import VModal from '@/components/common/VModal.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VAlert from '@/components/common/VAlert.vue'

type AlertType = 'success' | 'error' | 'warning' | 'information'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'created', message: string): void
}>()

const store = useTeacherStore()

const form = reactive({
  nama: '',
  email: '',
  niy: '',
  jabatan: '',
})

const errors = reactive({
  nama: '',
  email: '',
  niy: '',
  jabatan: '',
})

const alert = reactive({
  visible: false,
  type: 'error' as AlertType,
  title: '',
  message: '',
})

const isSubmitting = ref(false)

const jabatanOptions = [
  { label: 'Kepala Sekolah', value: 'Kepala Sekolah' },
  { label: 'Wakil Bidang Akademik', value: 'Wakil Bidang Akademik' },
  { label: 'Wakil Bidang Kesiswaan', value: 'Wakil Bidang Kesiswaan' },
  { label: 'Wakil Bidang Agama', value: 'Wakil Bidang Agama' },
  { label: 'Guru', value: 'Guru' },
]

const resetAlert = () => {
  alert.visible = false
  alert.type = 'error'
  alert.title = ''
  alert.message = ''
}

const resetErrors = () => {
  errors.nama = ''
  errors.email = ''
  errors.niy = ''
  errors.jabatan = ''
}

const resetForm = () => {
  form.nama = ''
  form.email = ''
  form.niy = ''
  form.jabatan = ''

  resetErrors()
  resetAlert()
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      resetForm()
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
  () => form.niy,
  () => {
    errors.niy = ''
  },
)

watch(
  () => form.jabatan,
  () => {
    errors.jabatan = ''
  },
)

const closeModal = () => {
  if (isSubmitting.value) return

  emit('update:isOpen', false)
}

const handleModalVisibilityChange = (value: boolean) => {
  if (!value && isSubmitting.value) return

  emit('update:isOpen', value)
}

const validateForm = () => {
  const validationErrors = validateTeacherForm(form)

  errors.nama = validationErrors.nama || ''
  errors.email = validationErrors.email || ''
  errors.niy = validationErrors.niy || ''
  errors.jabatan = validationErrors.jabatan || ''

  return Object.keys(validationErrors).length === 0
}

const isSubmitDisabled = computed(() => isSubmitting.value)

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  resetAlert()

  try {
    await store.createTeacher({
      nama: form.nama.trim(),
      email: form.email.trim(),
      niy: form.niy.trim(),
      jabatan: form.jabatan,
    })

    emit('created', 'Data guru berhasil didaftarkan.')
    closeModal()
  } catch (error: unknown) {
    const parsed = parseFieldErrors(
      error,
      {
        nama: ['nama', 'name'],
        email: ['email'],
        niy: ['niy'],
        jabatan: ['jabatan', 'role', 'position'],
      },
      'Gagal menyimpan data guru.',
    )

    errors.nama = parsed.fieldErrors.nama || ''
    errors.email = parsed.fieldErrors.email || ''
    errors.niy = parsed.fieldErrors.niy || ''
    errors.jabatan = parsed.fieldErrors.jabatan || ''

    alert.visible = true
    alert.type = 'error'
    alert.title = 'Gagal Menambah Guru'
    alert.message = parsed.generalError || 'Gagal menyimpan data guru.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <VModal
    :is-open="isOpen"
    title="Tambah Guru"
    max-width-class="max-w-[460px]"
    :buttons="[]"
    @update:is-open="handleModalVisibilityChange"
  >
    <div class="create-teacher-modal-body">
      <form
        class="create-teacher-modal-form"
        @submit.prevent="handleSubmit"
      >
        <VAlert
          v-if="alert.visible"
          :visible="alert.visible"
          :type="alert.type"
          :title="alert.title"
          :message="alert.message"
          @close="alert.visible = false"
        />

        <VInputField
          v-model="form.nama"
          label="Nama Lengkap"
          type="text"
          placeholder="Masukkan nama lengkap"
          :disabled="isSubmitting"
          :state="errors.nama ? 'error' : 'default'"
          :message="errors.nama"
        />

        <VInputField
          v-model="form.email"
          label="Alamat Email"
          type="email"
          placeholder="contoh@sekolah.com"
          :disabled="isSubmitting"
          :state="errors.email ? 'error' : 'default'"
          :message="errors.email"
        />

        <VInputField
          v-model="form.niy"
          label="NIY (8 digit)"
          type="text"
          placeholder="Contoh: 12345678"
          :disabled="isSubmitting"
          :state="errors.niy ? 'error' : 'default'"
          :message="errors.niy"
        />

        <div class="create-teacher-field">
          <label class="create-teacher-label">
            Jabatan
          </label>

          <VDropdown
            v-model="form.jabatan"
            :options="jabatanOptions"
            placeholder="Pilih Jabatan"
            :disabled="isSubmitting"
          />

          <p
            v-if="errors.jabatan"
            class="create-teacher-error"
          >
            {{ errors.jabatan }}
          </p>
        </div>

        <div class="create-teacher-modal-actions">
          <VButton
            type="button"
            variant="secondary"
            :disabled="isSubmitting"
            @click="closeModal"
          >
            Batal
          </VButton>

          <VButton
            type="submit"
            variant="primary"
            :disabled="isSubmitDisabled"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'Tambah' }}
          </VButton>
        </div>
      </form>
    </div>
  </VModal>
</template>

<style scoped>
.create-teacher-modal-body {
  width: 100%;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  color: var(--app-text);
  font-family: var(--font-sans);
}

.create-teacher-modal-body::-webkit-scrollbar {
  width: 6px;
}

.create-teacher-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.create-teacher-modal-body::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--app-border);
}

.create-teacher-modal-form {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 12px;
}

.create-teacher-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.create-teacher-label {
  color: var(--app-text);
  font-family: var(--font-sans);
  font-size: var(--app-input-label-font);
  font-weight: 600;
  line-height: 1.2;
}

.create-teacher-error {
  margin: 0;
  color: var(--app-danger);
  font-size: var(--app-input-helper-font);
  font-weight: 400;
  line-height: 1.5;
}

.create-teacher-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

@media (max-width: 640px) {
  .create-teacher-modal-body {
    max-height: calc(100vh - 150px);
  }

  .create-teacher-modal-actions {
    flex-direction: column-reverse;
  }
}
</style>