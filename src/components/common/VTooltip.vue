<script setup lang="ts">
import { ref } from 'vue'
import { InfoIcon } from 'lucide-vue-next'

defineProps({
  text: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'small',
  },
})

const show = ref(false)

const handleMouseEnter = () => {
  show.value = true
}

const handleMouseLeave = () => {
  show.value = false
}
</script>

<template>
  <div
    class="relative inline-flex"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot></slot>

    <transition
      enter-active-class="transition-all duration-300 ease-out origin-top-left"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in origin-top-left"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="show"
        class="
          absolute left-0 top-[calc(100%+8px)] z-50
          flex flex-col items-start
          drop-shadow-[0_12px_16px_rgba(0,0,0,0.3)]
        "
      >
        <div
          class="
            absolute left-5 top-[-5px] z-0
            h-[14px] w-[14px] rotate-45 rounded-[2px]
            bg-[var(--app-accent)]
          "
        ></div>

        <div
          :class="[
            'relative z-10 overflow-hidden rounded-[10px]',
            'font-[var(--font-sans)] text-[var(--app-text-inverse)]',
            '[background:var(--gradient-brand)]',
            type === 'large' ? 'w-[240px] p-4' : 'px-6 py-[6px]',
          ]"
        >
          <div
            v-if="type === 'small'"
            class="
              whitespace-nowrap text-center
              text-[length:var(--app-font-xs)]
              font-semibold leading-[1.2]
              text-[var(--app-text-inverse)]
            "
          >
            {{ text }}
          </div>

          <div
            v-else
            class="flex flex-col gap-2 text-left"
          >
            <div class="flex w-full items-center justify-between">
              <div class="flex min-w-0 items-center gap-1">
                <InfoIcon
                  class="
                    h-4 w-4 shrink-0
                    text-[var(--app-text-inverse)]
                  "
                />

                <span
                  class="
                    min-w-0 text-[length:var(--app-font-base)]
                    font-semibold leading-[1.2]
                    text-[var(--app-text-inverse)]
                  "
                >
                  {{ title || 'Tooltip Title' }}
                </span>
              </div>
            </div>

            <div
              class="
                text-left text-[length:var(--app-font-xs)]
                font-normal leading-[1.5]
                text-[var(--app-text-inverse)]
              "
            >
              {{ text }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>