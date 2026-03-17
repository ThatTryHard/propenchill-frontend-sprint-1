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

    <div class="w-full mt-4 flex flex-col gap-4">
      <div class="w-full">
        <div
          class="max-h-[250px] overflow-y-auto border border-[#d4e8da] rounded-xl text-left bg-white shadow-sm"
        >
          <table class="w-full text-[12px] text-gray-700 whitespace-nowrap">
            <thead class="bg-[#f0f7f2] text-[#3f9760] sticky top-0 border-b border-[#d4e8da]">
              <tr>
                <th class="py-2 px-3 font-semibold">NISN</th>
                <th class="py-2 px-3 font-semibold">Nomor Induk</th>
                <th class="py-2 px-3 font-semibold">Nama Lengkap</th>
                <th class="py-2 px-3 font-semibold">Kelas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(student, idx) in previewData" :key="idx" class="hover:bg-gray-50">
                <td class="py-2 px-3">{{ student.nisn || '-' }}</td>
                <td class="py-2 px-3">{{ student.nis }}</td>
                <td class="py-2 px-3">{{ student.nama }}</td>
                <td class="py-2 px-3">{{ student.kelas }}</td>
              </tr>
              <tr v-if="previewData.length === 0">
                <td colspan="4" class="py-4 text-center text-gray-500 font-medium">
                  Belum ada data siswa.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-[11px] text-gray-500 mt-2 italic">
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

// Ambil maksimal 5 data pertama dari store untuk di-preview
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
