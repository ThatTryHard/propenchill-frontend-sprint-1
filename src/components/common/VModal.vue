<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('close')"
      >
        <div class="fixed inset-0 bg-black/40" />
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-[380px] p-6 flex flex-col items-center gap-4 z-10">
          <!-- Icon -->
          <div class="flex items-center justify-center w-14 h-14 rounded-full bg-[#e8f3eb]">
            <component :is="iconComponent" :size="28" class="text-[#3F9760]" />
          </div>

          <!-- Title -->
          <h3 class="text-[18px] font-bold text-[#1a202c] text-center">{{ title }}</h3>

          <!-- Description -->
          <p class="text-[14px] text-[#718096] text-center leading-relaxed">{{ description }}</p>

          <!-- Buttons -->
          <div class="flex gap-3 w-full mt-2">
            <VButton
              variant="tertiary"
              class="flex-1 h-[44px]"
              @click="$emit('close')"
            >
              {{ cancelText }}
            </VButton>
            <VButton
              :variant="confirmVariant"
              class="flex-1 h-[44px]"
              :disabled="loading"
              @click="$emit('confirm')"
            >
              {{ loading ? 'Memproses...' : confirmText }}
            </VButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BookOpen, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-vue-next'
import VButton from '@/components/common/VButton.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Konfirmasi' },
  description: { type: String, default: 'Apakah Anda yakin?' },
  confirmText: { type: String, default: 'Ya' },
  cancelText: { type: String, default: 'Batal' },
  confirmVariant: { type: String, default: 'primary' },
  icon: { type: String, default: 'default' },
  loading: { type: Boolean, default: false },
})

defineEmits(['close', 'confirm'])

const iconComponent = computed(() => {
  switch (props.icon) {
    case 'delete': return Trash2
    case 'warning': return AlertTriangle
    case 'success': return CheckCircle2
    default: return BookOpen
  }
})
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
