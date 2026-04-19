<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import VModal from '@/components/common/VModal.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'
import VDropdown from '@/components/common/VDropdown.vue'

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
    <div class="mt-4 w-full flex flex-col gap-5 text-left">
      <div class="flex flex-col gap-2 font-sans">
        <label class="text-[16px] font-semibold text-[#111827]">Teruskan Kepada</label>
        <div
          class="w-full p-[14px] rounded-[12px] border border-[#d9e2e7] bg-[#f3f4f6] text-[16px] text-[#6b7280] font-semibold flex items-center justify-between"
        >
          <span>Kepala Sekolah</span>
          <LockIcon class="w-5 h-5 opacity-50" />
        </div>
      </div>

      <div class="flex flex-col gap-2 font-sans relative z-20">
        <label class="text-[16px] font-semibold text-[#111827]">Sifat Disposisi</label>
        <VDropdown
          v-model="form.sifat"
          :options="sifatOptions"
          placeholder="Pilih Sifat Disposisi"
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
          @update:modelValue="form.instruksi = String($event || '')"
          :disabled="loading"
        />
      </div>

      <div class="mt-2 flex items-center justify-end gap-3 relative z-10">
        <button
          type="button"
          class="rounded-[14px] border border-[#d1d5db] px-5 py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#f3f4f6] transition-colors"
          :disabled="loading"
          @click="handleClose"
        >
          Batal
        </button>

        <button
          type="button"
          class="rounded-[14px] bg-[#3f9760] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2f8a50] disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          :disabled="loading"
          @click="handleSubmit"
        >
          {{ loading ? 'Memproses...' : 'Kirim ke Kepala Sekolah' }}
        </button>
      </div>
    </div>
  </VModal>
</template>
