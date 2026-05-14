<template>
  <div class="flex flex-col h-full gap-4">
    <!-- Header with matching sizes -->
    <div class="flex justify-between items-start mb-2">
      <div>
        <h3 class="text-[14px] font-semibold text-[var(--app-heading)]">
          Surat Pending Berdasarkan Durasi
        </h3>
        <p class="text-[11px] text-[var(--app-muted)]">
          Pilih durasi untuk memfilter tabel
        </p>
      </div>
      <div class="text-right">
        <span class="text-[20px] font-bold text-[var(--app-heading)] leading-none">{{ totalPending }}</span>
        <p class="text-[9px] font-bold text-[var(--app-muted)] uppercase tracking-tighter">Total Pending</p>
      </div>
    </div>

    <!-- Content: Interactive Cards -->
    <div class="flex flex-col gap-3 flex-1 h-full">
      <button 
        v-for="item in durationData" 
        :key="item.label"
        @click="toggleSelection(item.label)"
        :class="[
          'w-full flex-1 flex items-center justify-between px-5 rounded-[12px] border-2 transition-all cursor-pointer',
          modelValue === item.label 
            ? 'opacity-100 shadow-[0_4px_12px_rgba(0,0,0,0.1)] font-bold' 
            : 'opacity-70 hover:opacity-100'
        ]"
        :style="{
          backgroundColor: modelValue === item.label ? item.color : item.bgColor,
          borderColor: modelValue === item.label ? item.color : 'transparent'
        }"
      >
        <div class="flex items-center gap-3">
          <div v-if="modelValue !== item.label" class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></div>
          <span class="text-[15px] font-semibold" :style="{ color: modelValue === item.label ? '#fff' : 'var(--app-heading)' }">
            {{ item.label }}
          </span>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-[24px] font-bold leading-none" :style="{ color: modelValue === item.label ? '#fff' : 'var(--app-heading)' }">{{ item.value }}</span>
          <span class="text-[12px]" :style="{ color: modelValue === item.label ? 'rgba(255,255,255,0.9)' : 'var(--app-muted)' }">Surat</span>
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
    color: 'var(--app-success)', // Green
    bgColor: 'var(--app-success-bg)',
  },
  {
    label: '3 - 7 Hari',
    value: props.data.antara_3_7_hari,
    color: 'var(--app-warning)', // Orange/Yellow
    bgColor: 'var(--app-warning-bg)',
  },
  {
    label: '> 7 Hari',
    value: props.data.lebih_dari_7_hari,
    color: 'var(--app-danger)', // Red
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
