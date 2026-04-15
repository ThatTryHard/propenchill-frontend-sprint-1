<script setup lang="ts">
import { ref, watch } from 'vue'
import VModal from '@/components/common/VModal.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'

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
    <div class="mt-4 w-full">
      <VTextareaField
        :modelValue="notes"
        label="Alasan Penolakan"
        placeholder="Contoh: Dokumen pendukung belum lengkap."
        :rows="5"
        :state="localError ? 'error' : 'default'"
        :message="localError"
        @update:modelValue="notes = String($event || '')"
      />

      <div class="mt-5 flex items-center justify-end gap-3">
        <button
          type="button"
          class="rounded-[14px] border border-[#d1d5db] px-5 py-2 text-sm font-semibold text-[#374151] hover:bg-[#f3f4f6]"
          :disabled="loading"
          @click="handleClose"
        >
          Batal
        </button>

        <button
          type="button"
          class="rounded-[14px] bg-[#A0453B] px-5 py-2 text-sm font-semibold text-white hover:bg-[#8b3e37] disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="loading"
          @click="handleSubmit"
        >
          {{ loading ? 'Memproses...' : 'Kirim Penolakan' }}
        </button>
      </div>
    </div>
  </VModal>
</template>
