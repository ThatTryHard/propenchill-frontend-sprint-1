<template>
  <div class="flex flex-col gap-4">
    <div>
      <h3 class="text-[14px] font-semibold text-[#111827]">
        {{ title }}
      </h3>
      <p v-if="subtitle" class="text-[11px] text-[#94a3b8]">
        {{ subtitle }}
      </p>
    </div>

    <div :style="{ height: `${resolvedHeight}px` }">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'



ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export interface GroupedBarItem {
  label: string
  masuk: number
  keluar: number
}

const props = defineProps<{
  title: string
  subtitle?: string
  data: GroupedBarItem[]
  chartHeight?: number
}>()

const resolvedHeight = computed(() => props.chartHeight ?? 190)

const chartData = computed(() => ({
  labels: props.data.map((item) => item.label),
  datasets: [
    {
      label: 'Surat Masuk',
      data: props.data.map((item) => item.masuk),
      backgroundColor: '#66b47d',
      borderRadius: 4,
      borderSkipped: false,
      barThickness: 12,
    },
    {
      label: 'Surat Keluar',
      data: props.data.map((item) => item.keluar),
      backgroundColor: '#d2a16b',
      borderRadius: 4,
      borderSkipped: false,
      barThickness: 12,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#94a3b8',
        boxWidth: 8,
        boxHeight: 8,
        font: { size: 10, weight: 600 },
      },
    },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      type: 'category',
      grid: { display: false },
      ticks: {
        color: '#858a91',
        font: { size: 12, weight: 600 },
      },
    },
    y: {
      type: 'linear',
      beginAtZero: true,
      grid: { color: '#e2e8f0', borderDash: [4, 4] },
      ticks: {
        color: '#858a91',
        font: { size: 12 },
        stepSize: 10,
      },
    },
  },
}))
</script>
