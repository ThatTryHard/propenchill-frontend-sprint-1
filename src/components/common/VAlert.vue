<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  XIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  InfoIcon,
  AlertTriangleIcon,
} from 'lucide-vue-next'

type AlertType = 'error' | 'success' | 'information' | 'warning'

const props = withDefaults(
  defineProps<{
    type?: AlertType
    title?: string
    message: string
    dismissible?: boolean
    visible?: boolean
  }>(),
  {
    type: 'information',
    title: '',
    dismissible: true,
    visible: true,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isVisible = ref(props.visible)

watch(
  () => props.visible,
  (value) => {
    isVisible.value = value
  },
)

const closeAlert = () => {
  isVisible.value = false
  emit('close')
}

const iconComponent = computed(() => {
  if (props.type === 'error') return AlertCircleIcon
  if (props.type === 'success') return CheckCircle2Icon
  if (props.type === 'warning') return AlertTriangleIcon
  return InfoIcon
})

const alertVariantClass = computed(() => {
  if (props.type === 'error') {
    return 'bg-[var(--app-danger-bg)] border-[var(--app-danger-border)]'
  }

  if (props.type === 'success') {
    return 'bg-[var(--app-success-bg)] border-[var(--app-success-border)]'
  }

  if (props.type === 'warning') {
    return 'bg-[var(--app-warning-bg)] border-[var(--app-warning-border)]'
  }

  return 'bg-[var(--app-info-bg)] border-[var(--app-info-border)]'
})

const iconVariantClass = computed(() => {
  if (props.type === 'error') return 'text-[var(--app-danger)]'
  if (props.type === 'success') return 'text-[var(--app-success)]'
  if (props.type === 'warning') return 'text-[var(--app-warning)]'
  return 'text-[var(--app-info)]'
})
</script>

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
        'fixed right-8 top-8 z-[100] box-border flex w-auto max-w-[400px] items-start justify-between rounded-[9px] border-[1.1px] px-5 py-[14px] font-[var(--font-sans)] text-[var(--app-text)] shadow-[0_8px_8px_rgba(0,0,0,0.25)] max-[640px]:left-4 max-[640px]:right-4 max-[640px]:top-4 max-[640px]:max-w-none',
        alertVariantClass,
      ]"
    >
      <div class="flex min-w-0 flex-1 items-start gap-[14px]">
        <component
          :is="iconComponent"
          :class="[
            'h-8 w-8 shrink-0',
            iconVariantClass,
          ]"
        />

        <div class="mt-0.5 flex min-w-0 flex-col gap-0.5">
          <span
            v-if="title"
            class="text-[length:var(--app-font-base)] font-semibold leading-[1.2] text-[var(--app-text)]"
          >
            {{ title }}
          </span>

          <span
            class="text-[length:var(--app-font-sm)] font-normal leading-[1.5] text-[var(--app-text)]"
          >
            {{ message }}
          </span>
        </div>
      </div>

      <button
        v-if="dismissible"
        type="button"
        class="ml-4 mt-0.5 inline-flex shrink-0 items-center justify-center text-[var(--app-muted)] transition-colors duration-200 hover:text-[var(--app-text)] focus:outline-none"
        aria-label="Tutup alert"
        @click="closeAlert"
      >
        <XIcon class="h-[18px] w-[18px]" />
      </button>
    </div>
  </transition>
</template>