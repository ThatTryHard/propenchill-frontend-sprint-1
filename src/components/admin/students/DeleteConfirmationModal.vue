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
        class="
          fixed inset-0 z-[100] flex items-center justify-center
          bg-black/40 p-4 backdrop-blur-sm
        "
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
            class="
              relative w-full max-w-[480px] overflow-visible
              rounded-[24px] border-[0.5px] border-[var(--app-modal-border)]
              bg-[var(--app-modal-bg)] px-8 py-7
              font-[var(--font-sans)] text-[var(--app-modal-text)]
              shadow-[0_-2px_4px_rgba(0,0,0,0.2),0_2px_4px_rgba(255,255,255,0.4)]
              backdrop-blur-[10px]
              max-[640px]:max-w-[calc(100vw-32px)]
              max-[640px]:px-5 max-[640px]:py-6
            "
          >
            <button
              type="button"
              aria-label="Tutup modal"
              class="
                absolute right-8 top-7 inline-flex items-center justify-center
                text-[var(--app-modal-text)]
                transition-opacity duration-200 ease-in-out
                hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50
                focus:outline-none focus-visible:outline focus-visible:outline-2
                focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]
                max-[640px]:right-5 max-[640px]:top-5
              "
              :disabled="loading"
              @click="closeModal"
            >
              <X class="h-5 w-5" />
            </button>

            <div class="flex flex-col items-center text-center">
              <div
                class="
                  mt-8 flex h-[68px] w-[68px] items-center justify-center
                  rounded-full bg-[var(--app-danger-bg)]
                  text-[var(--app-danger)]
                "
              >
                <Trash2 class="h-8 w-8" />
              </div>

              <h2
                class="
                  mt-5 mb-0 text-[length:var(--app-section-title-font)]
                  font-bold leading-[1.2] text-[var(--app-modal-text)]
                "
              >
                {{ title }}
              </h2>

              <p
                class="
                  mt-3 mb-0 max-w-[390px]
                  text-[length:var(--app-font-sm)]
                  font-medium leading-[1.5] text-[var(--app-muted)]
                "
              >
                Apakah Anda yakin ingin menghapus data
                <span class="font-bold text-[var(--app-modal-text)]">
                  {{ studentName }}
                </span>
                ?
                <br />
                Tindakan ini tidak dapat dibatalkan.
              </p>

              <div class="mt-6 flex items-center justify-center gap-3">
                <VButton
                  variant="secondary"
                  class="min-w-[104px]"
                  :disabled="loading"
                  @click="closeModal"
                >
                  {{ cancelLabel }}
                </VButton>

                <VButton
                  variant="primary"
                  class="min-w-[104px]"
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