<template>
  <div class="overflow-hidden rounded-[18px] border border-[#d9e5db] bg-white">
    <div class="overflow-x-auto">
      <table class="w-full text-center text-[16px]">
        <thead class="bg-[#c7e1d0] text-[#111827]">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="h-[80px] px-[8px] py-[13px] font-bold"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td :colspan="columns.length" class="px-4 py-6 text-center text-[#94a3b8]">
              Memuat data...
            </td>
          </tr>
          <tr v-else-if="rows.length === 0">
            <td :colspan="columns.length" class="px-4 py-6 text-center text-[#94a3b8]">
              Tidak ada data yang tersedia.
            </td>
          </tr>
          <tr
            v-else
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            :class="[
              'h-[40px] border-t border-[#edf2ee] text-[#111827]',
              rowIndex % 2 === 1 ? 'bg-[#f8f9fc]' : 'bg-white',
            ]"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              class="px-[8px] py-[10px] font-semibold"
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
}

defineProps<{
  columns: TableColumn[]
  rows: Array<Record<string, unknown>>
  isLoading?: boolean
}>()
</script>
