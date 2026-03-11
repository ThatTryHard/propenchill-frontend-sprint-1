<template>
  <div
    class="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden w-full shadow-sm font-sans"
  >
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b border-[#e2e8f0] bg-[#f8fafc]">
            <th
              v-for="(col, index) in columns"
              :key="index"
              class="px-6 py-4 text-[13px] font-semibold text-[#718096] uppercase tracking-wider whitespace-nowrap"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="isLoading">
            <td :colspan="columns.length" class="px-6 py-12 text-center text-[#718096]">
              <div class="flex flex-col items-center justify-center gap-2">
                <div
                  class="w-6 h-6 border-4 border-[#3f9760] border-t-transparent rounded-full animate-spin"
                ></div>
                <span>Memuat data...</span>
              </div>
            </td>
          </tr>

          <tr v-else-if="!rows || rows.length === 0">
            <td :colspan="columns.length" class="px-6 py-12 text-center text-[#718096]">
              Tidak ada data yang tersedia.
            </td>
          </tr>

          <tr
            v-else
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            class="border-b border-[#f1f5f9] hover:bg-[#f8fafc] transition-colors"
          >
            <td
              v-for="(col, colIndex) in columns"
              :key="colIndex"
              class="px-6 py-4 text-[14px] text-[#4a5568]"
            >
              <slot :name="`cell-${col.key}`" :row="row" :index="rowIndex" :value="row[col.key]">
                <span :class="col.key === 'nama' ? 'font-medium text-[#1a202c]' : ''">
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
