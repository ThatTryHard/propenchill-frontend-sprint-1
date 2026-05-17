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
    emit('update:currentPage', page)
    emit('page-change', page)
  }
}

const paginationRange = computed(() => {
  const totalPageNumbers = props.siblingCount + 5

  if (totalPageNumbers >= props.totalPages) {
    return range(1, props.totalPages)
  }

  const leftSiblingIndex = Math.max(props.currentPage - props.siblingCount, 1)
  const rightSiblingIndex = Math.min(props.currentPage + props.siblingCount, props.totalPages)

  const shouldShowLeftDots = leftSiblingIndex > 2
  const shouldShowRightDots = rightSiblingIndex < props.totalPages - 2

  const firstPageIndex = 1
  const lastPageIndex = props.totalPages

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * props.siblingCount
    const leftRange = range(1, leftItemCount)
    return [...leftRange, '...', props.totalPages]
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * props.siblingCount
    const rightRange = range(props.totalPages - rightItemCount + 1, props.totalPages)
    return [firstPageIndex, '...', ...rightRange]
  }

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

const basePageClass = [
  'relative box-border h-8 w-8 shrink-0 rounded-[4px]',
  'font-[var(--font-sans)] text-[length:var(--app-font-base)] font-bold leading-[20px]',
  'transition-[background-color,border-color,color,opacity,filter] duration-200 ease-in-out',
]

const defaultPageClass = [
  ...basePageClass,
  'flex items-center justify-center border-2 border-[var(--app-card-border)]',
  'bg-[var(--app-card)] text-[var(--app-text)]',
]

const hoverablePageClass = [
  ...defaultPageClass,
  'cursor-pointer hover:border-[var(--app-muted)] hover:bg-[var(--app-soft-card)]',
]

const disabledPageClass = [
  ...basePageClass,
  'flex cursor-not-allowed items-center justify-center border-2 border-transparent',
  'bg-[var(--app-muted)] text-[var(--app-text-inverse)] opacity-50',
]

const activePageClass = [
  ...basePageClass,
  'flex cursor-default items-center justify-center border-0 p-0.5',
  '[background:var(--gradient-brand)] text-[var(--app-text)]',
]
</script>

<template>
  <nav
    class="
      flex items-center gap-2 text-center
      font-[var(--font-sans)] text-[length:var(--app-font-base)]
      text-[var(--app-text)]
    "
    aria-label="Pagination"
  >
    <button
      type="button"
      :class="isFirstPage ? disabledPageClass : hoverablePageClass"
      :disabled="isFirstPage"
      aria-label="Halaman sebelumnya"
      @click="prevPage"
    >
      <ChevronLeftIcon class="h-[18px] w-[18px]" />
    </button>

    <template
      v-for="(page, index) in paginationRange"
      :key="index"
    >
      <div
        v-if="page === '...'"
        :class="[
          ...defaultPageClass,
          'select-none',
        ]"
        aria-hidden="true"
      >
        ...
      </div>

      <button
        v-else-if="page === currentPage"
        type="button"
        :class="activePageClass"
        aria-current="page"
      >
        <span
          class="
            flex h-full w-full items-center justify-center
            rounded-[2px] bg-[var(--app-card)]
          "
        >
          <span class="app-gradient-text-brand font-bold leading-[20px]">
            {{ page }}
          </span>
        </span>
      </button>

      <button
        v-else
        type="button"
        :class="hoverablePageClass"
        @click="goToPage(page)"
      >
        {{ page }}
      </button>
    </template>

    <button
      type="button"
      :class="isLastPage ? disabledPageClass : hoverablePageClass"
      :disabled="isLastPage"
      aria-label="Halaman berikutnya"
      @click="nextPage"
    >
      <ChevronRightIcon class="h-[18px] w-[18px]" />
    </button>
  </nav>
</template>