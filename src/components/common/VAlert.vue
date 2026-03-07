<template>
  <Teleport to="body">
    <Transition name="alert-slide">
      <div
        v-if="visible"
        class="fixed top-6 right-6 z-[9999] w-[400px] max-w-[calc(100vw-2rem)] shadow-lg"
      >
        <div
          :class="['flex items-start gap-3 p-4 rounded-xl border w-full', containerStyles]"
        >
          <!-- Icon -->
          <div :class="['flex items-center justify-center w-10 h-10 rounded-full shrink-0', iconBgStyles]">
            <component :is="iconComponent" :size="20" :class="iconColorStyles" />
          </div>

          <!-- Content -->
          <div class="flex flex-col gap-0.5 flex-1 min-w-0">
            <span class="text-[14px] font-bold text-[#1a202c]">{{ title }}</span>
            <span class="text-[13px] text-[#4a5568]">{{ message }}</span>
          </div>

          <!-- Close -->
          <button
            v-if="dismissible"
            @click="$emit('close')"
            class="shrink-0 text-[#1a202c] hover:opacity-70 transition-opacity mt-1"
          >
            <X :size="20" :stroke-width="2.5" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { XCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-vue-next'

const props = defineProps({
  visible: { type: Boolean, default: true },
  type: { type: String, default: 'info' }, // 'error' | 'success' | 'info' | 'warning'
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  dismissible: { type: Boolean, default: true },
})

defineEmits(['close'])

const iconComponent = computed(() => {
  switch (props.type) {
    case 'error': return XCircle
    case 'success': return CheckCircle2
    case 'warning': return AlertTriangle
    default: return Info
  }
})

const containerStyles = computed(() => {
  switch (props.type) {
    case 'error': return 'bg-[#fde8e8] border-[#f8b4b4]'
    case 'success': return 'bg-[#e8f5e9] border-[#a5d6a7]'
    case 'warning': return 'bg-[#fef9e7] border-[#f0d78c]'
    default: return 'bg-[#e8f0fe] border-[#a4c2f4]'
  }
})

const iconBgStyles = computed(() => {
  switch (props.type) {
    case 'error': return 'bg-[#fde8e8]'
    case 'success': return 'bg-[#e8f5e9]'
    case 'warning': return 'bg-[#fef9e7]'
    default: return 'bg-[#e8f0fe]'
  }
})

const iconColorStyles = computed(() => {
  switch (props.type) {
    case 'error': return 'text-[#A0453B]'
    case 'success': return 'text-[#509664]'
    case 'warning': return 'text-[#b8941b]'
    default: return 'text-[#4a7ab5]'
  }
})
</script>

<style scoped>
.alert-slide-enter-active,
.alert-slide-leave-active {
  transition: all 0.3s ease;
}
.alert-slide-enter-from,
.alert-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
