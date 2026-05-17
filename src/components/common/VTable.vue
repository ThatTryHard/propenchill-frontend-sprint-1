<script setup lang="ts">
export interface TableColumn {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
  nowrap?: boolean
}

withDefaults(
  defineProps<{
    columns: TableColumn[]
    rows: any[]
    isLoading?: boolean
    loadingMessage?: string
    emptyMessage?: string
  }>(),
  {
    isLoading: false,
    loadingMessage: 'Memuat data...',
    emptyMessage: 'Tidak ada data yang tersedia.',
  },
)

const getAlignClass = (align?: 'left' | 'center' | 'right') => {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  return 'text-left'
}
</script>

<template>
  <div
    class="
      w-full overflow-hidden rounded-[14px]
      border border-[var(--app-card-border)]
      bg-[var(--app-card)] text-[var(--app-text)]
      shadow-[0_1px_2px_rgba(15,23,42,0.06)]
    "
  >
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-left">
        <thead>
          <tr
            class="
              border-b border-[var(--app-card-border)]
              bg-[var(--app-table-head-bg)]
            "
          >
            <th
              v-for="(col, index) in columns"
              :key="index"
              :class="[
                'px-[18px] py-[9px]',
                'text-[length:var(--app-table-head-font)] font-semibold leading-[1.25]',
                'tracking-[0.05em] text-[var(--app-muted)] uppercase',
                getAlignClass(col.align),
                { 'whitespace-nowrap': col.nowrap !== false },
              ]"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-if="isLoading">
            <td
              :colspan="columns.length"
              class="
                px-[18px] py-7 text-center
                text-[length:var(--app-table-state-font)]
                text-[var(--app-muted)]
              "
            >
              <slot name="loading">
                <div class="flex flex-col items-center justify-center gap-2">
                  <div
                    class="
                      h-5 w-5 rounded-full
                      border-[3px] border-[var(--app-accent)]
                      border-t-transparent
                      animate-[v-table-spin_0.8s_linear_infinite]
                    "
                  ></div>

                  <span>{{ loadingMessage }}</span>
                </div>
              </slot>
            </td>
          </tr>

          <tr v-else-if="!rows || rows.length === 0">
            <td
              :colspan="columns.length"
              class="
                px-[18px] py-7 text-center
                text-[length:var(--app-table-state-font)]
                text-[var(--app-muted)]
              "
            >
              <slot name="empty">
                {{ emptyMessage }}
              </slot>
            </td>
          </tr>

          <tr
            v-for="(row, rowIndex) in rows"
            v-else
            :key="row.id ?? rowIndex"
            class="
              border-b border-[var(--app-card-border)]
              transition-colors duration-200 ease-in-out
              hover:bg-[var(--app-table-row-hover)]
            "
          >
            <td
              v-for="(col, colIndex) in columns"
              :key="colIndex"
              :class="[
                'px-[18px] py-[9px]',
                'text-[length:var(--app-table-cell-font)] leading-[1.35]',
                'text-[var(--app-subtext)]',
                getAlignClass(col.align),
              ]"
            >
              <slot
                :name="`cell-${col.key}`"
                :row="row"
                :index="rowIndex"
                :value="row[col.key]"
              >
                {{ row[col.key] || '-' }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>