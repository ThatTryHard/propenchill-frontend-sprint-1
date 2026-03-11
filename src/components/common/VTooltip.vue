<template>
  <div class="relative inline-flex" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
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
        class="absolute top-[calc(100%+8px)] left-0 z-50 flex flex-col items-start drop-shadow-[0_12px_16px_rgba(0,0,0,0.3)]"
      >
        <div
          class="absolute -top-[5px] left-[20px] w-[14px] h-[14px] bg-[#429760] rotate-45 rounded-[2px] z-0"
        ></div>

        <div
          :class="[
            'relative z-10 bg-[linear-gradient(90.74deg,#3f9760,#d1955f)] text-[#f8fafc] font-sans rounded-[10px]',
            type === 'large' ? 'p-[16px] w-[240px]' : 'px-[24px] py-[6px]',
          ]"
        >
          <div
            v-if="type === 'small'"
            class="text-[12px] font-semibold leading-[120%] text-center whitespace-nowrap"
          >
            {{ text }}
          </div>

          <div v-else class="flex flex-col gap-[8px] text-left">
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-[6px]">
                <InfoIcon class="w-[16px] h-[16px] text-white" />
                <span class="text-[16px] font-semibold leading-[120%]">{{ title }}</span>
              </div>
            </div>

            <div class="text-[12px] leading-[150%]">
              {{ text }}
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InfoIcon } from 'lucide-vue-next'

defineProps({
  text: {
    type: String,
    required: true,
  },
  title: String,
  type: {
    type: String,
    default: 'small',
  },
})

const show = ref(false)

// Logic buat nge-show tooltip pas di hover
const handleMouseEnter = () => {
  show.value = true
}

// Logic buat nge-hide tooltip pas mouse keluar
const handleMouseLeave = () => {
  show.value = false
}
</script>
