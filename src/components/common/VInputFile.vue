<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  accept: {
    type: String,
    default: '*',
  },
  maxSizeMb: {
    type: Number,
    default: 10,
  },
  fileTypesText: {
    type: String,
    default: 'images, videos, or any file',
  },
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | null): void
  (e: 'file-uploaded', value: File): void
  (e: 'error', value: string): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isLoading = ref(false)
const uploadedFile = ref<File | null>(null)
const errorMessage = ref('')

const triggerInput = () => {
  if (fileInputRef.value) fileInputRef.value.click()
}

const clearUploadedFile = () => {
  uploadedFile.value = null
  errorMessage.value = ''

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  emit('update:modelValue', null)
}

const getFileExtension = (fileName: string): string => {
  const normalized = String(fileName || '').trim().toLowerCase()
  const lastDotIndex = normalized.lastIndexOf('.')

  if (lastDotIndex < 0) {
    return ''
  }

  return normalized.slice(lastDotIndex)
}

const isFileTypeAllowed = (file: File): boolean => {
  const accept = String(props.accept || '*').trim().toLowerCase()

  if (!accept || accept === '*' || accept === '*/*') {
    return true
  }

  const acceptedTypes = accept
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (acceptedTypes.length === 0) {
    return true
  }

  const extension = getFileExtension(file.name)
  const mimeType = String(file.type || '').toLowerCase()

  return acceptedTypes.some((typeRule) => {
    if (typeRule === '*' || typeRule === '*/*') {
      return true
    }

    if (typeRule.startsWith('.')) {
      return extension === typeRule
    }

    if (typeRule.endsWith('/*')) {
      const mimePrefix = typeRule.slice(0, -1)
      return mimeType.startsWith(mimePrefix)
    }

    return mimeType === typeRule
  })
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement

  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) processFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false

  const file = event.dataTransfer?.files?.[0]
  if (file) {
    processFile(file)
  }
}

const processFile = (file: File) => {
  errorMessage.value = ''

  if (!isFileTypeAllowed(file)) {
    uploadedFile.value = null
    errorMessage.value = `Tipe file tidak didukung. Gunakan ${props.fileTypesText}.`
    emit('update:modelValue', null)
    emit('error', errorMessage.value)
    return
  }

  const fileSizeMb = file.size / (1024 * 1024)

  if (fileSizeMb > props.maxSizeMb) {
    uploadedFile.value = null
    errorMessage.value = `Ukuran file terlalu besar. Maksimal ${props.maxSizeMb}MB.`
    emit('update:modelValue', null)
    emit('error', errorMessage.value)
    return
  }

  isLoading.value = true

  setTimeout(() => {
    uploadedFile.value = file
    isLoading.value = false
    emit('update:modelValue', file)
    emit('file-uploaded', file)
  }, 1500)
}

defineExpose({
  triggerInput,
})
</script>

