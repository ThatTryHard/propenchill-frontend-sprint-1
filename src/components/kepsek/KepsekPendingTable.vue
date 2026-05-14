<template>
  <div class="overflow-hidden rounded-[18px] border border-[var(--app-border)] bg-[var(--app-card)]">
    <div class="overflow-x-auto">
      <table class="w-full text-center text-[16px]">
        <thead class="bg-[var(--app-table-head-bg)] text-[var(--app-heading)]">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-6 py-4 text-[13px] font-semibold text-[var(--app-muted)] uppercase tracking-wider whitespace-nowrap"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td :colspan="columns.length" class="px-4 py-6 text-center text-[var(--app-muted)]">
              Memuat data...
            </td>
          </tr>
          <tr v-else-if="rows.length === 0">
            <td :colspan="columns.length" class="px-4 py-6 text-center text-[var(--app-muted)]">
              Tidak ada data yang tersedia.
            </td>
          </tr>
          <tr
            v-else
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            :class="[
              'h-[40px] border-t border-[var(--app-border)] text-[var(--app-heading)]',
              rowIndex % 2 === 1 ? 'bg-[var(--app-table-row-hover)]' : 'bg-[var(--app-card)]',
            ]"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="column.tdClass || 'px-6 py-4 font-semibold'"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ row[column.key] ?? '-' }}
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
  tdClass?: string
}

defineProps<{
  columns: TableColumn[]
  rows: Array<Record<string, unknown>>
  isLoading?: boolean
}>()
</script>
