<template>
  <div class="flex items-center gap-2 text-center text-[14px] text-[#212b36] font-sans">
    <button
      @click="prevPage"
      :disabled="isFirstPage"
      :class="[
        'w-[32px] h-[32px] rounded-[4px] flex items-center justify-center transition-all duration-200',
        isFirstPage
          ? 'bg-[#919eab] opacity-50 cursor-not-allowed text-white' // State Disabled dari Locofy
          : 'bg-white border-2 border-[#dfe3e8] hover:border-[#919eab] text-[#212b36] cursor-pointer',
      ]"
    >
      <ChevronLeftIcon class="w-[18px] h-[18px]" />
    </button>

    <template v-for="(page, index) in paginationRange" :key="index">
      <div
        v-if="page === '...'"
        class="w-[32px] h-[32px] rounded-[4px] bg-white border-2 border-[#dfe3e8] flex items-center justify-center font-bold select-none"
      >
        ...
      </div>

      <button
        v-else-if="page === currentPage"
        class="w-[32px] h-[32px] rounded-[4px] p-[2px] bg-[linear-gradient(90.74deg,#3f9760,#d1955f)] flex items-center justify-center select-none"
      >
        <div class="w-full h-full bg-white rounded-[2px] flex items-center justify-center">
          <span
            class="bg-[linear-gradient(90.74deg,#3f9760,#d1955f)] bg-clip-text text-transparent font-bold leading-[20px]"
          >
            {{ page }}
          </span>
        </div>
      </button>

      <button
        v-else
        @click="goToPage(page)"
        class="w-[32px] h-[32px] rounded-[4px] bg-white border-2 border-[#dfe3e8] hover:border-[#919eab] flex items-center justify-center font-bold leading-[20px] transition-colors duration-200 cursor-pointer select-none"
      >
        {{ page }}
      </button>
    </template>

    <button
      @click="nextPage"
      :disabled="isLastPage"
      :class="[
        'w-[32px] h-[32px] rounded-[4px] flex items-center justify-center transition-all duration-200',
        isLastPage
          ? 'bg-[#919eab] opacity-50 cursor-not-allowed text-white'
          : 'bg-white border-2 border-[#dfe3e8] hover:border-[#919eab] text-[#212b36] cursor-pointer',
      ]"
    >
      <ChevronRightIcon class="w-[18px] h-[18px]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-vue-next'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  // Jumlah halaman tetangga yang ditampilin di sebelah kanan-kiri halaman aktif
  siblingCount: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['update:currentPage', 'page-change'])

const isFirstPage = computed(() => props.currentPage <= 1)
const isLastPage = computed(() => props.currentPage >= props.totalPages)

const prevPage = () => {
  if (!isFirstPage.value) goToPage(props.currentPage - 1)
}

const nextPage = () => {
  if (!isLastPage.value) goToPage(props.currentPage + 1)
}

const goToPage = (page: number | string) => {
  if (typeof page === 'number' && page !== props.currentPage) {
    emit('update:currentPage', page) // Support buat v-model
    emit('page-change', page) // Support buat hit API setiap ganti halaman
  }
}

// Algoritma Pintar buat Generate Pagination (Angka & Elipsis)
const paginationRange = computed(() => {
  const totalPageNumbers = props.siblingCount + 5

  // Kalau total halamannya dikit, tampilin semua angkanya
  if (totalPageNumbers >= props.totalPages) {
    return range(1, props.totalPages)
  }

  const leftSiblingIndex = Math.max(props.currentPage - props.siblingCount, 1)
  const rightSiblingIndex = Math.min(props.currentPage + props.siblingCount, props.totalPages)

  const shouldShowLeftDots = leftSiblingIndex > 2
  const shouldShowRightDots = rightSiblingIndex < props.totalPages - 2

  const firstPageIndex = 1
  const lastPageIndex = props.totalPages

  // Kasus 1: Titik-titik cuma ada di kanan [1, 2, 3, 4, 5, '...', 10]
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * props.siblingCount
    const leftRange = range(1, leftItemCount)
    return [...leftRange, '...', props.totalPages]
  }

  // Kasus 2: Titik-titik cuma ada di kiri [1, '...', 6, 7, 8, 9, 10]
  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * props.siblingCount
    const rightRange = range(props.totalPages - rightItemCount + 1, props.totalPages)
    return [firstPageIndex, '...', ...rightRange]
  }

  // Kasus 3: Titik-titik ada di kiri dan kanan [1, '...', 4, 5, 6, '...', 10]
  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = range(leftSiblingIndex, rightSiblingIndex)
    return [firstPageIndex, '...', ...middleRange, '...', lastPageIndex]
  }

  return []
})

const range = (start: number, end: number) => {
  const length = end - start + 1
  return Array.from({ length }, (_, idx) => idx + start)
}
</script>
