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
            :class="[
              'relative w-full flex flex-col items-center p-[22px_16px_16px_16px] text-center font-sans text-[#111827]',
              'rounded-[24px] backdrop-blur-[10px] overflow-hidden',
              'shadow-[0px_-2px_4px_rgba(0,0,0,0.2),0px_2px_4px_rgba(255,255,255,0.4)]',
              'border-[0.5px] border-transparent',
              maxWidthClass,
            ]"
            style="
              background:
                linear-gradient(#f8fafc, #f8fafc) padding-box,
                linear-gradient(
                    218.68deg,
                    rgba(255, 255, 255, 0.05),
                    #fff 47.12%,
                    rgba(255, 255, 255, 0.05)
                  )
                  border-box;
            "
          >
            <div class="w-full flex justify-end mb-[10px]">
              <button
                @click="closeModal"
                class="text-gray-500 hover:text-gray-800 transition-colors"
              >
                <XIcon class="w-[20px] h-[20px]" />
              </button>
            </div>

            <div class="w-full flex flex-col items-center gap-[10px]">
              <slot name="icon">
                <BookOpenIcon class="w-[40px] h-[40px] text-[#3f9760]" />
              </slot>

              <div class="w-full flex flex-col items-center gap-[8px]">
                <h3 class="text-[24px] font-bold leading-[120%]">{{ title }}</h3>
                <p class="text-[16px] leading-[150%] text-gray-600 max-w-[280px]">
                  {{ description }}
                </p>
              </div>
            </div>

            <slot></slot>

            <div v-if="buttons.length > 0" class="w-full flex justify-end gap-[12px] mt-[24px]">
              <button
                v-for="(btn, index) in buttons"
                :key="index"
                @click="handleButtonClick(btn.action)"
                :class="[
                  'py-[12px] px-[28px] min-w-[120px] rounded-[20px] text-[16px] font-semibold leading-[120%] transition-transform active:scale-95',
                  btn.variant === 'primary'
                    ? 'text-[#f8fafc] bg-[radial-gradient(77.91%_77.91%_at_50%_100%,#3f9760_4.91%,#0c4923)] shadow-[0px_-2px_0px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset]'
                    : 'text-[#111827] bg-[#c9e9da] shadow-[0px_-2px_0px_rgba(0,0,0,0.4)_inset,0px_1px_0px_rgba(248,250,252,0.4)_inset]',
                ]"
              >
                {{ btn.label }}
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { XIcon, BookOpenIcon } from 'lucide-vue-next'

interface ModalButton {
  label: string
  variant: 'primary' | 'secondary'
  action?: () => void
}

defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  buttons: {
    type: Array as () => ModalButton[],
    default: () => [],
  },
  maxWidthClass: {
    type: String,
    default: 'max-w-[340px]',
  },
})

const emit = defineEmits(['update:isOpen', 'close'])

const closeModal = () => {
  emit('update:isOpen', false)
  emit('close')
}

const handleButtonClick = (action?: () => void) => {
  if (action) {
    action()
  } else {
    closeModal()
  }
}
</script>
