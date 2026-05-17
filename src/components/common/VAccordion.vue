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
    default: '',
  },
  contentClass: {
    type: String,
    default: '',
  },
})

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <div
    class="
      relative box-border flex w-full cursor-pointer select-none flex-col overflow-hidden
      rounded-[16px] px-6 pt-3 font-[var(--font-sans)]
      text-[var(--app-text-inverse)]
      shadow-[0_4px_4px_rgba(0,0,0,0.25)]
      transition-[background,filter,padding] duration-300 ease-in-out
      hover:brightness-95
    "
    :class="
      isOpen
        ? 'pb-6 [background:var(--app-accent)]'
        : 'pb-3 [background:var(--gradient-brand)]'
    "
    @click="toggle"
  >
    <div class="flex w-full items-center justify-between gap-0">
      <div
        class="
          flex-1 text-[length:var(--app-font-xl)]
          font-semibold leading-[1.2]
          text-[var(--app-text-inverse)]
        "
        :class="titleClass"
      >
        {{ title }}
      </div>

      <ChevronDownIcon
        class="
          h-6 w-6 shrink-0 text-[var(--app-text-inverse)]
          transition-transform duration-300 ease-in-out
        "
        :class="{ 'rotate-180': isOpen }"
      />
    </div>

    <div
      class="
        grid opacity-0 transition-[grid-template-rows,opacity,margin-top]
        duration-300 ease-in-out
      "
      :class="
        isOpen
          ? 'mt-3 opacity-100 [grid-template-rows:1fr]'
          : 'mt-0 opacity-0 [grid-template-rows:0fr]'
      "
    >
      <div class="overflow-hidden">
        <div
          class="
            text-[length:var(--app-font-base)]
            font-normal leading-[1.5]
            text-[var(--app-text-inverse)]
          "
          :class="contentClass"
        >
          <slot>{{ content }}</slot>
        </div>
      </div>
    </div>
  </div>
</template>