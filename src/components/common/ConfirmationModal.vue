<script setup lang="ts">
import { computed } from 'vue'
import { X, Trash2 } from 'lucide-vue-next'
import VButton from '@/components/common/VButton.vue'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    loading?: boolean
    errorMessage?: string
  }>(),
  {
    confirmText: 'Hapus',
    cancelText: 'Batal',
    loading: false,
    errorMessage: '',
  },
)

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'confirm'): void
}>()

const closeModal = () => {
  emit('update:isOpen', false)
}

const isSubmitDisabled = computed(() => props.loading)

const handleConfirm = () => {
  if (props.loading) return
  emit('confirm')
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
            class="relative w-full max-w-[500px] rounded-[24px] border-[0.5px] border-[var(--app-modal-border)] overflow-hidden backdrop-blur-[10px] px-8 py-7 text-[var(--app-modal-text)] bg-[var(--app-modal-bg)] shadow-[0px_-2px_4px_rgba(0,0,0,0.2),0px_2px_4px_rgba(255,255,255,0.4)]"
          >
            <div class="flex flex-col gap-5">
              <div class="flex justify-end">
                <button
                  type="button"
                  @click="closeModal"
                  class="text-[var(--app-modal-text)] hover:opacity-70 transition"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <div class="flex flex-col items-center gap-3">
                <div
                  class="flex items-center justify-center w-[56px] h-[56px] rounded-full bg-[var(--app-danger-bg)]"
                >
                  <Trash2 class="w-8 h-8 text-[var(--app-danger)]" />
                </div>
                <b class="text-[24px] leading-[120%]">{{ title }}</b>
                <p class="text-center text-[14px] leading-[150%] text-[var(--app-subtext)]">
                  {{ description }}
                </p>
              </div>

              <p v-if="errorMessage" class="text-[13px] text-[var(--app-danger)] font-medium">
                {{ errorMessage }}
              </p>

              <div class="flex items-center justify-end gap-2">
                <VButton
                  variant="secondary"
                  class="!w-[132px]"
                  :disabled="loading"
                  @click="closeModal"
                >
                  {{ cancelText }}
                </VButton>

                <VButton
                  variant="primary"
                  class="!w-[132px]"
                  :disabled="isSubmitDisabled"
                  @click="handleConfirm"
                >
                  {{ loading ? 'Memproses...' : confirmText }}
                </VButton>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>