<template>
  <div class="w-full font-[var(--font-sans)] text-[var(--app-text)]">
    <input
      ref="fileInputRef"
      type="file"
      class="hidden"
      :accept="accept"
      @change="handleFileSelect"
    />

    <div
      :class="[
        'flex w-full min-h-[288px] cursor-pointer flex-col items-center justify-center rounded-[20px]',
        'bg-[var(--app-card)] p-4 text-[var(--app-text)]',
        'shadow-[0_4px_4px_rgba(0,0,0,0.25)]',
        'transition-[transform,background-color,color] duration-300 ease-in-out',
        isDragging ? 'scale-[1.02] bg-[var(--app-soft-card)]' : '',
      ]"
      @click="triggerInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <div
        class="
          relative flex h-full w-full flex-1 flex-col
          items-center justify-center
        "
      >
        <svg
          class="pointer-events-none absolute inset-0 h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              id="inputFileDashedBorderGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stop-color="var(--app-accent)" />
              <stop offset="100%" stop-color="var(--app-accent-2)" />
            </linearGradient>
          </defs>

          <rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="16"
            fill="none"
            :stroke="isDragging ? 'var(--app-accent)' : 'url(#inputFileDashedBorderGrad)'"
            stroke-width="2"
            stroke-dasharray="12 12"
          />
        </svg>

        <div
          class="
            relative z-10 flex h-full w-full flex-col
            items-center justify-center py-5
          "
        >
          <div
            v-if="isLoading"
            class="
              flex animate-[v-input-file-pulse_1.6s_ease-in-out_infinite]
              flex-col items-center gap-4
            "
          >
            <svg
              class="h-[60px] w-[60px] animate-[v-input-file-spin_0.9s_linear_infinite]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="inputFileSpinnerGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stop-color="var(--app-accent)" />
                  <stop offset="100%" stop-color="var(--app-accent-2)" />
                </linearGradient>
              </defs>

              <path
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.5905 3 16.9255 4.09888 18.9056 5.86903"
                stroke="url(#inputFileSpinnerGradient)"
                stroke-width="2.5"
                stroke-linecap="round"
              />
            </svg>

            <span
              class="
                app-gradient-text-brand
                text-[length:var(--app-font-base)] font-semibold leading-[1.2]
              "
            >
              Mengunggah file...
            </span>
          </div>

          <div
            v-else-if="uploadedFile"
            class="flex flex-col items-center gap-5"
          >
            <div
              class="
                flex w-full max-w-[360px] items-center
                justify-center gap-2
              "
            >
              <div
                class="
                  min-w-0 flex-1 rounded-full border border-[var(--app-card-border)]
                  bg-[var(--app-card)] px-4 py-2
                  shadow-[0_1px_2px_rgba(0,0,0,0.08)]
                "
              >
                <span
                  class="
                    block overflow-hidden text-ellipsis whitespace-nowrap
                    text-[length:var(--app-font-xs)] font-bold leading-[1.2]
                    text-[var(--app-text)]
                  "
                >
                  {{ uploadedFile.name }}
                </span>
              </div>

              <button
                type="button"
                class="
                  h-8 w-8 shrink-0 rounded-full border border-[var(--app-danger-border)]
                  bg-[var(--app-card)] text-[length:var(--app-font-sm)]
                  font-bold leading-none text-[var(--app-danger)]
                  shadow-[0_1px_2px_rgba(0,0,0,0.08)]
                  transition-[background-color,color,border-color] duration-200 ease-in-out
                  hover:bg-[var(--app-danger-bg)] hover:text-[var(--app-danger-dark)]
                "
                aria-label="Hapus file"
                @click.stop="clearUploadedFile"
              >
                x
              </button>
            </div>

            <img
              src="@/assets/check-gradient.svg"
              alt="Success"
              class="h-[60px] w-[60px]"
            />

            <div
              class="
                flex flex-col items-center text-[length:var(--app-font-base)]
                font-semibold leading-[1.2] text-[var(--app-text)]
              "
            >
              <div class="text-[var(--app-text)]">
                File successfully
              </div>

              <div class="flex gap-1">
                <span class="app-gradient-text-brand font-semibold">
                  uploaded
                </span>

                <span class="text-[var(--app-text)]">
                  !
                </span>
              </div>
            </div>
          </div>

          <div
            v-else
            class="flex flex-col items-center gap-[30px]"
          >
            <img
              src="@/assets/upload-illustration.svg"
              alt="Upload Files"
              class="h-auto w-[140px] object-contain"
            />

            <div
              class="
                flex flex-col items-center gap-2
                text-[length:var(--app-font-base)] leading-[1.2]
              "
            >
              <div
                class="
                  flex flex-wrap justify-center gap-1 text-center
                "
              >
                <span class="font-semibold text-[var(--app-text)]">
                  Drag & Drop
                </span>

                <span class="app-gradient-text-brand font-semibold">
                  {{ fileTypesText }}
                </span>

                <span class="font-semibold text-[var(--app-text)]">
                  here
                </span>
              </div>

              <div
                class="
                  mt-1 flex items-center gap-1
                  text-[length:var(--app-font-xs)] leading-[1.2]
                  text-[var(--app-muted)]
                "
              >
                <span>or</span>

                <span
                  class="
                    app-gradient-text-brand
                    cursor-pointer font-medium underline
                  "
                >
                  browse files
                </span>

                <span>on your computer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="
        mt-3 text-center text-[length:var(--app-input-helper-font)]
        font-semibold leading-[1.4] text-[var(--app-danger)]
      "
    >
      {{ errorMessage }}
    </div>
  </div>
</template>