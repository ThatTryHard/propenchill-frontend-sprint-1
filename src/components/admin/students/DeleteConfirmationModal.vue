<script setup lang="ts">
import { computed } from 'vue'
import { X, Trash2 } from 'lucide-vue-next'
import { useStudentStore } from '@/stores/students'
import VButton from '@/components/common/VButton.vue'

const props = defineProps<{
  isOpen: boolean
  studentName: string
  studentId: number | null
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'confirmed'): void
}>()

const studentStore = useStudentStore()

const closeModal = () => {
  emit('update:isOpen', false)
}

const isSubmitDisabled = computed(() => studentStore.loading)

const handleConfirm = async () => {
  if (!props.studentId) return

  try {
    await studentStore.deleteStudent(props.studentId)
    emit('confirmed')
    closeModal()
  } catch {
    // error sudah ditangani di store
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
            class="relative w-full max-w-[500px] rounded-[24px] border-[0.5px] border-transparent overflow-hidden backdrop-blur-[10px] px-8 py-7 text-[#111827] shadow-[0px_-2px_4px_rgba(0,0,0,0.2),0px_2px_4px_rgba(255,255,255,0.4)]"
            style="
              background:
                linear-gradient(#f8fafc, #f8fafc) padding-box,
                linear-gradient(
                    243.74deg,
                    rgba(255, 255, 255, 0.05),
                    #ffffff 47.12%,
                    rgba(255, 255, 255, 0.05)
                  )
                  border-box;
            "
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

              <div class="flex flex-col items-center gap-3">
                <div class="flex items-center justify-center w-[56px] h-[56px] rounded-full bg-[#fee2e2]">
                  <Trash2 class="w-8 h-8 text-[#dc2626]" />
                </div>
                <b class="text-[24px] leading-[120%]">Hapus Data Siswa</b>
                <p class="text-center text-[14px] leading-[150%] text-[#6b7280]">
                  Apakah Anda yakin ingin menghapus data <span class="font-semibold text-[#111827]">{{ studentName }}</span>?
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              <p
                v-if="studentStore.error"
                class="text-[13px] text-[#A0453B] font-medium"
              >
                {{ studentStore.error }}
              </p>

              <div class="flex items-center justify-end gap-2">
                <VButton
                  variant="secondary"
                  class="!w-[132px]"
                  :disabled="studentStore.loading"
                  @click="closeModal"
                >
                  Batal
                </VButton>

                <VButton
                  variant="primary"
                  class="!w-[132px]"
                  :disabled="isSubmitDisabled"
                  @click="handleConfirm"
                >
                  {{ studentStore.loading ? 'Menghapus...' : 'Hapus' }}
                </VButton>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>
