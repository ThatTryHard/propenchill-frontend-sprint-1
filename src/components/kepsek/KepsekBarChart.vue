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

export interface BarItem {
  label: string
  value: number
  color?: string
}

const props = defineProps<{
  title: string
  subtitle?: string
  data: BarItem[]
  chartHeight?: number
}>()

const resolvedHeight = computed(() => props.chartHeight ?? 190)

const chartData = computed(() => ({
  labels: props.data.map((item) => item.label),
  datasets: [
    {
      data: props.data.map((item) => item.value),
      backgroundColor: props.data.map((item) => item.color || '#5b7de1'),
      borderRadius: 4,
      borderSkipped: false,
      barThickness: 24,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
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
