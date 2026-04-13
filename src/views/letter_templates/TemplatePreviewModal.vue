<script setup lang="ts">
import { computed, ref } from 'vue'
import { X, Download } from 'lucide-vue-next'
import { type TemplateItem } from '@/stores/letter_templates'

const props = defineProps<{
  isOpen: boolean
  template: TemplateItem | null
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const isDownloading = ref(false)
const downloadError = ref('')

function closeModal() {
  emit('update:isOpen', false)
}

function formatJenis(jenis?: string) {
  if (jenis === 'KEAGAMAAN') return 'Keagamaan'
  if (jenis === 'KESISWAAN') return 'Kesiswaan'
  if (jenis === 'AKADEMIK') return 'Akademik'
  return jenis || '-'
}

function formatRoleLabel(role: string) {
  if (role === 'ADMIN') return 'Admin'
  if (role === 'GURU') return 'Guru'
  if (role === 'WALI_MURID') return 'Wali Murid'
  if (role === 'KEPSEK') return 'Kepala Sekolah'
  if (role === 'BIDANG_AGAMA') return 'Bidang Agama'
  if (role === 'BIDANG_KESISWAAN') return 'Bidang Kesiswaan'
  if (role === 'BIDANG_AKADEMIK') return 'Bidang Akademik'
  return role
}

function formatDateTime(value?: string) {
  if (!value) return '-'

  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPlaceholder(variable: string) {
  return `{${variable}}`
}

const canDownload = computed(() => !!props.template)

const downloadFileName = computed(() => {
  if (!props.template) return 'template.docx'

  if (props.template.template_mode === 'DOCX') {
    return props.template.original_file_name || `${props.template.nama_template || 'template'}.docx`
  }

  return `${props.template.nama_template || 'template'}.docx`
})

async function handleDownloadTemplate() {
  if (!props.template) return

  downloadError.value = ''
  isDownloading.value = true

  try {
    const token = localStorage.getItem('access_token')
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    const response = await fetch(
      `${baseUrl}/api/letter_templates/${props.template.id_template}/download/`,
      {
        method: 'GET',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {},
      }
    )

    if (!response.ok) {
      let errorMessage = 'Gagal mengunduh template.'

      try {
        const errorData = await response.json()
        errorMessage = errorData?.error || errorData?.detail || errorMessage
      } catch {
        // ignore json parse failure
      }

      throw new Error(errorMessage)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', downloadFileName.value)
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(url)
  } catch (error) {
    downloadError.value =
      error instanceof Error ? error.message : 'Terjadi kesalahan saat mengunduh template.'
  } finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[999] flex items-center justify-center bg-black/35 px-4 py-6"
  >
    <div
      class="max-h-[90vh] w-full max-w-[720px] overflow-hidden rounded-[28px] bg-white shadow-2xl"
    >
      <div class="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-5">
        <div>
          <h2 class="text-[24px] font-bold text-[#111827]">Detail Template</h2>
          <p class="mt-1 text-[14px] text-[#858a91]">
            Informasi template surat
          </p>
        </div>

        <button
          type="button"
          class="rounded-full p-2 text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-[#111827]"
          @click="closeModal"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <div v-if="isLoading" class="px-6 py-10 text-center text-[#858a91]">
        Memuat detail template...
      </div>

      <div
        v-else-if="template"
        class="max-h-[calc(90vh-96px)] overflow-y-auto bg-[#eef5f0] p-7"
      >
        <div class="flex flex-col gap-5">
          <span
            class="inline-flex w-fit rounded-full bg-[#3f7f47] px-4 py-1 text-[13px] font-medium text-white"
          >
            {{ formatJenis(template.jenis) }}
          </span>

          <div>
            <h3 class="text-[26px] font-bold leading-[120%] text-[#111827]">
              {{ template.nama_template }}
            </h3>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="rounded-[18px] bg-white/70 px-4 py-3">
              <p class="text-[12px] text-[#858a91]">Status</p>
              <p class="mt-1 font-semibold text-[#111827]">
                {{ template.is_active ? 'Aktif' : 'Nonaktif' }}
              </p>
            </div>

            <div class="rounded-[18px] bg-white/70 px-4 py-3">
              <p class="text-[12px] text-[#858a91]">Mode</p>
              <p class="mt-1 font-semibold text-[#111827]">
                {{ template.template_mode }}
              </p>
            </div>
          </div>

          <div class="rounded-[18px] bg-white/70 px-4 py-4">
            <p class="text-[12px] text-[#858a91]">Tanggal dibuat</p>
            <p class="mt-1 text-[#111827]">{{ formatDateTime(template.created_at) }}</p>
          </div>

          <div class="rounded-[18px] bg-white/70 px-4 py-4">
            <p class="text-[12px] text-[#858a91]">Role Akses</p>

            <div v-if="template.role_akses?.length" class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="role in template.role_akses"
                :key="role"
                class="rounded-full border border-[#d9e2e7] bg-white px-3 py-1 text-[12px] text-[#111827]"
              >
                {{ formatRoleLabel(role) }}
              </span>
            </div>

            <p v-else class="mt-2 text-[13px] text-[#9aa1a9]">
              Tidak ada role akses.
            </p>
          </div>

          <div class="rounded-[18px] bg-white/70 px-4 py-4">
            <p class="text-[12px] text-[#858a91]">Variabel Terdeteksi</p>

            <div v-if="template.parsed_variables?.length" class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="variable in template.parsed_variables"
                :key="variable"
                class="rounded-full bg-[#dff3e5] px-3 py-1 text-[12px] font-medium text-[#2f7a4b]"
              >
                {{ formatPlaceholder(variable) }}
              </span>
            </div>

            <p v-else class="mt-2 text-[13px] text-[#9aa1a9]">
              Tidak ada variabel terdeteksi.
            </p>
          </div>

          <p v-if="downloadError" class="text-[13px] text-[#A0453B]">
            {{ downloadError }}
          </p>

          <button
            v-if="canDownload"
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f5f2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#184c25] disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="isDownloading"
            @click="handleDownloadTemplate"
          >
            <Download class="h-4 w-4" />
            {{ isDownloading ? 'Mengunduh...' : 'Download Template' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>