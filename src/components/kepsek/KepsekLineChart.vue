<template>
  <div
    class="
      flex flex-col gap-4
      font-[var(--font-sans)] text-[var(--app-text)]
    "
  >
    <div>
      <h3
        class="
          m-0 text-[length:var(--app-font-sm)]
          font-semibold leading-[1.3] text-[var(--app-heading)]
        "
      >
        {{ title }}
      </h3>

      <p
        v-if="subtitle"
        class="
          mt-1 mb-0 text-[length:var(--app-font-xs)]
          leading-[1.4] text-[var(--app-subtext)]
        "
      >
        {{ subtitle }}
      </p>
    </div>

    <div
      class="w-full"
      :style="{ height: `${resolvedHeight}px` }"
    >
      <Line
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'
import { useThemeColors } from '@/stores/principal_dashboard/themeColors'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

export interface LineItem {
  label: string
  masuk: number
  keluar: number
}

const props = defineProps<{
  title: string
  subtitle?: string
  data: LineItem[]
  chartHeight?: number
}>()

const colors = useThemeColors()

const resolvedHeight = computed(() => props.chartHeight ?? 190)

const readCssLengthAsPx = (variableName: string, fallback: number) => {
  if (typeof window === 'undefined') return fallback

  const rootStyle = getComputedStyle(document.documentElement)
  const rawValue = rootStyle.getPropertyValue(variableName).trim()

  if (!rawValue) return fallback

  const numericValue = Number.parseFloat(rawValue)

  if (Number.isNaN(numericValue)) return fallback

  if (rawValue.endsWith('rem')) {
    const rootFontSize = Number.parseFloat(rootStyle.fontSize) || 16
    return numericValue * rootFontSize
  }

  return numericValue
}

const chartTickFontSize = computed(() => readCssLengthAsPx('--app-font-xs', 12))
const chartLegendFontSize = computed(() => readCssLengthAsPx('--app-font-xs', 12))

const chartData = computed(() => ({
  labels: props.data.map((item) => item.label),
  datasets: [
    {
      label: 'Surat Masuk',
      data: props.data.map((item) => item.masuk),
      borderColor: colors.value.warning,
      backgroundColor: colors.value.warning,
      tension: 0.4,
    },
    {
      label: 'Surat Keluar',
      data: props.data.map((item) => item.keluar),
      borderColor: colors.value.success,
      backgroundColor: colors.value.success,
      tension: 0.4,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        color: colors.value.muted,
        font: {
          size: chartLegendFontSize.value,
        },
      },
    },
    tooltip: {
      enabled: true,
    },
  },
  scales: {
    x: {
      type: 'category',
      grid: {
        display: false,
      },
      ticks: {
        color: colors.value.muted,
        font: {
          size: chartTickFontSize.value,
          weight: 600,
        },
      },
    },
    y: {
      type: 'linear',
      beginAtZero: true,
      grid: {
        color: colors.value.border,
        borderDash: [4, 4],
      },
      ticks: {
        color: colors.value.muted,
        font: {
          size: chartTickFontSize.value,
        },
        stepSize: 10,
      },
    },
  },
}))
</script>