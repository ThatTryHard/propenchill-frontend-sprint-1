<script setup lang="ts">
import { computed } from 'vue'
import { XIcon } from 'lucide-vue-next'
import VButton from '@/components/common/VButton.vue'

interface ModalButton {
  label: string
  variant: 'primary' | 'secondary' | 'tertiary'
  action?: () => void
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    title: string
    description?: string
    buttons?: ModalButton[]
    maxWidthClass?: string
    // 'body' => let document/body scroll when modal content exceeds viewport
    // 'modal' => modal content scrolls internally
    scrollBehavior?: 'body' | 'modal'

    showClose?: boolean
    showAsset?: boolean
    assetSrc?: string
    assetAlt?: string
  }>(),
  {
    description: '',
    buttons: () => [],
    maxWidthClass: 'max-w-[340px]',
    scrollBehavior: 'body',

    showClose: true,
    showAsset: true,
    assetSrc: '',
    assetAlt: 'Modal asset',
  },
)

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'close'): void
}>()

const hasAsset = computed(() => {
  return props.showAsset && Boolean(props.assetSrc)
})

const hasButtons = computed(() => {
  return props.buttons.length > 0
})

const closeModal = () => {
  emit('update:isOpen', false)
  emit('close')
}

const handleButtonClick = (action?: () => void) => {
  if (action) {
    action()
    return
  }

  closeModal()
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
        class="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(0,0,0,0.4)] p-4 backdrop-blur-[4px]"
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
            :class="[
              'relative box-border flex w-full flex-col items-stretch gap-[10px]',
              (scrollBehavior === 'body' ? 'overflow-visible' : 'overflow-auto max-h-[80vh]'),
              'rounded-[24px] border-[0.5px] border-transparent px-8 py-7',
              'font-[var(--font-sans)] text-left text-[var(--app-modal-text)]',
              'backdrop-blur-[10px]',
              'shadow-[0_-2px_4px_rgba(0,0,0,0.2),0_2px_4px_rgba(255,255,255,0.18)]',
              '[background:linear-gradient(var(--app-modal-bg),var(--app-modal-bg))_padding-box,linear-gradient(247.55deg,rgba(255,255,255,0.05),rgba(255,255,255,0.85)_47.12%,rgba(255,255,255,0.05))_border-box]',
              '[html.dark_&]:[background:linear-gradient(var(--app-modal-bg),var(--app-modal-bg))_padding-box,linear-gradient(247.55deg,rgba(255,255,255,0.04),rgba(162,183,202,0.22)_47.12%,rgba(255,255,255,0.04))_border-box]',
              'max-[480px]:px-5 max-[480px]:py-6',
              maxWidthClass,
            ]"
          >
            <div v-if="showClose" class="flex w-full justify-end">
              <button
                type="button"
                class="inline-flex items-center justify-center text-[var(--app-muted)] transition-colors duration-200 ease-in-out hover:text-[var(--app-text)] focus:outline-none"
                aria-label="Tutup modal"
                @click="closeModal"
              >
                <XIcon class="h-5 w-5" />
              </button>
            </div>

            <div class="flex w-full items-start gap-4 max-[480px]:flex-col max-[480px]:items-start">
              <div
                v-if="$slots.icon || $slots.asset || hasAsset"
                class="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--app-accent)]"
              >
                <slot name="icon">
                  <slot name="asset">
                    <img
                      v-if="hasAsset"
                      :src="assetSrc"
                      :alt="assetAlt"
                      class="h-10 w-10 object-contain"
                    />
                  </slot>
                </slot>
              </div>

              <div class="flex min-w-0 flex-1 flex-col justify-center gap-2">
                <h3
                  class="m-0 text-[length:var(--app-modal-title-font)] font-bold leading-[1.2] text-[var(--app-heading)]"
                >
                  {{ title }}
                </h3>

                <p
                  v-if="description"
                  class="m-0 text-[length:var(--app-modal-desc-font)] font-normal leading-[1.5] text-[var(--app-subtext)]"
                >
                  {{ description }}
                </p>
              </div>
            </div>

            <div
              v-if="$slots.default"
              class="w-full text-[length:var(--app-font-base)] leading-[1.5] text-[var(--app-text)]"
            >
              <slot></slot>
            </div>

            <div
              v-if="hasButtons"
              class="mt-[14px] flex items-center justify-end gap-2 max-[480px]:flex-col-reverse max-[480px]:items-stretch"
            >
              <div
                v-for="(btn, index) in buttons"
                :key="index"
                class="w-[132px] shrink-0 max-[480px]:w-full"
              >
                <VButton
                  :variant="btn.variant"
                  class="w-full"
                  :disabled="btn.disabled"
                  @click="handleButtonClick(btn.action)"
                >
                  {{ btn.label }}
                </VButton>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>
