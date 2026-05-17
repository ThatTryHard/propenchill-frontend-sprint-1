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
      <Bar
        :data="chartData"
        :options="chartOptions"
      />
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
import { useThemeColors } from '@/stores/principal_dashboard/themeColors'

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
const chartLegendFontSize = computed(() => readCssLengthAsPx('--app-font-caption', 10))

const chartData = computed(() => ({
  labels: props.data.map((item) => item.label),
  datasets: [
    {
      label: 'Surat Masuk',
      data: props.data.map((item) => item.masuk),
      backgroundColor: colors.value.success,
      borderRadius: 4,
      borderSkipped: false,
      barThickness: 12,
    },
    {
      label: 'Surat Keluar',
      data: props.data.map((item) => item.keluar),
      backgroundColor: colors.value.accent2,
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
        color: colors.value.muted,
        boxWidth: 8,
        boxHeight: 8,
        font: {
          size: chartLegendFontSize.value,
          weight: 600,
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