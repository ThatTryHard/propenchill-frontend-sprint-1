<script setup lang="ts">
import { computed } from 'vue'
import { X, Eye } from 'lucide-vue-next'
import type { Student } from '@/stores/students'
import VButton from '@/components/common/VButton.vue'

const props = defineProps<{
  isOpen: boolean
  student: Student | null
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const closeModal = () => {
  emit('update:isOpen', false)
}

const jenisKelaminLabel = computed(() => {
  if (!props.student?.jenis_kelamin) return '-'
  return props.student.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'
})

const formattedTanggalLahir = computed(() => {
  if (!props.student?.tanggal_lahir) return '-'

  const date = new Date(props.student.tanggal_lahir)
  if (Number.isNaN(date.getTime())) return props.student.tanggal_lahir

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
})

const detailRows = computed(() => [
  { label: 'ID Siswa', value: props.student?.id_siswa ?? '-' },
  { label: 'Nama', value: props.student?.nama || '-' },
  { label: 'NIS', value: props.student?.nis || '-' },
  { label: 'NISN', value: props.student?.nisn || '-' },
  { label: 'Email', value: props.student?.email || '-' },
  { label: 'Jenis Kelamin', value: jenisKelaminLabel.value },
  { label: 'Kelas', value: props.student?.kelas || '-' },
  { label: 'Tanggal Lahir', value: formattedTanggalLahir.value },
  { label: 'No HP', value: props.student?.no_hp || '-' },
  { label: 'Alamat', value: props.student?.alamat || '-' },
])
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
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
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
          <div
            v-if="isOpen"
            class="relative w-full max-w-[720px] rounded-[24px] border-[0.5px] border-transparent overflow-hidden backdrop-blur-[10px] px-8 py-7 text-[#111827] shadow-[0px_-2px_4px_rgba(0,0,0,0.2),0px_2px_4px_rgba(255,255,255,0.4)]"
            style="background: linear-gradient(#f8fafc, #f8fafc) padding-box, linear-gradient(243.74deg, rgba(255,255,255,0.05), #ffffff 47.12%, rgba(255,255,255,0.05)) border-box;"
          >
            <div class="flex flex-col gap-5">
              <div class="flex justify-end">
                <button
                  type="button"
                  @click="closeModal"
                  class="text-[#111827] hover:opacity-70 transition"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <div class="flex flex-col items-center gap-2">
                <Eye class="w-12 h-12 text-[#3f9760]" />
                <b class="text-[24px] leading-[120%]">Detail Data Siswa</b>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="item in detailRows"
                  :key="item.label"
                  :class="item.label === 'Alamat' ? 'md:col-span-2' : ''"
                  class="flex flex-col gap-2"
                >
                  <div class="text-[16px] font-semibold text-[#111827]">
                    {{ item.label }}
                  </div>

                  <div
                    class="rounded-[12px] border-2 border-[#b2b5ba] bg-[#f8fafc] px-[19px] py-[14px] min-h-[52px] flex items-start"
                  >
                    <div
                      class="w-full text-[16px] leading-[150%] text-[#111827] break-words whitespace-pre-line"
                    >
                      {{ item.value }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-end gap-2">
                <VButton
                  variant="primary"
                  class="!w-[132px]"
                  @click="closeModal"
                >
                  Tutup
                </VButton>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>