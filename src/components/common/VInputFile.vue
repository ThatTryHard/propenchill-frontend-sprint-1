<template>
  <div class="w-full font-sans text-[#111827]">
    <input
      type="file"
      ref="fileInputRef"
      class="hidden"
      :accept="accept"
      @change="handleFileSelect"
    />

    <div
      @click="triggerInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      :class="[
        'w-full min-h-[288px] flex flex-col items-center justify-center p-[16px] cursor-pointer transition-transform duration-300',
        'shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[20px]',
        isDragging ? 'scale-[1.02] bg-[#eaf0eb]' : 'scale-100 bg-[#f8fafc]',
      ]"
    >
      <div class="relative w-full h-full flex-1 flex flex-col items-center justify-center">
        <svg
          class="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="dashedBorderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#3f9760" />
              <stop offset="100%" stop-color="#d1955f" />
            </linearGradient>
          </defs>
          <rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="16"
            fill="none"
            :stroke="isDragging ? '#3f9760' : 'url(#dashedBorderGrad)'"
            stroke-width="2"
            stroke-dasharray="12 12"
          />
        </svg>

        <div
          class="relative z-10 flex flex-col items-center justify-center w-full h-full py-[20px]"
        >
          <div v-if="isLoading" class="flex flex-col items-center gap-4 animate-pulse">
            <svg
              class="animate-spin w-[60px] h-[60px]"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#3f9760" />
                  <stop offset="100%" stop-color="#d1955f" />
                </linearGradient>
              </defs>
              <path
                d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.5905 3 16.9255 4.09888 18.9056 5.86903"
                stroke="url(#spinnerGradient)"
                stroke-width="2.5"
                stroke-linecap="round"
              />
            </svg>
            <span
              class="font-semibold text-[16px] bg-[linear-gradient(90.74deg,#3f9760,#d1955f)] bg-clip-text text-transparent"
            >
              Mengunggah file...
            </span>
          </div>

          <div v-else-if="uploadedFile" class="flex flex-col items-center gap-5">
            <div
              class="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 flex items-center gap-2 max-w-[200px]"
            >
              <span class="text-[12px] truncate text-gray-700 font-bold">{{
                uploadedFile.name
              }}</span>
            </div>

            <img src="@/assets/check-gradient.svg" alt="Success" class="w-[60px] h-[60px]" />

            <div class="flex flex-col items-center font-semibold text-[16px] leading-[120%]">
              <div class="text-[#111827]">File successfully</div>
              <div class="flex gap-1">
                <span
                  class="bg-[linear-gradient(90.74deg,#3f9760,#d1955f)] bg-clip-text text-transparent"
                  >uploaded</span
                >
                <span class="text-[#111827]">!</span>
              </div>
            </div>
          </div>

          <div v-else class="flex flex-col items-center gap-[30px]">
            <img
              src="@/assets/upload-illustration.svg"
              alt="Upload Files"
              class="w-[140px] h-auto object-contain"
            />

            <div class="flex flex-col items-center gap-[8px] text-[16px] leading-[120%]">
              <div class="flex flex-col items-center gap-[4px]">
                <div class="flex items-center gap-[4px] flex-wrap justify-center text-center">
                  <span class="font-semibold text-[#111827]">Drag & Drop</span>
                  <span
                    class="font-semibold bg-[linear-gradient(90.74deg,#3f9760,#d1955f)] bg-clip-text text-transparent"
                  >
                    {{ fileTypesText }}
                  </span>
                  <span class="font-semibold text-[#111827]">here</span>
                </div>
              </div>

              <div class="flex items-center gap-[4px] text-[12px] mt-1 text-gray-500">
                <span>or</span>
                <span
                  class="underline font-medium bg-[linear-gradient(90.74deg,#3f9760,#d1955f)] bg-clip-text text-transparent cursor-pointer"
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

    <div v-if="errorMessage" class="mt-3 text-[12px] font-semibold text-[#A0453B] text-center">
      {{ errorMessage }}
    </div>
  </div>
</template>

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

const emit = defineEmits(['update:modelValue', 'file-uploaded', 'error'])

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isLoading = ref(false)
const uploadedFile = ref<File | null>(null)
const errorMessage = ref('')

const triggerInput = () => {
  if (fileInputRef.value) fileInputRef.value.click()
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

  const fileSizeMb = file.size / (1024 * 1024)
  if (fileSizeMb > props.maxSizeMb) {
    errorMessage.value = `Ukuran file terlalu besar. Maksimal ${props.maxSizeMb}MB.`
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
