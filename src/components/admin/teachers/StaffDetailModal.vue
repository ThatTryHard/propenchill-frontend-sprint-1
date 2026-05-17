<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Copy, UserRound, X } from 'lucide-vue-next'
import type { Teacher } from '@/stores/teacher'
import VButton from '@/components/common/VButton.vue'

const props = defineProps<{
  isOpen: boolean
  teacher: Teacher | null
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const copiedField = ref('')

const closeModal = () => {
  emit('update:isOpen', false)
}

const copyValue = async (field: string, value?: string | number | null) => {
  if (!value) return

  await navigator.clipboard.writeText(String(value))
  copiedField.value = field

  setTimeout(() => {
    copiedField.value = ''
  }, 1200)
}

const formatValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

const formatDate = (value?: string | null) => {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const detailItems = computed(() => {
  const t = props.teacher

  return [
    {
      key: 'niy',
      label: 'NIY',
      value: formatValue(t?.niy),
      copyable: true,
    },
    {
      key: 'email',
      label: 'Email',
      value: formatValue(t?.email),
      copyable: true,
    },
    {
      key: 'jabatan',
      label: 'Jabatan',
      value: formatValue(t?.jabatan),
      copyable: false,
    },
    {
      key: 'tanggal_lahir',
      label: 'Tanggal Lahir',
      value: formatDate(t?.tanggal_lahir),
      copyable: false,
    },
    {
      key: 'no_hp',
      label: 'Nomor HP',
      value: formatValue(t?.nomor_hp),
      copyable: true,
    },
    {
      key: 'email_verified',
      label: 'Email Terverifikasi',
      value: (t?.is_email_verified ?? t?.is_verified) ? 'Iya' : 'Belum',
      copyable: false,
    },
    {
      key: 'alamat',
      label: 'Alamat',
      value: formatValue(t?.alamat),
      copyable: false,
      wide: true,
    },
  ]
})
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
          <div
            v-if="isOpen"
            class="staff-detail-panel relative flex max-h-[calc(100vh-2rem)] w-full max-w-[720px] flex-col"
          >
            <div class="flex flex-col gap-5 min-h-0">
              <div class="flex justify-end">
                <button type="button" class="student-detail-close" @click="closeModal">
                  <X class="h-5 w-5" />
                </button>
              </div>

              <div class="flex flex-col items-center gap-3 text-center">
                <div
                  class="student-avatar flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full border"
                >
                  <UserRound class="h-[2rem] w-[2rem]" />
                </div>

                <div>
                  <h2 class="student-detail-title text-[1.7rem] font-bold leading-[120%]">
                    Detail Staf
                  </h2>

                  <p class="student-detail-subtitle mt-1 text-[1rem] leading-[150%]">
                    Informasi lengkap akun staf
                  </p>
                </div>
              </div>

              <div v-if="teacher" class="flex-1 overflow-y-auto pr-1">
                <div class="mb-4 rounded-2xl border p-4 student-main-card">
                  <p class="text-[0.85rem] font-semibold student-detail-muted">Nama Lengkap</p>

                  <div class="mt-1 flex items-center justify-between gap-3">
                    <p class="text-[1.25rem] font-bold student-detail-title">
                      {{ teacher.nama || '-' }}
                    </p>

                    <button
                      type="button"
                      class="copy-button"
                      @click="copyValue('nama', teacher.nama)"
                    >
                      <Check v-if="copiedField === 'nama'" class="h-4 w-4" />
                      <Copy v-else class="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div
                    v-for="item in detailItems"
                    :key="item.key"
                    class="student-detail-item rounded-2xl border p-4"
                    :class="{ 'md:col-span-2': item.wide }"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p class="text-[0.85rem] font-semibold student-detail-muted">
                          {{ item.label }}
                        </p>

                        <p class="mt-1 break-words text-[1rem] font-semibold student-detail-value">
                          {{ item.value }}
                        </p>
                      </div>

                      <button
                        v-if="item.copyable && item.value !== '-'"
                        type="button"
                        class="copy-button"
                        @click="copyValue(item.key, item.value)"
                      >
                        <Check v-if="copiedField === item.key" class="h-4 w-4" />
                        <Copy v-else class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="py-8 text-center text-[1rem] text-[var(--app-muted)]">
                Data staf tidak ditemukan.
              </div>

              <div class="flex justify-end">
                <VButton variant="primary" class="!w-[132px]" @click="closeModal">
                  Tutup
                </VButton>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.staff-detail-panel {
  overflow: hidden;
  border: 0.5px solid var(--app-modal-border);
  border-radius: 24px;
  background: var(--app-modal-bg);
  color: var(--app-modal-text);
  padding: 28px 32px;
}

.student-detail-close {
  color: var(--app-modal-text);
  transition: opacity 0.2s ease;
}

.student-detail-close:hover {
  opacity: 0.7;
}

.student-detail-title {
  color: var(--app-modal-text);
}

.student-detail-subtitle,
.student-detail-muted {
  color: var(--app-muted);
}

.student-main-card,
.student-detail-item {
  background: var(--app-card);
  border-color: var(--app-card-border);
  color: var(--app-text);
}

.student-avatar {
  background: var(--app-soft-card);
  border-color: var(--app-border);
  color: var(--app-accent);
}

.student-detail-value {
  color: var(--app-heading);
}

.copy-button {
  display: inline-flex;
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: var(--app-muted);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.copy-button:hover {
  background: var(--app-soft-card);
  color: var(--app-accent);
}
</style>
