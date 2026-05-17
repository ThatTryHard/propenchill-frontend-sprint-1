<script setup lang="ts">
import { computed, ref } from 'vue'
import { Download } from 'lucide-vue-next'
import type { LetterTemplateItem } from '@/stores/letter_templates'

import VModal from '@/components/common/VModal.vue'
import VCard from '@/components/common/VCard.vue'
import VButton from '@/components/common/VButton.vue'
import VChip from '@/components/common/VChip.vue'
import VAlert from '@/components/common/VAlert.vue'

const props = defineProps<{
  isOpen: boolean
  template: LetterTemplateItem | null
  isLoading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:isOpen', value: boolean): void
}>()

const isDownloading = ref(false)
const downloadError = ref('')

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
      },
    )

    if (!response.ok) {
      let errorMessage = 'Gagal mengunduh template.'

      try {
        const errorData = await response.json()
        errorMessage = errorData?.error || errorData?.detail || errorMessage
      } catch {
        // ignore
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
  <VModal
    :isOpen="isOpen"
    title="Detail Template"
    description="Informasi template surat"
    maxWidthClass="max-w-[720px]"
    :buttons="[]"
    @update:isOpen="emit('update:isOpen', $event)"
  >
    <div
      class="
        max-h-[70vh] overflow-y-auto pr-1
        font-[var(--font-sans)] text-[var(--app-text)]
      "
    >
      <div
        v-if="isLoading"
        class="
          px-6 py-10 text-center
          text-[length:var(--app-font-sm)]
          leading-[1.5] text-[var(--app-muted)]
        "
      >
        Memuat detail template...
      </div>

      <div
        v-else-if="template"
        class="flex flex-col gap-4"
      >
        <div class="flex flex-wrap items-center gap-2">
          <VChip
            :label="formatJenis(template.jenis)"
            variant="primary"
          />

          <VChip
            :label="template.is_active ? 'Aktif' : 'Nonaktif'"
            :variant="template.is_active ? 'primary' : 'tertiary'"
          />

          <VChip
            :label="template.template_mode"
            variant="tertiary"
          />
        </div>

        <div>
          <h3
            class="
              m-0 text-[length:var(--app-section-title-font)]
              font-bold leading-[1.2] text-[var(--app-heading)]
            "
          >
            {{ template.nama_template }}
          </h3>
        </div>

        <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
          <VCard padding-class="px-4 py-3">
            <p
              class="
                m-0 text-[length:var(--app-font-xs)]
                leading-[1.4] text-[var(--app-muted)]
              "
            >
              Tanggal dibuat
            </p>

            <p
              class="
                mt-1 mb-0 text-[length:var(--app-font-sm)]
                font-semibold leading-[1.45] text-[var(--app-text)]
              "
            >
              {{ formatDateTime(template.created_at) }}
            </p>
          </VCard>

          <VCard padding-class="px-4 py-3">
            <p
              class="
                m-0 text-[length:var(--app-font-xs)]
                leading-[1.4] text-[var(--app-muted)]
              "
            >
              Terakhir diperbarui
            </p>

            <p
              class="
                mt-1 mb-0 text-[length:var(--app-font-sm)]
                font-semibold leading-[1.45] text-[var(--app-text)]
              "
            >
              {{ formatDateTime(template.updated_at || template.created_at) }}
            </p>
          </VCard>
        </div>

        <VCard padding-class="px-4 py-3">
          <p
            class="
              m-0 text-[length:var(--app-font-xs)]
              leading-[1.4] text-[var(--app-muted)]
            "
          >
            Dibuat oleh
          </p>

          <p
            class="
              mt-1 mb-0 text-[length:var(--app-font-sm)]
              font-semibold leading-[1.45] text-[var(--app-text)]
            "
          >
            {{ template.created_by_name || '-' }}
          </p>
        </VCard>

        <VCard padding-class="px-4 py-3">
          <p
            class="
              m-0 text-[length:var(--app-font-xs)]
              leading-[1.4] text-[var(--app-muted)]
            "
          >
            Role Akses
          </p>

          <div class="mt-2 flex flex-wrap gap-2">
            <VChip
              v-for="role in template.allowed_roles || []"
              :key="role"
              :label="formatRoleLabel(role)"
              variant="secondary"
            />

            <span
              v-if="!template.allowed_roles || template.allowed_roles.length === 0"
              class="
                text-[length:var(--app-font-sm)]
                leading-[1.45] text-[var(--app-text)]
              "
            >
              -
            </span>
          </div>
        </VCard>

        <VCard padding-class="px-4 py-3">
          <p
            class="
              m-0 text-[length:var(--app-font-xs)]
              leading-[1.4] text-[var(--app-muted)]
            "
          >
            Variabel Terdeteksi
          </p>

          <div class="mt-2 flex flex-wrap gap-2">
            <VChip
              v-for="variable in template.parsed_variables || []"
              :key="variable"
              :label="formatPlaceholder(variable)"
              variant="tertiary"
            />

            <span
              v-if="!template.parsed_variables || template.parsed_variables.length === 0"
              class="
                text-[length:var(--app-font-sm)]
                leading-[1.45] text-[var(--app-text)]
              "
            >
              Tidak ada variabel terdeteksi.
            </span>
          </div>
        </VCard>

        <VCard
          v-if="template.preview_text"
          padding-class="px-4 py-3"
        >
          <p
            class="
              m-0 text-[length:var(--app-font-xs)]
              leading-[1.4] text-[var(--app-muted)]
            "
          >
            Preview Template
          </p>

          <div
            class="
              mt-2 whitespace-pre-line text-[length:var(--app-font-sm)]
              leading-[1.6] text-[var(--app-text)]
            "
          >
            {{ template.preview_text }}
          </div>
        </VCard>

        <VAlert
          v-if="downloadError"
          type="error"
          title="Gagal"
          :message="downloadError"
          @close="downloadError = ''"
        />

        <div class="flex justify-end">
          <VButton
            variant="primary"
            :disabled="!canDownload || isDownloading"
            @click="handleDownloadTemplate"
          >
            <template #leftIcon>
              <Download class="h-4 w-4" />
            </template>

            {{ isDownloading ? 'Mengunduh...' : 'Unduh Template' }}
          </VButton>
        </div>
      </div>

      <div
        v-else
        class="
          px-6 py-10 text-center
          text-[length:var(--app-font-sm)]
          leading-[1.5] text-[var(--app-muted)]
        "
      >
        Data template tidak tersedia.
      </div>
    </div>
  </VModal>
</template>