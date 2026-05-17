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
          leading-[1.4] text-[var(--app-muted)]
        "
      >
        {{ subtitle }}
      </p>
    </div>

    <div
      v-if="total === 0"
      class="
        text-[length:var(--app-font-xs)]
        leading-[1.4] text-[var(--app-muted)]
      "
    >
      Tidak ada data untuk ditampilkan.
    </div>

    <div
      v-else
      class="
        flex items-center gap-6
        max-[640px]:flex-col max-[640px]:items-start
      "
    >
      <div :style="{ height: `${resolvedSize}px`, width: `${resolvedSize}px` }">
        <Pie
          :data="chartData"
          :options="chartOptions"
        />
      </div>

      <div
        class="
          flex flex-col gap-2
          text-[length:var(--app-font-xs)]
          leading-[1.4] text-[var(--app-muted)]
        "
      >
        <div
          v-for="item in data"
          :key="item.label"
          class="flex items-center gap-2"
        >
          <span
            class="h-2.5 w-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: item.color }"
          ></span>

          <span class="font-semibold text-[var(--app-text)]">
            {{ item.label }}
          </span>

          <span class="text-[var(--app-muted)]">
            {{ item.value }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export interface PieItem {
  label: string
  value: number
  color: string
}

const props = defineProps<{
  title: string
  subtitle?: string
  data: PieItem[]
  chartSize?: number
}>()

const resolvedSize = computed(() => props.chartSize ?? 140)

const total = computed(() =>
  props.data.reduce((accumulator, item) => accumulator + Math.max(0, item.value), 0),
)

const chartData = computed(() => ({
  labels: props.data.map((item) => item.label),
  datasets: [
    {
      data: props.data.map((item) => item.value),
      backgroundColor: props.data.map((item) => item.color),
      borderWidth: 0,
    },
  ],
}))

const chartOptions = computed<ChartOptions<'pie'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
    },
  },
}))
</script>