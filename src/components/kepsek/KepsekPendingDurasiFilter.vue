<template>
  <div
    class="
      flex h-full flex-col gap-4
      font-[var(--font-sans)] text-[var(--app-text)]
    "
  >
    <div class="mb-2 flex items-start justify-between">
      <div>
        <h3
          class="
            m-0 text-[length:var(--app-font-sm)]
            font-semibold leading-[1.3] text-[var(--app-heading)]
          "
        >
          Surat Pending Berdasarkan Durasi
        </h3>

        <p
          class="
            mt-1 mb-0 text-[length:var(--app-font-xs)]
            leading-[1.4] text-[var(--app-muted)]
          "
        >
          Pilih durasi untuk memfilter tabel
        </p>
      </div>

      <div class="text-right">
        <span
          class="
            block text-[length:var(--app-font-xl)]
            font-bold leading-none text-[var(--app-heading)]
          "
        >
          {{ totalPending }}
        </span>

        <p
          class="
            mt-1 mb-0 text-[length:var(--app-font-caption)]
            font-bold uppercase leading-[1.2] tracking-tight
            text-[var(--app-muted)]
          "
        >
          Total Pending
        </p>
      </div>
    </div>

    <div class="flex h-full flex-1 flex-col gap-3">
      <button
        v-for="item in durationData"
        :key="item.label"
        type="button"
        :class="[
          'flex w-full flex-1 cursor-pointer items-center justify-between',
          'rounded-[12px] border-2 px-5 transition-all',
          'focus:outline-none focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]',
          modelValue === item.label
            ? 'opacity-100 shadow-[0_4px_12px_rgba(0,0,0,0.1)]'
            : 'opacity-70 hover:opacity-100',
        ]"
        :style="{
          backgroundColor: modelValue === item.label ? item.color : item.bgColor,
          borderColor: modelValue === item.label ? item.color : 'transparent',
        }"
        @click="toggleSelection(item.label)"
      >
        <div class="flex items-center gap-3">
          <div
            v-if="modelValue !== item.label"
            class="h-3 w-3 rounded-full"
            :style="{ backgroundColor: item.color }"
          ></div>

          <span
            :class="[
              'text-[length:var(--app-font-base)] font-semibold leading-[1.3]',
              modelValue === item.label
                ? 'text-[var(--app-text-inverse)]'
                : 'text-[var(--app-heading)]',
            ]"
          >
            {{ item.label }}
          </span>
        </div>

        <div class="flex items-baseline gap-1">
          <span
            :class="[
              'text-[length:var(--app-font-title)] font-bold leading-none',
              modelValue === item.label
                ? 'text-[var(--app-text-inverse)]'
                : 'text-[var(--app-heading)]',
            ]"
          >
            {{ item.value }}
          </span>

          <span
            :class="[
              'text-[length:var(--app-font-xs)] leading-[1.3]',
              modelValue === item.label
                ? 'text-[var(--app-text-inverse-muted)]'
                : 'text-[var(--app-muted)]',
            ]"
          >
            Surat
          </span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  data: {
    kurang_dari_3_hari: number
    antara_3_7_hari: number
    lebih_dari_7_hari: number
    total_pending: number
  }
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const totalPending = computed(() => props.data.total_pending || 0)

const durationData = computed(() => [
  {
    label: '< 3 Hari',
    value: props.data.kurang_dari_3_hari,
    color: 'var(--app-success)',
    bgColor: 'var(--app-success-bg)',
  },
  {
    label: '3 - 7 Hari',
    value: props.data.antara_3_7_hari,
    color: 'var(--app-warning)',
    bgColor: 'var(--app-warning-bg)',
  },
  {
    label: '> 7 Hari',
    value: props.data.lebih_dari_7_hari,
    color: 'var(--app-danger)',
    bgColor: 'var(--app-danger-bg)',
  },
])

const toggleSelection = (label: string) => {
  if (props.modelValue === label) {
    emit('update:modelValue', '')
  } else {
    emit('update:modelValue', label)
  }
}
</script>