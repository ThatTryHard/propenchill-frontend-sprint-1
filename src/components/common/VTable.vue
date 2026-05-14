<template>
  <div
    class="bg-[var(--app-card)] rounded-2xl border border-[var(--app-card-border)] overflow-hidden w-full shadow-sm font-sans text-[var(--app-text)]"
  >
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-[var(--app-card-border)] bg-[var(--app-table-head-bg)]">
            <th
              v-for="(col, index) in columns"
              :key="index"
              class="px-6 py-4 text-[13px] font-semibold text-[var(--app-muted)] uppercase tracking-wider whitespace-nowrap"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="isLoading">
            <td :colspan="columns.length" class="px-6 py-12 text-center text-[var(--app-muted)]">
              <div class="flex flex-col items-center justify-center gap-2">
                <div
                  class="w-6 h-6 border-4 border-[var(--app-accent)] border-t-transparent rounded-full animate-spin"
                ></div>
                <span>Memuat data...</span>
              </div>
            </td>
          </tr>

          <tr v-else-if="!rows || rows.length === 0">
            <td :colspan="columns.length" class="px-6 py-12 text-center text-[var(--app-muted)]">
              Tidak ada data yang tersedia.
            </td>
          </tr>

          <tr
            v-else
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            class="border-b border-[var(--app-card-border)] hover:bg-[var(--app-table-row-hover)] transition-colors"
          >
            <td
              v-for="(col, colIndex) in columns"
              :key="colIndex"
              class="px-6 py-4 text-[14px] text-[var(--app-subtext)]"
            >
              <slot :name="`cell-${col.key}`" :row="row" :index="rowIndex" :value="row[col.key]">
                <span :class="col.key === 'nama' ? 'font-medium text-[var(--app-text)]' : ''">
                  {{ row[col.key] || '-' }}
                </span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface TableColumn {
  key: string
  label: string
}

defineProps<{
  columns: TableColumn[]
  rows: any[]
  isLoading?: boolean
}>()
</script>