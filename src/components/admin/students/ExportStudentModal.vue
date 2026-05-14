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
        <div
          class="max-h-[250px] overflow-y-auto rounded-xl border border-[var(--app-card-border)] bg-[var(--app-card)] text-left shadow-sm"
        >
          <table class="w-full whitespace-nowrap text-[0.85rem] text-[var(--app-text)]">
            <thead
              class="sticky top-0 border-b border-[var(--app-card-border)] bg-[var(--app-table-head-bg)] text-[var(--app-accent)]"
            >
              <tr>
                <th class="px-3 py-2 text-left font-semibold">NISN</th>
                <th class="px-3 py-2 text-left font-semibold">Nomor Induk</th>
                <th class="px-3 py-2 text-left font-semibold">Nama Lengkap</th>
                <th class="px-3 py-2 text-left font-semibold">Kelas</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-[var(--app-card-border)]">
              <tr
                v-for="(student, idx) in previewData"
                :key="idx"
                class="transition-colors hover:bg-[var(--app-table-row-hover)]"
              >
                <td class="px-3 py-2">{{ student.nisn || '-' }}</td>
                <td class="px-3 py-2">{{ student.nis }}</td>
                <td class="px-3 py-2">{{ student.nama }}</td>
                <td class="px-3 py-2">{{ student.kelas }}</td>
              </tr>

              <tr v-if="previewData.length === 0">
                <td colspan="4" class="px-3 py-4 text-center font-medium text-[var(--app-muted)]">
                  Belum ada data siswa.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-2 text-[0.78rem] italic text-[var(--app-muted)]">
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

const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['update:isOpen'])
const studentStore = useStudentStore()

const isLoading = ref(false)
const alert = ref({ show: false, type: 'information', message: '' })

const showAlert = (type: string, message: string) => {
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
  } catch (error) {
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
