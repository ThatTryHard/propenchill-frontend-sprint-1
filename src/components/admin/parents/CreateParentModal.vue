<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useParentStore, validateParentForm } from '@/stores/parents'
import { parseFieldErrors } from '@/lib/fieldErrors'

import VModal from '@/components/common/VModal.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'
import VAlert from '@/components/common/VAlert.vue'

type AlertType = 'success' | 'error' | 'warning' | 'information'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'created', message: string): void
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

const isSubmitting = ref(false)

const resetForm = () => {
  form.nama = ''
  form.email = ''
  form.no_hp = ''
  form.tanggal_lahir = ''
  form.alamat = ''

  errors.nama = ''
  errors.email = ''
  errors.no_hp = ''

  alert.visible = false
  alert.type = 'error'
  alert.title = ''
  alert.message = ''
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) resetForm()
  },
)

const closeModal = () => {
  if (isSubmitting.value) return
  emit('update:isOpen', false)
}

const validateForm = () => {
  const result = validateParentForm(form)

  errors.nama = result.nama || ''
  errors.email = result.email || ''
  errors.no_hp = result.no_hp || ''

  return Object.keys(result).length === 0
}

const isSubmitDisabled = computed(() => isSubmitting.value)

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  alert.visible = false

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

    const data = await store.createParent(body)

    emit('created', data.message || 'Akun wali murid berhasil dibuat.')
    closeModal()
  } catch (error) {
    const parsed = parseFieldErrors(error, {
      nama: ['nama', 'name'],
      email: ['email'],
      no_hp: ['no_hp', 'nomor_hp', 'nomor hp', 'phone'],
    })

    errors.nama = parsed.fieldErrors.nama || ''
    errors.email = parsed.fieldErrors.email || ''
    errors.no_hp = parsed.fieldErrors.no_hp || ''

    alert.visible = true
    alert.type = 'error'
    alert.title = 'Gagal Menambah Wali Murid'
    alert.message = parsed.generalError || 'Akun wali murid gagal dibuat.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <VModal
    :is-open="isOpen"
    title="Tambah Wali Murid"
    max-width-class="max-w-[460px]"
    :buttons="[]"
    @update:is-open="emit('update:isOpen', $event)"
  >
    <!-- Scrollable body — mirrors EditParentModal layout -->
    <div
      class="
        flex w-full flex-col text-left
        font-[var(--font-sans)] text-[var(--app-text)]
        max-h-[75vh] overflow-y-auto px-1
        scrollbar-thin scrollbar-thumb-[var(--app-border)] scrollbar-track-transparent
      "
    >
      <form class="flex w-full flex-col gap-4 pb-2" @submit.prevent="handleSubmit">
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
          label="Email"
          type="email"
          placeholder="Masukkan email"
          :disabled="isSubmitting"
          :state="errors.email ? 'error' : 'default'"
          :message="errors.email"
        />

        <VInputField
          v-model="form.no_hp"
          label="Nomor HP"
          type="text"
          placeholder="Masukkan nomor HP"
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
          :disabled="isSubmitting"
          :rows="2"
        />

        <!-- Action buttons -->
        <div
          class="
            flex items-center justify-end gap-3 mt-2
            max-[640px]:flex-col-reverse max-[640px]:items-stretch
          "
        >
          <VButton
            type="button"
            variant="secondary"
            class="min-w-[110px]"
            :disabled="isSubmitting"
            @click="closeModal"
          >
            Batal
          </VButton>

          <VButton
            type="submit"
            variant="primary"
            class="min-w-[110px]"
            :disabled="isSubmitDisabled"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'Tambah' }}
          </VButton>
        </div>
      </form>
    </div>
  </VModal>
</template>
