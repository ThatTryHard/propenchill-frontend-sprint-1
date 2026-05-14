<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Clock, User } from 'lucide-vue-next'
import VButton from '@/components/common/VButton.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  reviewerName: {
    type: String,
    default: '-',
  },
  reviewerTitle: {
    type: String,
    default: '-',
  },
  rejectionNote: {
    type: String,
    default: '',
  },
  rejectionDate: {
    type: String,
    default: '-',
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

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      needRevision.value = true
      userNote.value = props.rejectionNote || ''
      errorMessage.value = ''
    }
  },
)

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
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
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
          <div v-if="isOpen" class="revision-note-modal relative w-full max-w-[520px]">
            <button type="button" class="modal-close-button" @click="closeModal">
              <X class="h-6 w-6" />
            </button>

            <h3 class="modal-title mb-6 text-[1.7rem] font-bold leading-[120%]">
              Catatan
            </h3>

            <div class="reviewer-card mb-6 rounded-[12px] p-4">
              <div class="flex gap-4">
                <div class="flex-shrink-0">
                  <div class="reviewer-avatar flex h-[3.45rem] w-[3.45rem] items-center justify-center overflow-hidden rounded-full">
                    <img
                      v-if="reviewerPhoto"
                      :src="reviewerPhoto"
                      :alt="reviewerName"
                      class="h-full w-full object-cover"
                    />
                    <User v-else class="h-6 w-6 text-[var(--app-accent)]" />
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <h4 class="modal-title mb-0.5 text-[1.125rem] font-bold">
                    {{ reviewerName }}
                  </h4>

                  <p class="modal-muted mb-3 text-[1rem]">
                    {{ reviewerTitle }}
                  </p>

                  <VTextareaField
                    v-model="userNote"
                    placeholder="Ketik catatan di sini..."
                    :rows="3"
                    :state="errorMessage ? 'error' : 'default'"
                    :message="errorMessage"
                  />

                  <div class="modal-muted mt-2 flex items-center gap-1.5 text-[0.85rem]">
                    <Clock class="h-3.5 w-3.5" />
                    <span>{{ rejectionDate }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-6 flex items-center justify-end gap-6">
              <label class="revision-radio-label group flex cursor-pointer items-center gap-2">
                <div class="relative">
                  <input v-model="needRevision" type="radio" :value="true" class="peer sr-only" />

                  <div class="radio-circle"></div>

                  <div
                    class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity peer-checked:opacity-100"
                  >
                    <div class="h-2 w-2 rounded-full bg-[var(--app-text-inverse)]"></div>
                  </div>
                </div>

                <span class="text-[1rem] font-semibold transition-colors">
                  Ajukan Revisi
                </span>
              </label>

              <label class="revision-radio-label group flex cursor-pointer items-center gap-2">
                <div class="relative">
                  <input v-model="needRevision" type="radio" :value="false" class="peer sr-only" />

                  <div class="radio-circle"></div>

                  <div
                    class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity peer-checked:opacity-100"
                  >
                    <div class="h-2 w-2 rounded-full bg-[var(--app-text-inverse)]"></div>
                  </div>
                </div>

                <span class="text-[1rem] font-semibold transition-colors">
                  Tidak Perlu Revisi
                </span>
              </label>
            </div>

            <div class="flex justify-end">
              <VButton variant="primary" class="!w-[132px]" @click="handleConfirm">
                Kirim
              </VButton>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.revision-note-modal {
  overflow: visible;
  border: 0.5px solid var(--app-modal-border);
  border-radius: 24px;
  background: var(--app-modal-bg);
  color: var(--app-modal-text);
  padding: 28px 32px;
  box-shadow:
    0px -2px 4px rgba(0, 0, 0, 0.2),
    0px 2px 4px rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
}

.modal-close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  color: var(--app-modal-text);
  transition:
    opacity 0.2s ease,
    color 0.2s ease;
}

.modal-close-button:hover {
  opacity: 0.7;
}

.modal-title {
  color: var(--app-modal-text);
}

.modal-muted {
  color: var(--app-muted);
}

.reviewer-card {
  background: var(--app-soft-card);
  border: 1px solid var(--app-border);
}

.reviewer-avatar {
  background: rgba(63, 151, 96, 0.14);
}

.revision-radio-label {
  color: var(--app-modal-text);
}

.revision-radio-label:hover {
  color: var(--app-accent);
}

.radio-circle {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  border: 2px solid var(--app-border);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.peer:checked + .radio-circle {
  border-color: var(--app-accent);
  background: var(--app-accent);
}
</style>