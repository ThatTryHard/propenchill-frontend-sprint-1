<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Edit, PlusCircle } from 'lucide-vue-next'
import VModal from '@/components/common/VModal.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import { parseFieldErrors } from '@/lib/fieldErrors'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    isEdit: boolean
    loading: boolean
    errorMessage?: string
    initialForm?: { nama: string; email: string; role: string }
  }>(),
  {
    errorMessage: '',
    initialForm: () => ({ nama: '', email: '', role: 'ADMIN' }),
  },
)

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'submit', payload: { nama: string; email: string; role: string }): void
}>()

const form = reactive({ nama: '', email: '', role: 'ADMIN' })
const errors = reactive({ nama: '', email: '' })
const submitError = ref('')

const roleOptions = [
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'BIDANG AGAMA', value: 'BIDANG_AGAMA' },
  { label: 'BIDANG KESISWAAN', value: 'BIDANG_KESISWAAN' },
  { label: 'BIDANG AKADEMIK', value: 'BIDANG_AKADEMIK' },
  { label: 'KEPALA SEKOLAH', value: 'KEPSEK' },
]

watch(
  () => [props.isOpen, props.initialForm],
  ([isOpen]) => {
    if (!isOpen) return

    form.nama = props.initialForm.nama || ''
    form.email = props.initialForm.email || ''
    form.role = props.initialForm.role || 'ADMIN'
    errors.nama = ''
    errors.email = ''
    submitError.value = ''
  },
  { deep: true },
)

watch(
  () => props.errorMessage,
  (value) => {
    if (!props.isOpen || !value) return

    const parsed = parseFieldErrors(value, {
      nama: ['nama', 'name'],
      email: ['email'],
    })

    if (parsed.fieldErrors.nama) errors.nama = parsed.fieldErrors.nama
    if (parsed.fieldErrors.email) errors.email = parsed.fieldErrors.email
    submitError.value = parsed.generalError
  },
)

const closeModal = () => emit('update:isOpen', false)

const validateForm = () => {
  errors.nama = ''
  errors.email = ''
  submitError.value = ''

  let isValid = true

  if (!form.nama.trim()) {
    errors.nama = 'Nama wajib diisi!'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Email wajib diisi!'
    isValid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (form.email.trim() && !emailRegex.test(form.email)) {
    errors.email = 'Format email tidak valid! (contoh: user@mail.com)'
    isValid = false
  }

  return isValid
}

const isSubmitDisabled = computed(() => props.loading)

const handleSubmit = () => {
  if (!validateForm()) return

  emit('submit', {
    nama: form.nama.trim(),
    email: form.email.trim(),
    role: form.role,
  })
}

const handleModalVisibilityChange = (value: boolean) => {
  emit('update:isOpen', value)
}

const modalButtons = computed(
  (): Array<{
    label: string
    variant: 'primary' | 'secondary'
    action: () => void
    disabled?: boolean
  }> => [
    {
      label: 'Batal',
      variant: 'secondary',
      disabled: props.loading,
      action: closeModal,
    },
    {
      label: props.loading ? 'Menyimpan...' : props.isEdit ? 'Simpan' : 'Tambah',
      variant: 'primary',
      disabled: isSubmitDisabled.value,
      action: handleSubmit,
    },
  ],
)
</script>

<template>
  <VModal
    :is-open="isOpen"
    :title="isEdit ? 'Edit Staff' : 'Tambah Staff'"
    :description="
      isEdit
        ? 'Perbarui data akun staff agar informasi tetap akurat.'
        : 'Tambahkan akun staff baru untuk mengelola sistem.'
    "
    max-width-class="max-w-[643px]"
    :buttons="modalButtons"
    @update:is-open="handleModalVisibilityChange"
  >
    <template #icon>
      <component
        :is="isEdit ? Edit : PlusCircle"
        class="h-12 w-12 text-[var(--app-accent)]"
      />
    </template>

    <div class="mt-2 flex w-full flex-col gap-4 text-left">
      <VInputField
        v-model="form.nama"
        label="Nama Lengkap"
        type="text"
        placeholder="Masukkan nama lengkap staff"
        :state="errors.nama ? 'error' : 'default'"
        :message="errors.nama"
        :disabled="loading"
      />

      <VInputField
        v-model="form.email"
        label="Alamat Email"
        type="email"
        placeholder="contoh: staff@simp.com"
        :state="errors.email ? 'error' : 'default'"
        :message="errors.email"
        :disabled="loading"
      />

      <div class="flex flex-col gap-2">
        <label
          class="
            text-[length:var(--app-input-label-font)]
            font-semibold leading-[1.2] text-[var(--app-text)]
          "
        >
          Role Akses
        </label>

        <VDropdown
          v-model="form.role"
          :options="roleOptions"
          placeholder="Pilih Role"
          :disabled="loading"
        />
      </div>

      <p
        v-if="submitError"
        class="
          m-0 text-[length:var(--app-font-xs)]
          font-medium leading-[1.5] text-[var(--app-danger)]
        "
      >
        {{ submitError }}
      </p>
    </div>
  </VModal>
</template>
