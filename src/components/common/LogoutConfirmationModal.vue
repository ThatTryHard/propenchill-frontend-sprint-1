<script setup lang="ts">
import { X, LogOut } from 'lucide-vue-next'
import VButton from '@/components/common/VButton.vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'confirmed'): void
}>()

const closeModal = () => {
  emit('update:isOpen', false)
}

const handleConfirm = () => {
  emit('confirmed')
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="closeModal"
      >
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="isOpen"
            class="relative w-full max-w-[420px] rounded-[24px] border-[0.5px] border-transparent overflow-hidden backdrop-blur-[10px] px-8 py-7 text-[#111827] shadow-[0px_-2px_4px_rgba(0,0,0,0.2),0px_2px_4px_rgba(255,255,255,0.4)]"
            style="
              background:
                linear-gradient(#f8fafc, #f8fafc) padding-box,
                linear-gradient(
                    243.74deg,
                    rgba(255, 255, 255, 0.05),
                    #ffffff 47.12%,
                    rgba(255, 255, 255, 0.05)
                  )
                  border-box;
            "
          >
            <div class="flex flex-col gap-5">
              <div class="flex justify-end">
                <button
                  type="button"
                  @click="closeModal"
                  class="text-[#111827] hover:opacity-70 transition"
                >
                  <X class="w-5 h-5" />
                </button>
              </div>

              <div class="flex flex-col items-center gap-3">
                <div
                  class="flex items-center justify-center w-[56px] h-[56px] rounded-full bg-[#fee2e2]"
                >
                  <LogOut class="w-8 h-8 text-[#A0453B]" />
                </div>
                <b class="text-[24px] leading-[120%]">Konfirmasi Logout</b>
                <p class="text-center text-[14px] leading-[150%] text-[#6b7280]">
                  Apakah Anda yakin ingin keluar dari sistem? Anda harus masuk kembali untuk
                  mengakses fitur aplikasi.
                </p>
              </div>

              <div class="flex items-center justify-center gap-3 mt-2">
                <VButton variant="secondary" class="flex-1" @click="closeModal"> Batal </VButton>

                <VButton
                  variant="primary"
                  class="flex-1 !bg-[#A0453B] !border-[#A0453B] hover:!bg-[#8b3e37] !shadow-none"
                  @click="handleConfirm"
                >
                  Keluar
                </VButton>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>
