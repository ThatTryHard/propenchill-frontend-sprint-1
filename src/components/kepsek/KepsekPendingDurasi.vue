<template>
  <div class="flex flex-col h-full">
    <!-- Header with matching sizes -->
    <div class="flex justify-between items-start mb-4">
      <div>
        <h3 class="text-[14px] font-semibold text-[var(--app-heading)]">
          Surat Keluar Tertahan
        </h3>
        <p class="text-[11px] text-[var(--app-muted)]">
          Berdasarkan durasi pengajuan
        </p>
      </div>
      <div class="text-right">
        <span class="text-[20px] font-bold text-[var(--app-heading)] leading-none">{{ totalPending }}</span>
        <p class="text-[9px] font-bold text-[var(--app-muted)] uppercase tracking-tighter">Total Pending</p>
      </div>
    </div>

    <!-- Content: Static Cards -->
    <div class="flex flex-col gap-3 flex-1 h-full">
      <div 
        v-for="item in durationData" 
        :key="item.label"
        class="w-full flex-1 flex items-center justify-between px-5 py-3 rounded-[12px] opacity-80"
        :style="{ backgroundColor: item.bgColor }"
      >
        <div class="flex items-center gap-3">
          <div 
            class="w-3 h-3 rounded-full" 
            :style="{ backgroundColor: item.color }"
          ></div>
          <span class="text-[15px] font-semibold text-[var(--app-heading)]">{{ item.label }}</span>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="text-[24px] font-bold leading-none text-[var(--app-heading)]">{{ item.value }}</span>
          <span class="text-[12px] text-[var(--app-muted)]">Surat</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  data: {
    kurang_dari_3_hari: number
    antara_3_7_hari: number
    lebih_dari_7_hari: number
    total_pending: number
  }
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
</script>
