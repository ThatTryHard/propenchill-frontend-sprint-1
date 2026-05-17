<script setup lang="ts">
import { computed } from 'vue'
import { LogOut, Trash2 } from 'lucide-vue-next'

import VModal from '@/components/common/VModal.vue'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'

type ConfirmationIcon = 'trash' | 'logout'

const props = withDefaults(
  defineProps<{
    isOpen: boolean
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    loading?: boolean
    errorMessage?: string
    icon?: ConfirmationIcon
  }>(),
  {
    confirmText: 'Hapus',
    cancelText: 'Batal',
    loading: false,
    errorMessage: '',
    icon: 'trash',
  },
)

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'confirm'): void
}>()

const isSubmitDisabled = computed(() => props.loading)

const iconComponent = computed(() => {
  return props.icon === 'logout' ? LogOut : Trash2
})

const closeModal = () => {
  emit('update:isOpen', false)
}

const handleConfirm = () => {
  if (props.loading) return
  emit('confirm')
}

const handleModalVisibilityChange = (value: boolean) => {
  emit('update:isOpen', value)
}
</script>

<template>
  <VModal
    :is-open="isOpen"
    :title="title"
    :description="description"
    max-width-class="max-w-[420px]"
    :buttons="[]"
    @update:is-open="handleModalVisibilityChange"
  >
    <template #icon>
      <div
        class="
          flex h-14 w-14 items-center justify-center rounded-full px-3
          bg-[var(--app-danger-bg)]
        "
      >
        <component
          :is="iconComponent"
          class="h-8 w-8 text-[var(--app-danger)]"
        />
      </div>
    </template>

    <div class="flex w-full flex-col gap-6 pt-2">
      <VAlert
        v-if="errorMessage"
        :visible="Boolean(errorMessage)"
        type="error"
        title="Gagal"
        :message="errorMessage"
      />

      <div
        class="
          flex w-full justify-end gap-3 pr-6
          max-[480px]:flex-col-reverse max-[480px]:pr-0
        "
      >
        <div class="w-[132px] shrink-0 max-[480px]:w-full">
          <VButton
            type="button"
            variant="secondary"
            class="w-full"
            :disabled="loading"
            @click="closeModal"
          >
            {{ cancelText }}
          </VButton>
        </div>

        <div class="w-[132px] shrink-0 max-[480px]:w-full">
          <VButton
            type="button"
            variant="primary"
            class="w-full"
            :disabled="isSubmitDisabled"
            @click="handleConfirm"
          >
            {{ loading ? 'Memproses...' : confirmText }}
          </VButton>
        </div>
      </div>
    </div>
  </VModal>
</template>
