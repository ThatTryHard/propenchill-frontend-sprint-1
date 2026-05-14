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
    <div class="mt-4 flex w-full flex-col gap-4">
      <VAlert
        v-if="alert.show"
        :type="alert.type"
        :message="alert.message"
        @close="alert.show = false"
      />

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
          class="max-h-[250px] overflow-y-auto rounded-xl border border-[var(--app-card-border)] bg-[var(--app-card)] text-left shadow-sm"
        >
          <table class="w-full whitespace-nowrap text-[0.85rem] text-[var(--app-text)]">
            <thead
              class="sticky top-0 border-b border-[var(--app-card-border)] bg-[var(--app-table-head-bg)] text-[var(--app-accent)]"
            >
              <tr>
                <th
                  v-for="(header, index) in previewHeaders"
                  :key="index"
                  class="px-3 py-2 text-left font-semibold"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-[var(--app-card-border)]">
              <tr
                v-for="(row, rowIndex) in previewRows"
                :key="rowIndex"
                class="transition-colors hover:bg-[var(--app-table-row-hover)]"
              >
                <td v-for="(col, colIndex) in previewHeaders" :key="colIndex" class="px-3 py-2">
                  {{ row[col] || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="mt-2 text-[0.78rem] italic text-[var(--app-muted)]">
          *Hanya menampilkan maksimal 5 baris pertama
        </p>
      </div>

      <div v-if="importErrors.length > 0" class="mt-2 w-full">
        <div
          class="rounded-t-lg border border-b-0 border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] p-2"
        >
          <h3 class="text-[0.85rem] font-bold text-[var(--app-danger)]">
            ⚠️ {{ importErrors.length }} error pada baris Excel:
          </h3>
        </div>

        <div
          class="max-h-32 overflow-y-auto rounded-b-lg border border-[var(--app-danger-border)] bg-[var(--app-card)] text-left"
        >
          <table class="w-full text-[0.85rem] text-[var(--app-text)]">
            <tbody class="divide-y divide-[var(--app-card-border)]">
              <tr
                v-for="(err, idx) in importErrors"
                :key="idx"
                class="transition-colors hover:bg-[var(--app-table-row-hover)]"
              >
                <td class="w-16 px-2 py-1 font-bold text-[var(--app-danger)]">
                  #{{ err.row - 1 }}
                </td>
                <td class="px-2 py-1">
                  {{ err.message }}
                </td>
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
import * as xlsx from 'xlsx'
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

const previewHeaders = ref<string[]>([])
const previewRows = ref<any[]>([])

const alert = ref({ show: false, type: 'information', message: '' })

const showAlert = (type: string, message: string) => {
  alert.value = { show: true, type, message }

  setTimeout(() => {
    alert.value.show = false
  }, 4000)
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

const generatePreview = async (file: File) => {
  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = xlsx.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]

      if (!firstSheetName) {
        showAlert('error', 'File Excel tidak memiliki sheet yang valid.')
        return
      }

      const worksheet = workbook.Sheets[firstSheetName]

      if (!worksheet) {
        showAlert('error', 'Gagal membaca sheet dari file Excel.')
        return
      }

      const json = xlsx.utils.sheet_to_json(worksheet)

      if (json.length > 0) {
        previewHeaders.value = Object.keys(json[0] as object)
        previewRows.value = json.slice(0, 5)
        step.value = 2
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
    const errorResponse = error.response?.data

    if (errorResponse) {
      if (
        errorResponse.errors &&
        Array.isArray(errorResponse.errors) &&
        errorResponse.errors.length > 0
      ) {
        importErrors.value = errorResponse.errors
        showAlert('error', errorResponse.message || 'Ditemukan error pada format data.')
      } else if (errorResponse.error) {
        showAlert('error', errorResponse.error)
      } else {
        showAlert('error', 'Gagal mengunggah file. Silakan periksa kembali format Anda.')
      }
    } else {
      showAlert('error', 'Koneksi ke server terputus.')
    }
  } finally {
    isLoading.value = false
  }
}

const modalButtons = computed(() => {
  if (step.value === 1) {
    return []
  }

  return [
    {
      label: 'Kembali',
      variant: 'secondary' as const,
      action: () => {
        step.value = 1
        selectedFile.value = null
        importErrors.value = []
      },
    },
    {
      label: isLoading.value ? 'Menyimpan...' : 'Konfirmasi & Simpan',
      variant: 'primary' as const,
      action: submitImport,
    },
  ]
})
</script>
