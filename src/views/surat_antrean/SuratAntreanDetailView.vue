<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Folder,
  User,
  Calendar,
  Download,
} from 'lucide-vue-next'
import type { AxiosError } from 'axios'

import { useAuthStore } from '@/stores/users/auth'
import { useSuratAntreanStore } from '@/stores/surat_antrean'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import VCard from '@/components/common/VCard.vue'
import VerificationRejectModal from '@/components/department_teachers/VerificationRejectModal.vue'

const route = useRoute()
const router = useRouter()
const store = useSuratAntreanStore()
const authStore = useAuthStore()

const departmentRoles = ['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK']
const isAdmin = computed(() => authStore.role === 'ADMIN')
const isKepsek = computed(() => authStore.role === 'KEPSEK')
const isDepartmentTeacher = computed(() => departmentRoles.includes(authStore.role || ''))

const generalError = ref('')
const successMessage = ref('')
const isRejectModalOpen = ref(false)
const rejectNotesError = ref('')

const surat = computed(() => store.selectedSurat)
const loading = computed(() => store.detailLoading)
const actionLoading = computed(() => store.actionLoading)
const isDownloadingPreview = ref(false)

const requiredLevelOneRole = computed(() => {
  const templateJenis = String(surat.value?.template_jenis || surat.value?.kategori || '').toUpperCase()
  const map: Record<string, string> = {
    KESISWAAN: 'BIDANG_KESISWAAN',
    AKADEMIK: 'BIDANG_AKADEMIK',
    KEAGAMAAN: 'BIDANG_AGAMA',
  }

  return map[templateJenis] || null
})

const userVerifierLevel = computed<number | null>(() => {
  const role = authStore.role || ''

  if (departmentRoles.includes(role)) return 1
  if (role === 'KEPSEK') return 2

  return null
})

const nextLevel = computed<number | null>(() => {
  if (!surat.value) return null

  const rawValue = (surat.value as Record<string, unknown>).next_level

  if (rawValue === null || rawValue === undefined || rawValue === '') return null

  const parsed = Number(rawValue)

  return Number.isNaN(parsed) ? null : parsed
})

const isFinalStatus = computed(() => {
  const status = String(surat.value?.status || '')
  return status === 'Disetujui' || status === 'Ditolak'
})

const isRejectedStatus = computed(() => String(surat.value?.status || '') === 'Ditolak')

const rejectionReason = computed(() => {
  const rawSurat = surat.value as Record<string, unknown> | null
  if (!rawSurat) return ''

  const directCandidates = [
    rawSurat.latest_rejection_note,
    rawSurat.rejection_note,
    rawSurat.notes,
    rawSurat.note,
    rawSurat.catatan,
  ]

  for (const candidate of directCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim()
    }
  }

  const rawHistory =
    (rawSurat.verification_logs as unknown[]) ||
    (rawSurat.verifications as unknown[]) ||
    (rawSurat.history as unknown[]) ||
    []

  if (Array.isArray(rawHistory)) {
    for (let index = rawHistory.length - 1; index >= 0; index -= 1) {
      const item = rawHistory[index] as Record<string, unknown>
      const status = String(item?.status || item?.verification_status || '').toLowerCase()

      if (status === 'rejected') {
        const note = item?.catatan || item?.notes || item?.note

        if (typeof note === 'string' && note.trim()) {
          return note.trim()
        }
      }
    }
  }

  return ''
})

const canVerify = computed(() => {
  if (!surat.value) return false
  if (isFinalStatus.value) return false
  if (!userVerifierLevel.value) return false

  const role = String(authStore.role || '').toUpperCase()

  if (
    userVerifierLevel.value === 1 &&
    requiredLevelOneRole.value &&
    role !== requiredLevelOneRole.value
  ) {
    return false
  }

  if (nextLevel.value === null) {
    return true
  }

  return userVerifierLevel.value === nextLevel.value
})

function getLetterTitle() {
  if (!surat.value) return 'Tanpa Perihal'
  return surat.value.perihal || surat.value.perkara || 'Tanpa Perihal'
}

