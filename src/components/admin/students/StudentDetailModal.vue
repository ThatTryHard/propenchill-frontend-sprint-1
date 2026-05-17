<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, Copy, UserRound, X } from 'lucide-vue-next'
import type { Student } from '@/stores/students'
import VButton from '@/components/common/VButton.vue'

const props = defineProps<{
  isOpen: boolean
  student: Student | null
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

const genderLabel = computed(() => {
  if (!props.student?.jenis_kelamin) return '-'
  if (props.student.jenis_kelamin === 'L') return 'Laki-laki'
  if (props.student.jenis_kelamin === 'P') return 'Perempuan'
  return props.student.jenis_kelamin
})

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
  const student = props.student

  return [
    {
      key: 'nis',
      label: 'NIS',
      value: formatValue(student?.nis),
      copyable: true,
    },
    {
      key: 'nisn',
      label: 'NISN',
      value: formatValue(student?.nisn),
      copyable: true,
    },
    {
      key: 'email',
      label: 'Email',
      value: formatValue(student?.email),
      copyable: true,
    },
    {
      key: 'jenis_kelamin',
      label: 'Jenis Kelamin',
      value: genderLabel.value,
      copyable: false,
    },
    {
      key: 'kelas',
      label: 'Kelas',
      value: formatValue(student?.kelas),
      copyable: false,
    },
    {
      key: 'tanggal_lahir',
      label: 'Tanggal Lahir',
      value: formatDate(student?.tanggal_lahir),
      copyable: false,
    },
    {
      key: 'no_hp',
      label: 'Nomor HP',
      value: formatValue(student?.no_hp),
      copyable: true,
      wide: true,
    },
    {
      key: 'alamat',
      label: 'Alamat',
      value: formatValue(student?.alamat),
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
        class="
          fixed inset-0 z-[100] flex items-center justify-center
          bg-black/40 p-3 backdrop-blur-sm
        "
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
            class="
              relative flex max-h-[calc(100dvh-32px)] w-full max-w-[640px]
              flex-col overflow-hidden rounded-[20px] border-[0.5px]
              border-[var(--app-modal-border)] bg-[var(--app-modal-bg)]
              px-6 py-5 font-[var(--font-sans)] text-[var(--app-modal-text)]
              shadow-[0_-2px_4px_rgba(0,0,0,0.2),0_2px_4px_rgba(255,255,255,0.4)]
              backdrop-blur-[10px]
              max-[640px]:px-4 max-[640px]:py-4
            "
          >
            <div class="flex min-h-0 flex-col gap-4">
              <div class="flex justify-end">
                <button
                  type="button"
                  aria-label="Tutup modal"
                  class="
                    inline-flex items-center justify-center
                    text-[var(--app-modal-text)]
                    transition-opacity duration-200 ease-in-out
                    hover:opacity-70
                    focus:outline-none focus-visible:outline focus-visible:outline-2
                    focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]
                  "
                  @click="closeModal"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>

              <div class="flex flex-col items-center gap-2 text-center">
                <div
                  class="
                    flex h-[58px] w-[58px] items-center justify-center
                    rounded-full border border-[var(--app-border)]
                    bg-[var(--app-soft-card)] text-[var(--app-accent)]
                  "
                >
                  <UserRound class="h-7 w-7" />
                </div>

                <div>
                  <h2
                    class="
                      m-0 text-[length:var(--app-card-title-font)]
                      font-bold leading-[1.2] text-[var(--app-modal-text)]
                    "
                  >
                    Detail Siswa
                  </h2>

                  <p
                    class="
                      mt-1 mb-0 text-[length:var(--app-font-sm)]
                      leading-[1.5] text-[var(--app-muted)]
                    "
                  >
                    Informasi lengkap data siswa
                  </p>
                </div>
              </div>

              <div
                v-if="student"
                class="min-h-0 flex-1 overflow-y-auto pr-1"
              >
                <div
                  class="
                    mb-3 rounded-[16px] border border-[var(--app-card-border)]
                    bg-[var(--app-card)] p-4 text-[var(--app-text)]
                  "
                >
                  <p
                    class="
                      m-0 text-[length:var(--app-font-xs)]
                      font-semibold leading-[1.4] text-[var(--app-muted)]
                    "
                  >
                    Nama Lengkap
                  </p>

                  <div class="mt-1 flex items-center justify-between gap-3">
                    <p
                      class="
                      m-0 text-[length:var(--app-font-sm)]
                        font-bold leading-[1.3] text-[var(--app-modal-text)]
                      "
                    >
                      {{ student.nama || '-' }}
                    </p>

                    <button
                      type="button"
                      aria-label="Salin nama lengkap"
                      class="
                        inline-flex h-8 w-8 shrink-0 items-center justify-center
                        rounded-full text-[var(--app-muted)]
                        transition-colors duration-200 ease-in-out
                        hover:bg-[var(--app-soft-card)] hover:text-[var(--app-accent)]
                        focus:outline-none focus-visible:outline focus-visible:outline-2
                        focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]
                      "
                      @click="copyValue('nama', student.nama)"
                    >
                      <Check
                        v-if="copiedField === 'nama'"
                        class="h-4 w-4"
                      />
                      <Copy
                        v-else
                        class="h-4 w-4"
                      />
                    </button>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div
                    v-for="item in detailItems"
                    :key="item.key"
                    class="
                      rounded-[16px] border border-[var(--app-card-border)]
                      bg-[var(--app-card)] p-4 text-[var(--app-text)]
                    "
                    :class="{ 'md:col-span-2': item.wide }"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div class="min-w-0">
                        <p
                          class="
                            m-0 text-[length:var(--app-font-xs)]
                            font-semibold leading-[1.4] text-[var(--app-muted)]
                          "
                        >
                          {{ item.label }}
                        </p>

                        <p
                          class="
                            mt-1 mb-0 break-words
                            text-[length:var(--app-font-sm)]
                            font-semibold leading-[1.5] text-[var(--app-heading)]
                          "
                        >
                          {{ item.value }}
                        </p>
                      </div>

                      <button
                        v-if="item.copyable && item.value !== '-'"
                        type="button"
                        :aria-label="`Salin ${item.label}`"
                        class="
                          inline-flex h-8 w-8 shrink-0 items-center justify-center
                          rounded-full text-[var(--app-muted)]
                          transition-colors duration-200 ease-in-out
                          hover:bg-[var(--app-soft-card)] hover:text-[var(--app-accent)]
                          focus:outline-none focus-visible:outline focus-visible:outline-2
                          focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]
                        "
                        @click="copyValue(item.key, item.value)"
                      >
                        <Check
                          v-if="copiedField === item.key"
                          class="h-4 w-4"
                        />
                        <Copy
                          v-else
                          class="h-4 w-4"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="
                  py-8 text-center text-[length:var(--app-font-sm)]
                  leading-[1.5] text-[var(--app-muted)]
                "
              >
                Data siswa tidak ditemukan.
              </div>

              <div class="flex justify-end">
                <VButton
                  variant="primary"
                  class="min-w-[92px]"
                  @click="closeModal"
                >
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