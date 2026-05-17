<script setup lang="ts">
import { ref, watch } from 'vue'
import VModal from '@/components/common/VModal.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'
import VButton from '@/components/common/VButton.vue'

const props = defineProps<{
  isOpen: boolean
  loading?: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'submit', notes: string): void
}>()

const notes = ref('')
const localError = ref('')

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      localError.value = ''
      notes.value = ''
    }
  },
)

watch(
  () => props.errorMessage,
  (nextValue) => {
    if (nextValue) {
      localError.value = nextValue
    }
  },
)

function handleClose() {
  emit('update:isOpen', false)
}

function handleSubmit() {
  const trimmed = notes.value.trim()

  if (!trimmed) {
    localError.value = 'Alasan penolakan wajib diisi.'
    return
  }

  localError.value = ''
  emit('submit', trimmed)
}
</script>

<template>
  <VModal
    :isOpen="isOpen"
    title="Tolak Pengajuan Surat"
    description="Tulis alasan penolakan. Catatan ini wajib untuk proses verifikasi level berikutnya."
    :buttons="[]"
    maxWidthClass="max-w-[560px]"
    @update:isOpen="handleClose"
  >
    <div
      class="
        mt-4 w-full
        font-[var(--font-sans)] text-[var(--app-text)]
      "
    >
      <VTextareaField
        :modelValue="notes"
        label="Alasan Penolakan"
        placeholder="Contoh: Dokumen pendukung belum lengkap."
        :rows="5"
        :state="localError ? 'error' : 'default'"
        :message="localError"
        :disabled="loading"
        @update:modelValue="notes = String($event || '')"
      />

      <div
        class="
          mt-5 flex items-center justify-end gap-3
          max-[640px]:flex-col max-[640px]:items-stretch
        "
      >
        <VButton
          variant="secondary"
          class="min-w-[104px]"
          :disabled="loading"
          @click="handleClose"
        >
          Batal
        </VButton>

        <VButton
          variant="primary"
          class="min-w-[150px]"
          :disabled="loading"
          @click="handleSubmit"
        >
          {{ loading ? 'Memproses...' : 'Kirim Penolakan' }}
        </VButton>
      </div>
    </div>
  </VModal>
</template>