const formDataEntries = computed(() => {
  const readObject = (source: unknown): Record<string, unknown> | unknown[] => {
    if (!source) return {}

    if (typeof source === 'object') return source as Record<string, unknown>

    if (typeof source === 'string') {
      try {
        return JSON.parse(
          source
            .replace(/'/g, '"')
            .replace(/None/g, 'null')
            .replace(/True/g, 'true')
            .replace(/False/g, 'false'),
        )
      } catch {
        return {}
      }
    }

    return {}
  }

  const formatLabel = (value: string) =>
    String(value || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase())

  const toDisplayValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') return '-'

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value)
    }

    if (Array.isArray(value)) {
      return value.length ? value.join(', ') : '-'
    }

    if (typeof value === 'object') {
      const objectValue = value as Record<string, unknown>

      if ('value' in objectValue && objectValue.value !== null && objectValue.value !== undefined) {
        return String(objectValue.value)
      }

      return JSON.stringify(value)
    }

    return String(value)
  }

  const buildEntries = (source: unknown): Array<{ key: string; label: string; value: string }> => {
    if (Array.isArray(source)) {
      return source
        .map((item, index) => {
          if (item && typeof item === 'object' && ('key' in item || 'value' in item)) {
            const itemObject = item as Record<string, unknown>
            const key = String(itemObject.key || `field_${index + 1}`)

            return {
              key,
              label: formatLabel(key),
              value: toDisplayValue(itemObject.value),
            }
          }

          return {
            key: `field_${index + 1}`,
            label: `Field ${index + 1}`,
            value: toDisplayValue(item),
          }
        })
        .filter((item) => item.value !== '-')
    }

    if (source && typeof source === 'object') {
      const sourceObject = source as Record<string, unknown>

      return Object.keys(sourceObject).map((key) => ({
        key,
        label: formatLabel(key),
        value: toDisplayValue(sourceObject[key]),
      }))
    }

    return []
  }

  const filled = readObject(surat.value?.filled_variables)
  const formData = readObject(surat.value?.form_data)
  const parsedVariables = Array.isArray(surat.value?.parsed_variables)
    ? (surat.value?.parsed_variables as string[])
    : []

  const filledEntries = buildEntries(filled)
  if (filledEntries.length > 0) return filledEntries

  const formDataEntries = buildEntries(formData)
  if (formDataEntries.length > 0) return formDataEntries

  if (parsedVariables.length > 0) {
    return parsedVariables.map((key) => ({
      key,
      label: formatLabel(key),
      value: '-',
    }))
  }

  return []
})

function getStatusClass(status: string): string {
  switch (status) {
    case 'Disetujui':
      return 'bg-[var(--app-success)] text-[var(--app-text-inverse)]'
    case 'Menunggu Verifikasi Kepsek':
      return 'bg-[var(--app-warning)] text-[var(--app-text-inverse)]'
    case 'Diproses':
      return 'bg-[var(--app-info)] text-[var(--app-text-inverse)]'
    case 'Ditolak':
      return 'bg-[var(--app-danger)] text-[var(--app-text-inverse)]'
    default:
      return 'bg-[var(--app-muted)] text-[var(--app-text-inverse)]'
  }
}

