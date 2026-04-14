<script setup lang="ts">
import { ref } from 'vue'
import { X, Clock, User } from 'lucide-vue-next'
import VButton from '@/components/common/VButton.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  reviewerName: {
    type: String,
    default: 'Dra. Siti Aminah, M.Pd',
  },
  reviewerTitle: {
    type: String,
    default: 'Guru Akademik',
  },
  rejectionNote: {
    type: String,
    default: '',
  },
  rejectionDate: {
    type: String,
    default: '25 Februari 2026, 10:30',
  },
  reviewerPhoto: {
    type: String,
    default: '',
  },
})

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
  (e: 'confirm', needRevision: boolean, userNote: string): void
}>()

const needRevision = ref<boolean>(true)
const userNote = ref<string>(props.rejectionNote)
const errorMessage = ref<string>('')

function closeModal() {
  userNote.value = ''
  errorMessage.value = ''
  emit('update:isOpen', false)
}

function handleConfirm() {
  if (needRevision.value && !userNote.value.trim()) {
    errorMessage.value = 'Catatan revisi wajib diisi.'
    return
  }

  if (needRevision.value && userNote.value.trim().length < 10) {
    errorMessage.value = 'Catatan revisi minimal 10 karakter.'
    return
  }

  emit('confirm', needRevision.value, userNote.value.trim())
  userNote.value = ''
  errorMessage.value = ''
}

function handleCancel() {
  closeModal()
}
</script>

<template>
  <Teleport to="body">
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        @click.self="closeModal">
        <transition enter-active-class="transition duration-300 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4">
          <div v-if="isOpen"
            class="relative w-full max-w-[520px] bg-white rounded-[24px] p-6 shadow-2xl overflow-hidden font-['Plus_Jakarta_Sans']">
            <!-- Close Button -->
            <button @click="closeModal"
              class="absolute top-5 right-5 text-[#6b7280] hover:text-[#111827] transition-colors">
              <X class="w-6 h-6" />
            </button>

            <!-- Title -->
            <h3 class="text-[24px] font-bold leading-[120%] text-[#111827] mb-6">
              Catatan
            </h3>

            <!-- Reviewer Card -->
            <div class="bg-[#f5f5f5] rounded-[12px] p-4 mb-6">
              <div class="flex gap-4">
                <!-- Profile Photo -->
                <div class="flex-shrink-0">
                  <div
                    class="w-[48px] h-[48px] rounded-full bg-[#d4e8d9] flex items-center justify-center overflow-hidden">
                    <img v-if="reviewerPhoto" :src="reviewerPhoto" :alt="reviewerName"
                      class="w-full h-full object-cover" />
                    <User v-else class="w-6 h-6 text-[#3f9760]" />
                  </div>
                </div>

                <!-- Reviewer Info & Note Input -->
                <div class="flex-1 min-w-0">
                  <h4 class="text-[16px] font-bold text-[#111827] mb-0.5">
                    {{ reviewerName }}
                  </h4>
                  <p class="text-[14px] text-[#6b7280] mb-3">
                    {{ reviewerTitle }}
                  </p>

                  <!-- Rejection Note Textarea -->
                  <textarea v-model="userNote" placeholder="Ketik catatan di sini..." rows="3"
                    class="w-full rounded-[8px] border border-[#d9e2e7] bg-white px-3 py-2 text-[14px] text-[#111827] outline-none transition placeholder:text-[#b2b5ba] focus:border-[#3f9760] resize-none mb-2" />
                  <p v-if="errorMessage" class="text-[12px] text-[#dc3545] mb-2">
                    {{ errorMessage }}
                  </p>

                  <!-- Timestamp -->
                  <div class="flex items-center gap-1.5 text-[12px] text-[#9ca3af]">
                    <Clock class="w-3.5 h-3.5" />
                    <span>{{ rejectionDate }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Radio Options -->
            <div class="flex items-center justify-end gap-6 mb-6">
              <label class="flex items-center gap-2 cursor-pointer group">
                <div class="relative">
                  <input v-model="needRevision" type="radio" :value="true" class="peer sr-only" />
                  <div
                    class="w-5 h-5 rounded-full border-2 border-[#d4e8d9] peer-checked:border-[#3f9760] peer-checked:bg-[#3f9760] transition-all">
                  </div>
                  <div
                    class="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                    <div class="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
                <span class="text-[14px] font-semibold text-[#111827] group-hover:text-[#3f9760] transition-colors">
                  Ajukan Revisi
                </span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer group">
                <div class="relative">
                  <input v-model="needRevision" type="radio" :value="false" class="peer sr-only" />
                  <div
                    class="w-5 h-5 rounded-full border-2 border-[#d4e8d9] peer-checked:border-[#3f9760] peer-checked:bg-[#3f9760] transition-all">
                  </div>
                  <div
                    class="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                    <div class="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                </div>
                <span class="text-[14px] font-semibold text-[#111827] group-hover:text-[#3f9760] transition-colors">
                  Tidak Perlu Revisi
                </span>
              </label>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end">
              <VButton variant="primary"
                class="!px-8 !py-3 !rounded-full !bg-[#3f9760] !hover:bg-[#2d7a4a] !text-white !font-semibold !text-[14px]"
                @click="handleConfirm">
                Kirim
              </VButton>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>