<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Edit, X } from 'lucide-vue-next'
import { useParentStore } from '@/stores/parents'
import { parseFieldErrors } from '@/lib/fieldErrors'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'

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
  alamat: '',
})

const submitError = ref('')
const isSubmitting = ref(false)
const isFetching = ref(false)

const toDateInputValue = (value: string | null | undefined): string => {
  if (!value) return ''
  if (!value.includes('T')) return value
  const [dateOnly] = value.split('T')
  return dateOnly || ''
}

const closeModal = () => {
  emit('update:isOpen', false)
}

const resetErrors = () => {
  errors.nama = ''
  errors.email = ''
  errors.no_hp = ''
  errors.alamat = ''
  submitError.value = ''
}

const validateForm = () => {
  resetErrors()
  let isValid = true

  if (!form.nama.trim()) {
    errors.nama = 'Nama wajib diisi!'
    isValid = false
  }

  if (!form.email.trim()) {
    errors.email = 'Email wajib diisi!'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Format email tidak valid!'
    isValid = false
  }

  if (!form.no_hp.trim()) {
    errors.no_hp = 'Nomor HP wajib diisi!'
    isValid = false
  } else if (!/^(\+62|62|0)8[1-9][0-9]{7,11}$/.test(form.no_hp)) {
    errors.no_hp =
      'Format nomor HP tidak valid. Gunakan format Indonesia (contoh: 08123456789 atau +628123456789).'
    isValid = false
  }

  return isValid
}

const loadParentData = async () => {
  if (!props.parentId) return

  resetErrors()
  isFetching.value = true

  try {
    const parent = await store.fetchParentById(props.parentId)

    form.nama = parent.nama || ''
    form.email = parent.email || ''
    form.no_hp = parent.no_hp || parent.no_hp || ''
    form.tanggal_lahir = toDateInputValue(parent.tanggal_lahir)
    form.alamat = parent.alamat || ''
  } catch (error) {
    submitError.value = (error as Error).message
  } finally {
    isFetching.value = false
  }
}

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (!isOpen) return
    await loadParentData()
  },
)

watch(
  () => props.parentId,
  async () => {
    if (!props.isOpen) return
    await loadParentData()
  },
)

const isSubmitDisabled = computed(() => isSubmitting.value || isFetching.value)

const handleSubmit = async () => {
  if (!props.parentId || !validateForm()) return

  isSubmitting.value = true
  submitError.value = ''

  try {
    const body: Record<string, string> = {
      nama: form.nama.trim(),
      email: form.email.trim(),
      no_hp: form.no_hp.trim(),
    }

    if (form.tanggal_lahir) body.tanggal_lahir = form.tanggal_lahir
    if (form.alamat.trim()) body.alamat = form.alamat.trim()

    const data = await store.updateParent(props.parentId, body)

    emit('updated', data.message || 'Data wali murid berhasil diperbarui.')
    closeModal()
  } catch (error) {
    const parsed = parseFieldErrors(error, {
      nama: ['nama', 'name'],
      email: ['email'],
      no_hp: ['no_hp', 'nomor_hp', 'nomor hp', 'phone'],
      alamat: ['alamat', 'address'],
    })

    errors.nama = parsed.fieldErrors.nama || ''
    errors.email = parsed.fieldErrors.email || ''
    errors.no_hp = parsed.fieldErrors.no_hp || ''
    errors.alamat = parsed.fieldErrors.alamat || ''
    submitError.value = parsed.generalError
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div v-if="isOpen" class="parent-modal relative w-full max-w-[720px]">
            <div class="flex flex-col gap-5">
              <div class="flex justify-end">
                <button type="button" class="modal-close-button" @click="closeModal">
                  <X class="h-5 w-5" />
                </button>
              </div>

              <div class="flex flex-col items-center gap-2 text-center">
                <Edit class="h-12 w-12 text-[var(--app-accent)]" />
                <b class="modal-title text-[1.7rem] leading-[120%]">Edit Wali Murid</b>
              </div>

              <div
                v-if="isFetching"
                class="py-8 text-center text-[1rem] text-[var(--app-muted)]"
              >
                Memuat data...
              </div>

              <div v-else class="flex flex-col gap-4">
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
                  label="Email"
                  type="email"
                  placeholder="nama@email.com"
                  :disabled="isSubmitting"
                  :state="errors.email ? 'error' : 'default'"
                  :message="errors.email"
                />

                <VInputField
                  v-model="form.no_hp"
                  label="Nomor HP"
                  type="text"
                  placeholder="08123456789"
                  :disabled="isSubmitting"
                  :state="errors.no_hp ? 'error' : 'default'"
                  :message="errors.no_hp"
                />

                <VInputField
                  v-model="form.tanggal_lahir"
                  label="Tanggal Lahir"
                  type="date"
                  placeholder="Pilih tanggal lahir"
                  :disabled="isSubmitting"
                />

                <VTextareaField
                  v-model="form.alamat"
                  label="Alamat"
                  placeholder="Masukkan alamat"
                  :rows="3"
                  :disabled="isSubmitting"
                  :state="errors.alamat ? 'error' : 'default'"
                  :message="errors.alamat"
                />

                <p v-if="submitError" class="text-[0.93rem] font-medium text-[var(--app-danger)]">
                  {{ submitError }}
                </p>
              </div>

              <div class="flex items-center justify-end gap-2">
                <VButton
                  variant="secondary"
                  class="!w-[132px]"
                  :disabled="isSubmitDisabled"
                  @click="closeModal"
                >
                  Batal
                </VButton>

                <VButton
                  variant="primary"
                  class="!w-[132px]"
                  :disabled="isSubmitDisabled"
                  @click="handleSubmit"
                >
                  {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
                </VButton>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.parent-modal {
  overflow: visible;
  border: 0.5px solid var(--app-modal-border);
  border-radius: 24px;
  background: var(--app-modal-bg);
  color: var(--app-modal-text);
  padding: 28px 32px;
  box-shadow:
    0px -2px 4px rgba(0, 0, 0, 0.2),
    0px 2px 4px rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
}

.modal-close-button {
  color: var(--app-modal-text);
  transition:
    opacity 0.2s ease,
    color 0.2s ease;
}

.modal-close-button:hover {
  opacity: 0.7;
}

.modal-title {
  color: var(--app-modal-text);
}
</style>
