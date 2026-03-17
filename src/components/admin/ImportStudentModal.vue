<template>
  <VModal
    :isOpen="isOpen"
    :title="step === 1 ? 'Import Data Siswa' : 'Preview Data'"
    :description="
      step === 1
        ? 'Unggah file Excel (.xlsx) untuk menambahkan data secara massal.'
        : 'Pastikan 5 baris pertama data ini sudah benar sebelum disimpan.'
    "
    :maxWidthClass="step === 1 ? 'max-w-[340px]' : 'max-w-[650px]'"
    :buttons="modalButtons"
    @update:isOpen="$emit('update:isOpen', $event)"
    @close="resetModal"
  >
    <div class="w-full mt-4 flex flex-col gap-4">
      <div v-if="step === 1">
        <VInputFile
          v-model="selectedFile"
          accept=".xlsx"
          :maxSizeMb="5"
          fileTypesText="your spreadsheet or .xlsx"
          @error="handleFileError"
          @file-uploaded="generatePreview"
        />
      </div>

      <div v-if="step === 2" class="w-full">
        <div
          class="max-h-[250px] overflow-y-auto border border-[#d4e8da] rounded-xl text-left bg-white shadow-sm"
        >
          <table class="w-full text-[12px] text-gray-700 whitespace-nowrap">
            <thead class="bg-[#f0f7f2] text-[#3f9760] sticky top-0 border-b border-[#d4e8da]">
              <tr>
                <th
                  v-for="(header, index) in previewHeaders"
                  :key="index"
                  class="py-2 px-3 font-semibold"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(row, rowIndex) in previewRows" :key="rowIndex" class="hover:bg-gray-50">
                <td v-for="(col, colIndex) in previewHeaders" :key="colIndex" class="py-2 px-3">
                  {{ row[col] || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-[11px] text-gray-500 mt-2 italic">
          *Hanya menampilkan maksimal 5 baris pertama
        </p>
      </div>

      <div v-if="importErrors.length > 0" class="w-full mt-2">
        <div class="bg-[#f9eaea] p-2 rounded-t-lg border border-[#d97d7d] border-b-0">
          <h3 class="text-[12px] font-bold text-[#b42318]">
            ⚠️ {{ importErrors.length }} error pada baris Excel:
          </h3>
        </div>
        <div
          class="max-h-32 overflow-y-auto border border-[#d97d7d] rounded-b-lg text-left bg-white"
        >
          <table class="w-full text-[12px] text-gray-700">
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(err, idx) in importErrors" :key="idx">
                <td class="py-1 px-2 font-bold text-[#b42318] w-16">#{{ err.row }}</td>
                <td class="py-1 px-2">{{ err.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </VModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import * as xlsx from 'xlsx' // Import library pembaca excel
import { useStudentStore } from '@/stores/students'
import VModal from '@/components/common/VModal.vue'
import VInputFile from '@/components/common/VInputFile.vue'
import VAlert from '@/components/common/VAlert.vue'

const props = defineProps({ isOpen: Boolean })
const emit = defineEmits(['update:isOpen', 'imported'])
const studentStore = useStudentStore()

const step = ref(1)
const selectedFile = ref<File | null>(null)
const isLoading = ref(false)
const importErrors = ref<any[]>([])

// State buat Preview
const previewHeaders = ref<string[]>([])
const previewRows = ref<any[]>([])

// State buat Alert pengganti Sonner
const alert = ref({ show: false, type: 'information', message: '' })

const showAlert = (type: string, message: string) => {
  alert.value = { show: true, type, message }
  setTimeout(() => {
    alert.value.show = false
  }, 4000) // Auto close 4 detik
}

const handleFileError = (msg: string) => {
  showAlert('error', msg)
}

const resetModal = () => {
  step.value = 1
  selectedFile.value = null
  importErrors.value = []
  previewHeaders.value = []
  previewRows.value = []
  alert.value.show = false
}

// FUNGSI BUAT BACA EXCEL DI FRONTEND (PREVIEW)
const generatePreview = async (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = xlsx.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]

      // Convert ke JSON
      const json = xlsx.utils.sheet_to_json(worksheet)

      if (json.length > 0) {
        previewHeaders.value = Object.keys(json[0] as object)
        previewRows.value = json.slice(0, 5) // Ambil 5 baris aja
        step.value = 2 // Pindah ke layar preview
      } else {
        showAlert('error', 'File Excel kosong!')
      }
    } catch (error) {
      showAlert('error', 'Gagal membaca isi file Excel.')
    }
  }
  reader.readAsArrayBuffer(file)
}

const submitImport = async () => {
  if (!selectedFile.value) return
  isLoading.value = true
  importErrors.value = []

  try {
    const data = await studentStore.importStudents(selectedFile.value)
    showAlert('success', data.message || 'Data berhasil disimpan!')
    emit('imported')

    setTimeout(() => {
      emit('update:isOpen', false)
      resetModal()
    }, 1500)
  } catch (error: any) {
    if (error.response?.data?.errors) {
      importErrors.value = error.response.data.errors
      showAlert('error', 'Ditemukan error pada format data.')
    } else {
      showAlert('error', error.response?.data?.error || 'Gagal mengunggah file.')
    }
  } finally {
    isLoading.value = false
  }
}

// LOGIKA TOMBOL MODAL DINAMIS
const modalButtons = computed(() => {
  if (step.value === 1) {
    return [] // Di step 1 ga butuh tombol, nunggu user masukin file
  }

  return [
    {
      label: 'Kembali',
      variant: 'secondary' as 'secondary',
      action: () => {
        step.value = 1
        selectedFile.value = null
        importErrors.value = []
      },
    },
    {
      label: isLoading.value ? 'Menyimpan...' : 'Konfirmasi & Simpan',
      variant: 'primary' as 'primary',
      action: submitImport,
    },
  ]
})
</script>
