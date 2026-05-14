<template>
  <transition
    enter-active-class="transition duration-300 ease-out transform"
    enter-from-class="opacity-0 translate-x-8"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition duration-200 ease-in transform"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 translate-x-8"
  >
    <div
      v-if="isVisible"
      :class="[
        // 'w-auto max-w-[400px]' biar lebarnya menyesuaikan isi teks tapi ngga kepanjangan
        'fixed top-8 right-8 z-[100] w-auto max-w-[400px]',
        'flex items-start justify-between px-[20px] py-[14px]',
        'rounded-[9px] border-[1.1px] shadow-[0px_8px_8px_rgba(0,0,0,0.25)]',
        'font-sans text-[12px] text-[var(--app-text)]',
        alertStyles.bgBorder,
      ]"
    >
      <div class="flex items-start gap-[14px] flex-1">
        <component
          :is="alertStyles.icon"
          :class="['w-[32px] h-[32px] flex-shrink-0', alertStyles.iconColor]"
        />

        <div class="flex flex-col gap-[2px] mt-[2px]">
          <span v-if="title" class="font-semibold text-[14px] leading-[120%]">{{ title }}</span>
          <span class="leading-[150%]">{{ message }}</span>
        </div>
      </div>

      <button
        v-if="dismissible"
        @click="closeAlert"
        class="ml-[16px] mt-[2px] flex-shrink-0 text-[var(--app-muted)] hover:text-[var(--app-text)] transition-colors focus:outline-none"
      >
        <XIcon class="w-[18px] h-[18px]" />
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  XIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  InfoIcon,
  AlertTriangleIcon,
} from 'lucide-vue-next'

const props = defineProps({
  type: {
    type: String,
    default: 'information', // 'error', 'success', 'information', 'warning'
  },
  title: {
    type: String,
    default: '',
  },
  message: {
    type: String,
    required: true,
  },
  dismissible: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close'])

const isVisible = ref(true)

const closeAlert = () => {
  isVisible.value = false
  emit('close')
}

const alertStyles = computed(() => {
  switch (props.type) {
    case 'error':
      return {
        bgBorder: 'bg-[var(--app-danger-bg)] border-[var(--app-danger-border)]',
        icon: AlertCircleIcon,
        iconColor: 'text-[var(--app-danger)]',
      }
    case 'success':
      return {
        bgBorder: 'bg-[var(--app-success-bg)] border-[var(--app-success-border)]',
        icon: CheckCircle2Icon,
        iconColor: 'text-[var(--app-success)]',
      }
    case 'warning':
      return {
        bgBorder: 'bg-[var(--app-warning-bg)] border-[var(--app-warning-border)]',
        icon: AlertTriangleIcon,
        iconColor: 'text-[var(--app-warning)]',
      }
    case 'information':
    default:
      return {
        bgBorder: 'bg-[var(--app-info-bg)] border-[var(--app-info-border)]',
        icon: InfoIcon,
        iconColor: 'text-[var(--app-info)]',
      }
  }
})
</script>