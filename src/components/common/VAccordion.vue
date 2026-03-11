<template>
  <div
    @click="toggle"
    :class="[
      'w-full relative cursor-pointer shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[16px] text-[#f8fafc] font-sans flex flex-col box-border overflow-hidden',

      'bg-[linear-gradient(90.74deg,#3f9760_0%,#3f9760_50%,#d1955f_100%)] bg-[length:175%_100%]',

      'transition-all duration-700 ease-in-out select-none',

      'hover:brightness-[0.85]',

      // State Open vs Closed
      isOpen
        ? 'bg-[position:0%_0%] p-[12px_24px_24px_24px]' // Buka: Geser ke kiri
        : 'bg-[position:100%_0%] p-[12px_24px]', // Tutup: Geser ke kanan
    ]"
  >
    <div class="flex items-center justify-between w-full">
      <div class="flex-1 text-[20px] font-semibold leading-[120%]">
        {{ title }}
      </div>
      <ChevronDownIcon
        :class="[
          'w-[24px] h-[24px] flex-shrink-0 transition-transform duration-700 ease-in-out',
          isOpen ? 'rotate-180' : 'rotate-0',
        ]"
      />
    </div>

    <div
      :class="[
        'grid transition-all duration-700 ease-in-out',
        isOpen ? 'grid-rows-[1fr] opacity-100 mt-[12px]' : 'grid-rows-[0fr] opacity-0 mt-0',
      ]"
    >
      <div class="overflow-hidden">
        <div class="text-[16px] leading-[150%]">
          <slot>{{ content }}</slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDownIcon } from 'lucide-vue-next'

defineProps({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
})

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>
