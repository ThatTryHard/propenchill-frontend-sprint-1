<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { LockIcon } from 'lucide-vue-next'
import VModal from '@/components/common/VModal.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VButton from '@/components/common/VButton.vue'

const props = defineProps<{
  isOpen: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'submit', payload: { target_role: string; sifat: string; instruksi: string }): void
}>()

const form = reactive({
  target_role: 'KEPSEK',
  sifat: 'Biasa',
  instruksi: '',
})

const errorMsg = ref('')

const sifatOptions = [
  { label: 'Biasa', value: 'Biasa' },
  { label: 'Penting', value: 'Penting' },
]

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      form.target_role = 'KEPSEK'
      form.sifat = 'Biasa'
      form.instruksi = ''
      errorMsg.value = ''
    }
  },
)

function handleClose() {
  emit('update:isOpen', false)
}

function handleSubmit() {
  if (!form.instruksi.trim()) {
    errorMsg.value = 'Instruksi / catatan telaah wajib diisi!'
    return
  }

  errorMsg.value = ''
  emit('submit', { ...form })
}
</script>

<template>
  <VModal
    :isOpen="isOpen"
    title="Tindak Lanjut Surat"
    description="Teruskan surat ini ke Kepala Sekolah beserta instruksi/catatan telaah Anda."
    :buttons="[]"
    maxWidthClass="max-w-[560px]"
    @update:isOpen="handleClose"
  >
    <div class="mt-4 flex w-full flex-col gap-5 text-left">
      <div class="flex flex-col gap-2 font-sans">
        <label class="text-[1rem] font-semibold text-[var(--app-heading)]">
          Teruskan Kepada
        </label>

        <div
          class="flex w-full items-center justify-between rounded-[12px] border px-[19px] py-[14px] text-[1rem] font-semibold"
          style="
            background: var(--app-input-disabled-bg);
            border-color: var(--app-input-border);
            color: var(--app-muted);
          "
        >
          <span>Kepala Sekolah</span>
          <LockIcon class="h-5 w-5 opacity-50" />
        </div>
      </div>

      <div class="relative z-20 flex flex-col gap-2 font-sans">
        <label class="text-[1rem] font-semibold text-[var(--app-heading)]">
          Sifat Disposisi
        </label>

        <VDropdown
          v-model="form.sifat"
          :options="sifatOptions"
          placeholder="Pilih Sifat Disposisi"
          :disabled="loading"
        />
      </div>

      <div class="relative z-10">
        <VTextareaField
          :modelValue="form.instruksi"
          label="Instruksi / Catatan Telaah"
          placeholder="Contoh: Mohon untuk ditindaklanjuti terkait permohonan ini."
          :rows="4"
          :state="errorMsg ? 'error' : 'default'"
          :message="errorMsg"
          :disabled="loading"
          @update:modelValue="form.instruksi = String($event || '')"
        />
      </div>

      <div class="relative z-10 mt-2 flex items-center justify-end gap-3">
        <VButton
          variant="secondary"
          class="!w-[132px]"
          :disabled="loading"
          @click="handleClose"
        >
          Batal
        </VButton>

        <VButton
          variant="primary"
          class="!w-[190px]"
          :disabled="loading"
          @click="handleSubmit"
        >
          {{ loading ? 'Memproses...' : 'Kirim ke Kepala Sekolah' }}
        </VButton>
      </div>
    </div>
  </VModal>
</template>