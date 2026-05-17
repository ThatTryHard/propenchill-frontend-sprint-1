<template>
  <div
    class="
      flex h-full flex-col
      font-[var(--font-sans)] text-[var(--app-text)]
    "
  >
    <div class="mb-4 flex items-start justify-between">
      <div>
        <h3
          class="
            m-0 text-[length:var(--app-font-sm)]
            font-semibold leading-[1.3] text-[var(--app-heading)]
          "
        >
          Surat Keluar Tertahan
        </h3>

        <p
          class="
            mt-1 mb-0 text-[length:var(--app-font-xs)]
            leading-[1.4] text-[var(--app-muted)]
          "
        >
          Berdasarkan durasi pengajuan
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
      <div
        v-for="item in durationData"
        :key="item.label"
        :class="[
          'flex w-full flex-1 items-center justify-between',
          'rounded-[12px] px-5 py-3 opacity-80',
          item.cardClass,
        ]"
      >
        <div class="flex items-center gap-3">
          <div
            :class="[
              'h-3 w-3 rounded-full',
              item.dotClass,
            ]"
          ></div>

          <span
            class="
              text-[length:var(--app-font-base)]
              font-semibold leading-[1.3] text-[var(--app-heading)]
            "
          >
            {{ item.label }}
          </span>
        </div>

        <div class="flex items-baseline gap-1">
          <span
            class="
              text-[length:var(--app-font-title)]
              font-bold leading-none text-[var(--app-heading)]
            "
          >
            {{ item.value }}
          </span>

          <span
            class="
              text-[length:var(--app-font-xs)]
              leading-[1.3] text-[var(--app-muted)]
            "
          >
            Surat
          </span>
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
    cardClass: 'bg-[var(--app-success-bg)]',
    dotClass: 'bg-[var(--app-success)]',
  },
  {
    label: '3 - 7 Hari',
    value: props.data.antara_3_7_hari,
    cardClass: 'bg-[var(--app-warning-bg)]',
    dotClass: 'bg-[var(--app-warning)]',
  },
  {
    label: '> 7 Hari',
    value: props.data.lebih_dari_7_hari,
    cardClass: 'bg-[var(--app-danger-bg)]',
    dotClass: 'bg-[var(--app-danger)]',
  },
])
</script>