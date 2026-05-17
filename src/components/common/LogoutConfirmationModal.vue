<script setup lang="ts">
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'confirmed'): void
}>()

const handleModalVisibilityChange = (value: boolean) => {
  emit('update:isOpen', value)
}

const handleConfirm = () => {
  emit('confirmed')
  emit('update:isOpen', false)
}
</script>

<template>
  <ConfirmationModal
    :is-open="isOpen"
    title="Konfirmasi Logout"
    description="Apakah Anda yakin ingin keluar dari sistem? Anda harus masuk kembali untuk mengakses fitur aplikasi."
    confirm-text="Keluar"
    cancel-text="Batal"
    icon="logout"
    @update:is-open="handleModalVisibilityChange"
    @confirm="handleConfirm"
  />
</template>