<script setup lang="ts">
import { computed } from 'vue'
import { Trash2, X } from 'lucide-vue-next'
import VButton from '@/components/common/VButton.vue'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    title?: string
    studentName?: string
    loading?: boolean
    confirmLabel?: string
    cancelLabel?: string
  }>(),
  {
    title: 'Hapus Data Siswa',
    studentName: '',
    loading: false,
    confirmLabel: 'Hapus',
    cancelLabel: 'Batal',
  },
)

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'confirm'): void
}>()

const closeModal = () => {
  if (props.loading) return
  emit('update:isOpen', false)
}

const handleConfirm = () => {
  if (props.loading) return
  emit('confirm')
}

const confirmText = computed(() => {
  return props.loading ? 'Menghapus...' : props.confirmLabel
})
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
          <div v-if="isOpen" class="delete-modal-panel relative w-full max-w-[520px]">
            <button
              type="button"
              class="delete-modal-close absolute right-8 top-7"
              :disabled="loading"
              @click="closeModal"
            >
              <X class="h-5 w-5" />
            </button>

            <div class="flex flex-col items-center text-center">
              <div
                class="delete-icon-wrapper mt-8 flex h-[4.3rem] w-[4.3rem] items-center justify-center rounded-full"
              >
                <Trash2 class="h-[2rem] w-[2rem]" />
              </div>

              <h2 class="delete-modal-title mt-5 text-[1.7rem] font-bold leading-[120%]">
                {{ title }}
              </h2>

              <p class="delete-modal-message mt-3 max-w-[390px] text-[1rem] leading-[150%]">
                Apakah Anda yakin ingin menghapus data
                <span class="delete-modal-name font-bold">{{ studentName }}</span
                >?
                <br />
                Tindakan ini tidak dapat dibatalkan.
              </p>

              <div class="mt-6 flex items-center justify-center gap-2">
                <VButton
                  variant="secondary"
                  class="!w-[132px]"
                  :disabled="loading"
                  @click="closeModal"
                >
                  {{ cancelLabel }}
                </VButton>

                <VButton
                  variant="primary"
                  class="!w-[132px]"
                  :disabled="loading"
                  @click="handleConfirm"
                >
                  {{ confirmText }}
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
.delete-modal-panel {
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

.delete-modal-close {
  color: var(--app-modal-text);
  transition: opacity 0.2s ease;
}

.delete-modal-close:hover {
  opacity: 0.7;
}

.delete-icon-wrapper {
  background: var(--app-danger-bg);
  color: var(--app-danger);
}

.delete-modal-title,
.delete-modal-name {
  color: var(--app-modal-text);
}

.delete-modal-message {
  color: var(--app-muted);
}
</style>