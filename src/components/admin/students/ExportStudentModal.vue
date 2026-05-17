<template>
  <VModal
    :isOpen="isOpen"
    title="Preview Export Data"
    description="Berikut adalah preview data yang akan diunduh ke dalam format Excel (.xlsx)."
    maxWidthClass="max-w-[650px]"
    :buttons="modalButtons"
    @update:isOpen="$emit('update:isOpen', $event)"
  >
    <VAlert
      v-if="alert.show"
      :type="alert.type"
      :message="alert.message"
      @close="alert.show = false"
    />

    <div class="mt-4 flex w-full flex-col gap-4">
      <div class="w-full">
        <div class="max-h-[250px] overflow-y-auto rounded-[14px]">
          <VTable
            :columns="tableColumns"
            :rows="previewData"
            empty-message="Belum ada data siswa."
          >
            <template #cell-nisn="{ row }">
              <span class="text-[length:var(--app-table-cell-font)] leading-[1.35] text-[var(--app-subtext)]">
                {{ row.nisn || '-' }}
              </span>
            </template>

            <template #cell-nis="{ row }">
              <span class="text-[length:var(--app-table-cell-font)] leading-[1.35] text-[var(--app-subtext)]">
                {{ row.nis || '-' }}
              </span>
            </template>

            <template #cell-nama="{ row }">
              <span class="text-[length:var(--app-table-cell-font)] font-medium leading-[1.35] text-[var(--app-heading)]">
                {{ row.nama || '-' }}
              </span>
            </template>

            <template #cell-kelas="{ row }">
              <span class="text-[length:var(--app-table-cell-font)] leading-[1.35] text-[var(--app-subtext)]">
                {{ row.kelas || '-' }}
              </span>
            </template>
          </VTable>
        </div>

        <p
          class="
            mt-2 mb-0 text-[length:var(--app-font-xs)]
            italic leading-[1.4] text-[var(--app-muted)]
          "
        >
          *Menampilkan maksimal 5 baris pertama sebagai preview.
        </p>
      </div>
    </div>
  </VModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStudentStore } from '@/stores/students'
import VModal from '@/components/common/VModal.vue'
import VAlert from '@/components/common/VAlert.vue'
import VTable from '@/components/common/VTable.vue'

type AlertType = 'success' | 'error' | 'warning' | 'information'

defineProps({
  isOpen: Boolean,
})

const emit = defineEmits(['update:isOpen'])
const studentStore = useStudentStore()

const isLoading = ref(false)

const alert = ref<{
  show: boolean
  type: AlertType
  message: string
}>({
  show: false,
  type: 'information',
  message: '',
})

const tableColumns = [
  {
    key: 'nisn',
    label: 'NISN',
    align: 'left' as const,
  },
  {
    key: 'nis',
    label: 'Nomor Induk',
    align: 'left' as const,
  },
  {
    key: 'nama',
    label: 'Nama Lengkap',
    align: 'left' as const,
  },
  {
    key: 'kelas',
    label: 'Kelas',
    align: 'left' as const,
  },
]

const showAlert = (type: AlertType, message: string) => {
  alert.value = { show: true, type, message }

  setTimeout(() => {
    alert.value.show = false
  }, 4000)
}

const previewData = computed(() => {
  return studentStore.students.slice(0, 5)
})

const handleExport = async () => {
  isLoading.value = true

  try {
    await studentStore.exportStudents()
    showAlert('success', 'File Excel berhasil diunduh!')

    setTimeout(() => {
      emit('update:isOpen', false)
    }, 1500)
  } catch {
    showAlert('error', 'Gagal mengunduh file Excel.')
  } finally {
    isLoading.value = false
  }
}

const modalButtons = computed(() => [
  {
    label: 'Batal',
    variant: 'secondary' as const,
    action: () => emit('update:isOpen', false),
  },
  {
    label: isLoading.value ? 'Mendownload...' : 'Unduh Excel',
    variant: 'primary' as const,
    action: handleExport,
  },
])
</script>