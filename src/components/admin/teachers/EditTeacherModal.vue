<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Edit } from 'lucide-vue-next'
import { useTeacherStore, validateTeacherForm } from '@/stores/teacher'
import { parseFieldErrors } from '@/lib/fieldErrors'

import VModal from '@/components/common/VModal.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VAlert from '@/components/common/VAlert.vue'

const props = defineProps<{
  isOpen: boolean
  teacherId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'updated', message: string): void
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

const isSubmitting = ref(false)
const isFetching = ref(false)
const submitError = ref('')

const jabatanOptions = [
  { label: 'Kepala Sekolah', value: 'Kepala Sekolah' },
  { label: 'Wakil Bidang Akademik', value: 'Wakil Bidang Akademik' },
  { label: 'Wakil Bidang Kesiswaan', value: 'Wakil Bidang Kesiswaan' },
  { label: 'Wakil Bidang Agama', value: 'Wakil Bidang Agama' },
  { label: 'Guru', value: 'Guru' },
]

const closeModal = () => {
  emit('update:isOpen', false)
}

const handleModalVisibilityChange = (value: boolean) => {
  emit('update:isOpen', value)
}

const resetErrors = () => {
  errors.nama = ''
  errors.email = ''
  errors.niy = ''
  errors.jabatan = ''
  submitError.value = ''
}

const resetForm = () => {
  form.nama = ''
  form.email = ''
  form.niy = ''
  form.jabatan = ''
}

const loadTeacher = async () => {
  if (!props.teacherId) return

  isFetching.value = true
  resetErrors()

  try {
    const teacher = await store.fetchTeacherById(props.teacherId)

    form.nama = teacher.nama || ''
    form.email = teacher.email || ''
    form.niy = teacher.niy || ''
    form.jabatan = teacher.jabatan || ''
  } catch (error: unknown) {
    submitError.value =
      error instanceof Error ? error.message : 'Gagal memuat data guru.'
  } finally {
    isFetching.value = false
  }
}

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      await loadTeacher()
      return
    }

    resetForm()
    resetErrors()
  },
)

watch(
  () => props.teacherId,
  async () => {
    if (props.isOpen) {
      await loadTeacher()
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

const validateForm = () => {
  const validationErrors = validateTeacherForm(form)

  errors.nama = validationErrors.nama || ''
  errors.email = validationErrors.email || ''
  errors.niy = validationErrors.niy || ''
  errors.jabatan = validationErrors.jabatan || ''

  return Object.keys(validationErrors).length === 0
}

const isSubmitDisabled = computed(() => {
  return isSubmitting.value || isFetching.value
})

const handleSubmit = async () => {
  if (!props.teacherId || !validateForm()) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    await store.updateTeacher(props.teacherId, {
      nama: form.nama.trim(),
      email: form.email.trim(),
      niy: form.niy.trim(),
      jabatan: form.jabatan,
    })

    emit('updated', 'Data guru berhasil diperbarui.')
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
      'Gagal memperbarui data guru.',
    )

    errors.nama = parsed.fieldErrors.nama || ''
    errors.email = parsed.fieldErrors.email || ''
    errors.niy = parsed.fieldErrors.niy || ''
    errors.jabatan = parsed.fieldErrors.jabatan || ''
    submitError.value = parsed.generalError
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <VModal
    :is-open="isOpen"
    title="Edit Guru"
    max-width-class="max-w-[460px]"
    :buttons="[]"
    @update:is-open="handleModalVisibilityChange"
  >
    <div class="edit-teacher-modal-body">
      <div
        v-if="isFetching"
        class="edit-teacher-loading"
      >
        Memuat data...
      </div>

      <form
        v-else
        class="edit-teacher-form"
        @submit.prevent="handleSubmit"
      >
        <VAlert
          v-if="submitError"
          :visible="Boolean(submitError)"
          type="error"
          title="Gagal"
          :message="submitError"
          @close="submitError = ''"
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

        <div class="edit-teacher-field">
          <label class="edit-teacher-label">
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
            class="edit-teacher-error"
          >
            {{ errors.jabatan }}
          </p>
        </div>

        <div class="edit-teacher-actions">
          <VButton
            type="button"
            variant="secondary"
            :disabled="isSubmitDisabled"
            @click="closeModal"
          >
            Batal
          </VButton>

          <VButton
            type="submit"
            variant="primary"
            :disabled="isSubmitDisabled"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
          </VButton>
        </div>
      </form>
    </div>
  </VModal>
</template>

<style scoped>
.edit-teacher-modal-body {
  width: 100%;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  color: var(--app-text);
  font-family: var(--font-sans);
}

.edit-teacher-modal-body::-webkit-scrollbar {
  width: 6px;
}

.edit-teacher-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.edit-teacher-modal-body::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: var(--app-border);
}

.edit-teacher-loading {
  padding: 32px 16px;
  color: var(--app-muted);
  font-size: var(--app-font-sm);
  line-height: 1.5;
  text-align: center;
}

.edit-teacher-form {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 12px;
}

.edit-teacher-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-teacher-label {
  color: var(--app-text);
  font-family: var(--font-sans);
  font-size: var(--app-input-label-font);
  font-weight: 600;
  line-height: 1.2;
}

.edit-teacher-error {
  margin: 0;
  color: var(--app-danger);
  font-size: var(--app-input-helper-font);
  font-weight: 400;
  line-height: 1.5;
}

.edit-teacher-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 4px;
}

@media (max-width: 640px) {
  .edit-teacher-modal-body {
    max-height: calc(100vh - 150px);
  }

  .edit-teacher-actions {
    flex-direction: column-reverse;
  }
}
</style>