function formatDate(value: string) {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function resolveBackPath() {
  if (isAdmin.value) return '/admin/surat-antrean'
  if (isKepsek.value) return '/kepsek/surat-antrean'
  if (isDepartmentTeacher.value) return '/department-teachers/surat-antrean'

  return '/admin/surat-antrean'
}

function goBack() {
  router.push(resolveBackPath())
}

function mapApiError(error: unknown) {
  type ApiErrorPayload = {
    error?: string
    message?: string
    details?: {
      notes?: string[]
    }
  }

  const err = error as AxiosError<ApiErrorPayload>
  const data = err.response?.data

  const notesErrors = data?.details?.notes

  if (Array.isArray(notesErrors) && notesErrors.length > 0) {
    return {
      message: String(notesErrors[0]),
      notesError: String(notesErrors[0]),
    }
  }

  return {
    message: String(data?.error || data?.message || 'Proses verifikasi gagal. Silakan coba lagi.'),
    notesError: '',
  }
}

async function handleApprove(includeSignature?: boolean) {
  if (!surat.value) return

  generalError.value = ''
  successMessage.value = ''

  try {
    const response = await store.approveSurat(surat.value.id_surat, undefined, includeSignature)
    successMessage.value = String(response?.message || 'Verifikasi surat berhasil diproses.')
  } catch (error) {
    const mapped = mapApiError(error)
    generalError.value = mapped.message
  }
}

async function handlePreviewPDF() {
  if (!surat.value) return

  generalError.value = ''
  isDownloadingPreview.value = true

  try {
    const token = localStorage.getItem('access_token')
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    const response = await fetch(
      `${baseUrl}/api/letters/requests/${surat.value.id_surat}/preview`,
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
      let errorMessage = 'Gagal mengunduh preview surat.'

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
    const templateName = surat.value.template_nama || 'Template'
    link.setAttribute('download', `Preview_${templateName}_${surat.value.id_surat}.docx`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(url)
  } catch (error) {
    generalError.value =
      error instanceof Error ? error.message : 'Terjadi kesalahan saat mengunduh preview.'
  } finally {
    isDownloadingPreview.value = false
  }
}

function openRejectModal() {
  rejectNotesError.value = ''
  isRejectModalOpen.value = true
}

function closeRejectModal() {
  rejectNotesError.value = ''
  isRejectModalOpen.value = false
}

async function handleReject(notes: string) {
  if (!surat.value) return

  generalError.value = ''
  successMessage.value = ''
  rejectNotesError.value = ''

  try {
    const response = await store.rejectSurat(surat.value.id_surat, notes)
    successMessage.value = String(response?.message || 'Verifikasi surat berhasil diproses.')
    isRejectModalOpen.value = false
  } catch (error) {
    const mapped = mapApiError(error)

    if (mapped.notesError) {
      rejectNotesError.value = mapped.notesError
      return
    }

    generalError.value = mapped.message
  }
}

onMounted(async () => {
  const id = Number(route.params.id)

  if (!id) {
    generalError.value = 'ID surat tidak valid.'
    return
  }

  try {
    await store.fetchSuratDetail(id)
  } catch {
    generalError.value = 'Gagal memuat detail surat.'
  }
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main
      class="
        flex h-full flex-col gap-6
        bg-[var(--app-bg)] p-8
        font-[var(--font-sans)] text-[var(--app-text)]
      "
    >
      <section>
        <VButton
          variant="secondary"
          size="sm"
          @click="goBack"
        >
          <template #leftIcon>
            <ArrowLeft class="h-4 w-4" />
          </template>

          Kembali
        </VButton>
      </section>

      <section class="flex flex-col gap-3">
        <VAlert
          v-if="generalError"
          type="error"
          title="Gagal"
          :message="generalError"
          @close="generalError = ''"
        />

        <VAlert
          v-if="successMessage"
          type="success"
          title="Berhasil"
          :message="successMessage"
          @close="successMessage = ''"
        />
      </section>

      <section v-if="loading">
        <VCard padding-class="px-6 py-10">
          <p
            class="
              m-0 text-center text-[length:var(--app-font-sm)]
              leading-[1.5] text-[var(--app-muted)]
            "
          >
            Memuat detail surat...
          </p>
        </VCard>
      </section>

      <section
        v-else-if="surat"
        class="flex flex-col gap-6"
      >
        <VCard padding-class="px-6 py-6">
          <div class="mb-3 flex items-start justify-between gap-4">
            <h3
              class="
                m-0 flex-1 text-[length:var(--app-card-title-font)]
                font-bold leading-[1.4] text-[var(--app-heading)]
              "
            >
              {{ getLetterTitle() }}
            </h3>

            <span
              :class="[
                'whitespace-nowrap rounded-full px-4 py-1.5',
                'text-[length:var(--app-font-sm)] font-semibold leading-[1.2]',
                getStatusClass(surat.status),
              ]"
            >
              {{ surat.status }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-5">
            <div
              class="
                flex items-center gap-1.5
                text-[length:var(--app-font-sm)]
                leading-[1.4] text-[var(--app-muted)]
              "
            >
              <Folder class="h-4 w-4 text-[var(--app-muted)]" />
              <span>{{ surat.kategori || '-' }}</span>
            </div>

            <div
              class="
                flex items-center gap-1.5
                text-[length:var(--app-font-sm)]
                leading-[1.4] text-[var(--app-muted)]
              "
            >
              <User class="h-4 w-4 text-[var(--app-muted)]" />
              <span>{{ surat.nama_pengaju }}</span>
            </div>

            <div
              class="
                flex items-center gap-1.5
                text-[length:var(--app-font-sm)]
                leading-[1.4] text-[var(--app-muted)]
              "
            >
              <Calendar class="h-4 w-4 text-[var(--app-muted)]" />
              <span>{{ formatDate(surat.tanggal_pengajuan) }}</span>
            </div>
          </div>
        </VCard>

        <VCard padding-class="px-6 py-6">
          <h2
            class="
              mb-4 mt-0 text-[length:var(--app-section-title-font)]
              font-bold leading-[1.2] text-[var(--app-heading)]
            "
          >
            Data Form
          </h2>

          <div class="grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
            <template v-if="formDataEntries.length > 0">
              <div
                v-for="entry in formDataEntries"
                :key="entry.key"
                class="min-w-0"
              >
                <p
                  class="
                    m-0 text-[length:var(--app-font-xs)]
                    leading-[1.45] text-[var(--app-muted)]
                  "
                >
                  {{ entry.label }}
                </p>

                <p
                  class="
                    mt-1 mb-0 break-words
                    text-[length:var(--app-card-title-font)]
                    font-semibold leading-[1.5] text-[var(--app-heading)]
                  "
                >
                  {{ entry.value }}
                </p>
              </div>
            </template>

            <template v-else>
              <div
                class="
                  text-[length:var(--app-font-sm)] italic
                  leading-[1.5] text-[var(--app-muted)] md:col-span-3
                "
              >
                Tidak ada data form yang tersedia.
              </div>
            </template>
          </div>
        </VCard>

        <VCard
          v-if="isRejectedStatus && rejectionReason"
          padding-class="px-6 py-5"
          class="
            border-[var(--app-danger-border)]
            bg-[var(--app-danger-bg)]
          "
        >
          <h2
            class="
              mb-2 mt-0 text-[length:var(--app-section-title-font)]
              font-bold leading-[1.2] text-[var(--app-danger)]
            "
          >
            Alasan Penolakan
          </h2>

          <p
            class="
              m-0 break-words text-[length:var(--app-font-sm)]
              leading-[1.55] text-[var(--app-danger)]
            "
          >
            {{ rejectionReason }}
          </p>
        </VCard>

        <div
          v-if="isAdmin || isKepsek || isDepartmentTeacher"
          class="flex justify-end mt-4 mb-2"
        >
          <VButton
            variant="primary"
            :disabled="isDownloadingPreview"
            @click="handlePreviewPDF"
          >
            <template #leftIcon>
              <Download class="h-4 w-4" />
            </template>

            {{ isDownloadingPreview ? 'Mengunduh...' : 'Preview PDF' }}
          </VButton>
        </div>

        <div
          v-if="canVerify"
          class="flex items-center justify-center gap-4"
        >
          <VButton
            variant="secondary"
            class="min-w-[150px]"
            :disabled="actionLoading"
            @click="openRejectModal"
          >
            Tolak
          </VButton>

          <template v-if="isKepsek">
            <VButton
              variant="primary"
              class="min-w-[150px]"
              :disabled="actionLoading"
              @click="handleApprove(false)"
            >
              Setujui tanpa Tanda Tangan
            </VButton>
            <VButton
              variant="primary"
              class="min-w-[150px]"
              :disabled="actionLoading"
              @click="handleApprove(true)"
            >
              Setujui dengan Tanda Tangan
            </VButton>
          </template>
          <template v-else>
            <VButton
              variant="primary"
              class="min-w-[150px]"
              :disabled="actionLoading"
              @click="handleApprove()"
            >
              Setujui
            </VButton>
          </template>
        </div>
      </section>

      <section v-else>
        <VCard padding-class="px-6 py-10">
          <p
            class="
              m-0 text-center text-[length:var(--app-font-sm)]
              leading-[1.5] text-[var(--app-muted)]
            "
          >
            Surat tidak ditemukan.
          </p>
        </VCard>
      </section>
    </main>

    <VerificationRejectModal
      :isOpen="isRejectModalOpen"
      :loading="actionLoading"
      :errorMessage="rejectNotesError"
      @update:isOpen="closeRejectModal"
      @submit="handleReject"
    />
  </DashboardLayout>
</template>