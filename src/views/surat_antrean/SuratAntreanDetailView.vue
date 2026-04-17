<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Folder,
  User,
  Calendar,
} from 'lucide-vue-next'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/users/auth'
import { useSuratAntreanStore } from '@/stores/surat_antrean'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import DepartmentTeacherSidebar from '@/components/department_teachers/DepartmentTeacherSidebar.vue'
import KepsekSidebar from '@/components/kepsek/KepsekSidebar.vue'
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
  if (userVerifierLevel.value === 1 && requiredLevelOneRole.value && role !== requiredLevelOneRole.value) {
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
            .replace(/False/g, 'false')
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
      return 'bg-[#3f9760] text-white'
    case 'Menunggu Verifikasi Kepsek':
      return 'bg-[#b7791f] text-white'
    case 'Diproses':
      return 'bg-[#2f6f93] text-white'
    case 'Ditolak':
      return 'bg-[#A0453B] text-white'
    default:
      return 'bg-[#6b7280] text-white'
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
  const err = error as AxiosError<any>
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

async function handleApprove() {
  if (!surat.value) return

  generalError.value = ''
  successMessage.value = ''

  try {
    const response = await store.approveSurat(surat.value.id_surat)
    successMessage.value = String(response?.message || 'Verifikasi surat berhasil diproses.')
  } catch (error) {
    const mapped = mapApiError(error)
    generalError.value = mapped.message
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
      <AdminSidebar v-if="isAdmin" />
      <KepsekSidebar v-else-if="isKepsek" :userName="authStore.user?.nama" :userEmail="authStore.user?.email" />
      <DepartmentTeacherSidebar v-else :userName="authStore.user?.nama" :userEmail="authStore.user?.email" />
    </template>

    <div class="p-8 flex flex-col gap-6 h-full font-['Plus_Jakarta_Sans']">
      <section class="mb-4">
        <button type="button" class="flex items-center gap-2 text-[#71757b] hover:text-[#111827] transition-colors"
          @click="goBack">
          <ArrowLeft class="h-5 w-5" />
          <span class="text-[14px] font-medium">Kembali</span>
        </button>
      </section>

      <section>
        <VAlert v-if="generalError" type="error" title="Gagal" :message="generalError" @close="generalError = ''" />
        <VAlert v-if="successMessage" type="success" title="Berhasil" :message="successMessage"
          @close="successMessage = ''" />
      </section>

      <section v-if="loading"
        class="rounded-[28px] border border-[#d9e2e7] bg-white/80 px-6 py-10 text-center text-[#858a91]">
        Memuat detail surat...
      </section>

      <section v-else-if="surat" class="flex flex-col gap-6">
        <article class="rounded-[20px] border border-[#e5e7eb] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <div class="flex items-start justify-between gap-4 mb-3">
            <h3 class="text-[18px] font-bold leading-[1.4] text-[#111827] flex-1">
              {{ getLetterTitle() }}
            </h3>
            <span
              :class="['px-4 py-1.5 rounded-full text-[14px] font-semibold whitespace-nowrap', getStatusClass(surat.status)]">
              {{ surat.status }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-5 mb-2">
            <div class="flex items-center gap-1.5 text-[14px] text-[#6b7280]">
              <Folder class="w-4 h-4 text-[#9ca3af]" />
              <span>{{ surat.kategori || '-' }}</span>
            </div>

            <div class="flex items-center gap-1.5 text-[14px] text-[#6b7280]">
              <User class="w-4 h-4 text-[#9ca3af]" />
              <span>{{ surat.nama_pengaju }}</span>
            </div>

            <div class="flex items-center gap-1.5 text-[14px] text-[#6b7280]">
              <Calendar class="w-4 h-4 text-[#9ca3af]" />
              <span>{{ formatDate(surat.tanggal_pengajuan) }}</span>
            </div>
          </div>

        </article>

        <section class="rounded-[20px] border border-[#e5e7eb] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          <h2 class="text-[18px] font-bold text-[#111827] mb-4">Data Form</h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
            <template v-if="formDataEntries.length > 0">
              <div v-for="entry in formDataEntries" :key="entry.key" class="min-w-0">
                <p class="text-[13px] leading-[145%] text-[#6b7280]">{{ entry.label }}</p>
                <p class="mt-1 text-[18px] leading-[150%] font-semibold text-[#111827] break-words">{{ entry.value }}
                </p>
              </div>
            </template>

            <template v-else>
              <div class="md:col-span-3 text-[14px] text-[#6b7280] italic">Tidak ada data form yang tersedia.</div>
            </template>
          </div>
        </section>

        <section v-if="isRejectedStatus && rejectionReason"
          class="rounded-[20px] border border-[#f3d2ce] bg-[#fff6f5] px-6 py-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <h2 class="text-[18px] font-bold text-[#7a2e26] mb-2">Alasan Penolakan</h2>
          <p class="text-[15px] leading-[155%] text-[#92392f] break-words">{{ rejectionReason }}</p>
        </section>

        <div v-if="canVerify" class="flex items-center justify-center gap-4">
          <VButton variant="secondary" class="!rounded-full !px-6 w-150" :disabled="actionLoading"
            @click="openRejectModal">
            Tolak
          </VButton>

          <VButton variant="primary" class="!rounded-full !px-6 w-150" :disabled="actionLoading" @click="handleApprove">
            Setujui
          </VButton>
        </div>
      </section>

      <section v-else class="rounded-[28px] border border-[#d9e2e7] bg-white/80 px-6 py-10 text-center text-[#858a91]">
        Surat tidak ditemukan.
      </section>
    </div>

    <VerificationRejectModal :isOpen="isRejectModalOpen" :loading="actionLoading" :errorMessage="rejectNotesError"
      @update:isOpen="closeRejectModal" @submit="handleReject" />
  </DashboardLayout>
</template>
