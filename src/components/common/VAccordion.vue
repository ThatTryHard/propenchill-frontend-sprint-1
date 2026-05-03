<template>
  <div
    @click="toggle"
    :class="[
      'w-full relative cursor-pointer shadow-[0px_2px_4px_rgba(0,0,0,0.18)] rounded-[14px] text-[#f8fafc] font-sans flex flex-col box-border overflow-hidden',
      'bg-[linear-gradient(90.74deg,#3f9760_0%,#3f9760_50%,#d1955f_100%)] bg-[length:175%_100%]',
      'transition-all duration-500 ease-in-out select-none',
      'hover:brightness-[0.92]',
      isOpen
        ? 'bg-[position:0%_0%] p-[10px_18px_16px_18px]'
        : 'bg-[position:100%_0%] p-[10px_18px]',
    ]"
  >
    <div class="flex items-center justify-between w-full gap-4">
      <div
        class="flex-1 font-semibold leading-[140%]"
        :class="titleClass"
      >
        {{ title }}
      </div>

      <ChevronDownIcon
        :class="[
          'w-[18px] h-[18px] flex-shrink-0 transition-transform duration-500 ease-in-out',
          isOpen ? 'rotate-180' : 'rotate-0',
        ]"
      />
    </div>

    <div
      :class="[
        'grid transition-all duration-500 ease-in-out',
        isOpen ? 'grid-rows-[1fr] opacity-100 mt-[8px]' : 'grid-rows-[0fr] opacity-0 mt-0',
      ]"
    >
      <div class="overflow-hidden">
        <div
          class="leading-[160%]"
          :class="contentClass"
        >
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
  titleClass: {
    type: String,
    default: 'text-[14px]',
  },
  contentClass: {
    type: String,
    default: 'text-[13px]',
  },
})

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>