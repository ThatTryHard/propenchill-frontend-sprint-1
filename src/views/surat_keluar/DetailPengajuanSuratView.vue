<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/plugins/axios'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/users/auth'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VCard from '@/components/common/VCard.vue'
import VChip from '@/components/common/VChip.vue'
import VSteps from '@/components/common/VSteps.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import {
  ArrowLeft,
  FileText,
  FilePen,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-vue-next'
import { useSuratKeluarStore } from '@/stores/surat_keluar/index'

type GenericRecord = Record<string, unknown>

interface TrackingStatus extends GenericRecord {
  status?: string
  status_surat?: string
  state?: string
  aktivitas?: string
  keterangan?: string
  catatan?: string
  user?: string
  nama_pengguna?: string
  role?: string
  jabatan?: string
  position?: string
  waktu?: string
  tanggal?: string
  updated_at?: string
  created_at?: string
}

interface DetailState extends GenericRecord {
  id_pengajuan?: number | string
  template_nama?: string
  nama_template?: string
  nomor_surat?: string
  tanggal_pengajuan?: string
  created_at?: string
  klasifikasi?: string
  status?: string
  latest_rejection_note?: string
  latest_verification_note?: string
  catatan?: string
  note?: string
  notes?: string
  pengaju_obj?: GenericRecord
  requester?: GenericRecord
  requested_by?: GenericRecord
  user?: GenericRecord
  pengaju_detail?: GenericRecord
  verif_1_time?: string
  verif_2_time?: string
  tanggal_ditolak?: string
  tanggal_disetujui?: string
  updated_at?: string
  filled_variables?: GenericRecord | string
  dynamic_data?: GenericRecord
  parsed_variables?: string[]
  form_data: GenericRecord | string
  tracking_status: TrackingStatus[]
}

const suratKeluarStore = useSuratKeluarStore()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const detail = ref<DetailState>({ form_data: {}, tracking_status: [] })
const showCancelDialog = ref(false)
const isCancelling = ref(false)

const normalizeStatus = (status: unknown) =>
  String(status || '')
    .trim()
    .toLowerCase()

const normalizeDetailPayload = (payload: unknown): DetailState => {
  if (!payload || typeof payload !== 'object') return { form_data: {}, tracking_status: [] }

  const payloadObj = payload as GenericRecord

  if (payloadObj.data && typeof payloadObj.data === 'object') {
    return payloadObj.data as DetailState
  }

  return payload as DetailState
}

const fetchDetail = async () => {
  try {
    const response = await api.get(`/api/letters/requests/${route.params.id}`)
    detail.value = normalizeDetailPayload(response.data)
  } catch (error) {
    console.error('Gagal ambil detail:', error)

    try {
      const listResponse = await api.get('/api/letters/my-requests')
      const listData: DetailState[] = Array.isArray(listResponse.data?.data)
        ? listResponse.data.data
        : Array.isArray(listResponse.data)
          ? listResponse.data
          : []

      const found = listData.find((item) => item.id_pengajuan == route.params.id)

      if (found) detail.value = found
    } catch (nestedError) {
      console.error(nestedError)
    }
  }
}

const cancelRequest = async () => {
  isCancelling.value = true

  try {
    const response = await api.put(`/api/letters/requests/${detail.value.id_pengajuan}/cancel`)

    if (response.status === 200) {
      detail.value.status = 'Dibatalkan'

      detail.value.tracking_status = [
        {
          status: 'Dibatalkan',
          aktivitas: 'Pengajuan dibatalkan oleh pengguna',
          waktu: new Date().toISOString(),
        },
        ...(detail.value.tracking_status || []),
      ]

      showCancelDialog.value = false

      suratKeluarStore.triggerAlert('Berhasil', 'Pengajuan surat telah dibatalkan.', 'success')

      setTimeout(() => {
        router.push('/surat-keluar/riwayat')
      }, 1500)
    }
  } catch (error: unknown) {
    const apiError = error as AxiosError<{ error?: string }>
    const errorMsg = apiError.response?.data?.error || 'Gagal membatalkan surat'

    suratKeluarStore.triggerAlert('Gagal', errorMsg, 'error')
  } finally {
    isCancelling.value = false
  }
}

const submittedBy = computed(() => {
  const candidateKeys = [
    'nama_pengaju',
    'pengaju',
    'pengaju_nama',
    'nama_pemohon',
    'pemohon_nama',
    'requested_by_name',
    'requester_name',
    'user_name',
    'nama_user',
    'nama_orangtua',
    'nama_orang_tua',
    'nama_wali',
    'wali_nama',
    'full_name',
    'nama',
    'siswa_nama',
  ]

  for (const key of candidateKeys) {
    const value = detail.value?.[key]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  const nestedSources = [
    detail.value?.pengaju_obj,
    detail.value?.requester,
    detail.value?.requested_by,
    detail.value?.user,
    detail.value?.pengaju_detail,
  ]

  for (const source of nestedSources) {
    if (source && typeof source === 'object') {
      const nestedSource = source as GenericRecord
      const nestedName =
        nestedSource.nama ||
        nestedSource.full_name ||
        nestedSource.name ||
        nestedSource.nama_pengaju ||
        nestedSource.user_name

      if (typeof nestedName === 'string' && nestedName.trim()) {
        return nestedName.trim()
      }
    }
  }

  return authStore.user?.nama || '-'
})

const isApproved = computed(() => {
  return detail.value.status === 'Verified'
})

const isRejected = computed(() => {
  return detail.value.status === 'Rejected'
})

const showEditButton = computed(() => isRejected.value)
const editButtonLabel = computed(() => 'Ajukan Revisi')

const formCardSubtitle = computed(() => {
  if (isRejected.value) return 'Perbaiki data pengajuan sesuai catatan dan ajukan kembali.'
  return 'Detail data surat yang Anda ajukan.'
})

const isCancelable = computed(() => {
  const status = normalizeStatus(detail.value.status)
  return status === 'pending'
})

const latestNote = computed(() => {
  const noteCandidates = [
    detail.value.latest_rejection_note,
    detail.value.latest_verification_note,
    detail.value.catatan,
    detail.value.note,
    detail.value.notes,
  ]

  for (const note of noteCandidates) {
    if (typeof note === 'string' && note.trim()) {
      return note.trim()
    }
  }

  return '-'
})

const formCardTitle = computed(() => (isRejected.value ? 'Revisi Surat' : 'Data Form'))

const trackingSummary = computed(() => {
  const history = Array.isArray(detail.value.tracking_status) ? detail.value.tracking_status : []

  const normalizedStatuses = history
    .map((item) => normalizeStatus(item?.status || item?.status_surat || item?.state || ''))
    .filter(Boolean)

  const hasWaitingKepsek = normalizedStatuses.some((status) =>
    ['menunggu verifikasi kepsek', 'menunggu_verifikasi_kepsek'].includes(status),
  )

  const hasVerified = normalizedStatuses.some((status) =>
    ['verified', 'disetujui', 'approved', 'selesai'].includes(status),
  )

  const hasRejected = normalizedStatuses.some((status) => ['rejected', 'ditolak'].includes(status))

  const level1Result =
    hasWaitingKepsek || hasVerified ? 'approved' : hasRejected ? 'rejected' : 'pending'

  const level2Result = hasVerified
    ? 'approved'
    : hasRejected && hasWaitingKepsek
      ? 'rejected'
      : hasWaitingKepsek
        ? 'pending'
        : 'pending'

  return {
    hasWaitingKepsek,
    hasVerified,
    hasRejected,
    level1Result,
    level2Result,
  }
})

const statusSteps = computed(() => {
  const summary = trackingSummary.value

  const activeIndex = summary.hasVerified
    ? 3
    : summary.hasRejected && summary.hasWaitingKepsek
      ? 2
      : summary.hasRejected
        ? 1
        : summary.hasWaitingKepsek
          ? 2
          : 1

  const verif1Subtitle =
    summary.level1Result === 'approved'
      ? 'Verifikasi level 1 disetujui.'
      : summary.level1Result === 'rejected'
        ? 'Pengajuan ditolak pada verifikasi level 1.'
        : 'Dalam proses verifikasi pertama.'

  const verif2Subtitle =
    summary.level2Result === 'approved'
      ? 'Verifikasi level 2 disetujui.'
      : summary.level2Result === 'rejected'
        ? 'Pengajuan ditolak pada verifikasi level 2.'
        : summary.hasWaitingKepsek
          ? 'Menunggu verifikasi kepala sekolah.'
          : 'Menunggu hasil verifikasi level 1.'

  const baseSteps = [
    {
      label: 'Diajukan',
      timestamp: formatDateTime(detail.value.tanggal_pengajuan || detail.value.created_at),
      subtitle: 'Pengajuan dibuat.',
    },
    {
      label: 'Verif 1',
      timestamp:
        detail.value.verif_1_time ||
        (summary.level1Result === 'rejected'
          ? formatDateTime(detail.value.tanggal_ditolak || detail.value.updated_at)
          : ''),
      subtitle: verif1Subtitle,
    },
    {
      label: 'Verif 2',
      timestamp:
        detail.value.verif_2_time ||
        (summary.level2Result === 'rejected'
          ? formatDateTime(detail.value.tanggal_ditolak || detail.value.updated_at)
          : ''),
      subtitle: verif2Subtitle,
    },
    {
      label: 'Disetujui',
      timestamp: detail.value.tanggal_disetujui || '',
      subtitle: 'Surat telah disetujui.',
    },
  ]

  return baseSteps.map((item, index) => ({
    ...item,
    status: (index < activeIndex ? 'completed' : index === activeIndex ? 'current' : 'upcoming') as
      | 'completed'
      | 'current'
      | 'upcoming',
  }))
})

const historyList = computed(() => {
  const history = detail.value.tracking_status || []

  return history.map((item, index) => ({
    id: `${item.status || index}-${index}`,
    status: item.status || `Riwayat ${index + 1}`,
    note: item.aktivitas || item.keterangan || item.catatan || 'Tidak ada catatan tambahan.',
    actor: item.user || item.nama_pengguna || 'Sistem',
    role: item.role || item.jabatan || item.position || 'Sistem',
    time: formatDateTime(item.waktu || item.tanggal || item.updated_at || item.created_at),
  }))
})

const latestStatusNote = computed(() => {
  if (latestNote.value !== '-') {
    return {
      actor: 'Verifier',
      role: 'Verifikasi Surat',
      note: latestNote.value,
      time: formatDateTime(detail.value.updated_at || detail.value.created_at),
    }
  }

  const list = historyList.value

  if (!list.length) {
    return {
      actor: 'Sistem',
      role: 'Sistem',
      note: 'Belum ada catatan pada tahap ini.',
      time: '-',
    }
  }

  return list[list.length - 1]
})

const formDataEntries = computed(() => {
  const readObject = (source: unknown): GenericRecord => {
    if (!source) return {}
    if (typeof source === 'object' && !Array.isArray(source)) return source as GenericRecord

    if (typeof source === 'string') {
      try {
        return JSON.parse(source.replace(/'/g, '"').replace(/None/g, 'null'))
      } catch {
        return {}
      }
    }

    return {}
  }

  const formatLabel = (value: string) =>
    String(value || '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())

  const data1 = readObject(detail.value.filled_variables)
  const data2 = readObject(detail.value.form_data)
  const data3 = detail.value.dynamic_data || {}

  const combinedData = { ...data3, ...data2, ...data1 }

  const entries = Object.keys(combinedData).map((key) => ({
    key,
    label: formatLabel(key),
    value: String(combinedData[key] ?? '-'),
  }))

  if (entries.length === 0 && Array.isArray(detail.value.parsed_variables)) {
    return detail.value.parsed_variables.map((key) => ({
      key,
      label: formatLabel(key),
      value: '-',
    }))
  }

  return entries
})

const getStatusVariant = (status: unknown) => {
  const normalized = normalizeStatus(status)

  if (
    ['pending', 'diproses', 'menunggu verifikasi kepsek', 'menunggu_verifikasi_kepsek'].includes(
      normalized,
    )
  ) {
    return 'warning'
  }

  if (['disetujui', 'selesai', 'verified', 'approved'].includes(normalized)) return 'primary'
  if (['ditolak', 'rejected'].includes(normalized)) return 'danger'
  if (normalized === 'dibatalkan') return 'deleted'

  return 'tertiary'
}

const formatDate = (d: unknown) =>
  d
    ? new Date(String(d)).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-'

const formatDateTime = (d: unknown) => (d ? new Date(String(d)).toLocaleString('id-ID') : '-')

const handleDownload = async () => {
  try {
    const response = await api.get(`/api/letters/requests/${detail.value.id_pengajuan}/download`, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const namaSurat = detail.value.template_nama || 'Surat_Pengajuan'
    const namaFileRapi = namaSurat.replace(/\s+/g, '_')

    link.setAttribute('download', `${namaFileRapi}_${detail.value.id_pengajuan}.docx`)

    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error: unknown) {
    console.error('Download error:', error)
    const apiError = error as AxiosError<{ error?: string }>
    alert(apiError.response?.data?.error || 'Gagal mengunduh surat.')
  }
}

const navigateToRevision = () => {
  router.push({ name: 'FormPengajuanSurat', query: { requestId: detail.value.id_pengajuan } })
}

const navigateBack = () => {
  router.push('/surat-keluar/riwayat')
}

onMounted(fetchDetail)
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main
      class="
        min-h-full overflow-y-auto bg-[var(--app-bg)] px-[60px] py-10
        font-[var(--font-sans)] text-[var(--app-text)]
        max-[900px]:px-6 max-[900px]:py-7
        max-[640px]:px-4
      "
    >
      <div class="flex w-full max-w-[1440px] flex-col">
        <div class="mb-6">
          <VButton
            variant="secondary"
            size="sm"
            @click="navigateBack"
          >
            <template #leftIcon>
              <ArrowLeft class="h-4 w-4" />
            </template>

            Kembali
          </VButton>
        </div>

        <header class="mb-10">
          <div class="min-w-0">
            <h1
              class="
                m-0 text-[length:var(--app-page-title-font)]
                font-bold leading-[1.2] text-[var(--app-heading)]
              "
            >
              Detail Surat Keluar
            </h1>

            <p
              class="
                mt-1 mb-0 text-[length:var(--app-page-subtitle-font)]
                font-medium leading-[1.45] text-[var(--app-muted)]
              "
            >
              Berikut detail surat keluar
            </p>
          </div>
        </header>

        <div class="flex w-full flex-col gap-6">
          <VCard padding-class="p-8">
            <div
              class="
                mb-8 flex items-start justify-between gap-4
                max-[768px]:flex-col max-[768px]:items-stretch
              "
            >
              <div class="flex items-center gap-4">
                <div
                  class="
                    flex h-12 w-12 shrink-0 items-center justify-center
                    rounded-[12px] bg-[var(--app-accent)]
                    text-[var(--app-text-inverse)]
                  "
                >
                  <FileText class="h-[26px] w-[26px]" />
                </div>

                <div class="min-w-0">
                  <h2
                    class="
                      m-0 text-[length:var(--app-card-title-font)]
                      font-bold leading-[1.25] text-[var(--app-heading)]
                    "
                  >
                    {{ detail.template_nama || detail.nama_template || '-' }}
                  </h2>

                  <p
                    class="
                      mt-1 mb-0 text-[length:var(--app-font-sm)]
                      leading-[1.4] text-[var(--app-muted)]
                    "
                  >
                    ID: {{ detail.id_pengajuan || '-' }}
                  </p>
                </div>
              </div>

              <VChip
                :label="detail.status || 'Pending'"
                :variant="getStatusVariant(detail.status)"
              />
            </div>

            <div class="grid grid-cols-3 gap-6 max-[768px]:grid-cols-1">
              <div class="flex flex-col gap-[10px]">
                <span
                  class="
                    text-[length:var(--app-font-xs)]
                    font-medium leading-[1.4] text-[var(--app-muted)]
                  "
                >
                  Nomor Surat
                </span>

                <span
                  class="
                    text-[length:var(--app-font-sm)]
                    font-semibold leading-[1.5] text-[var(--app-heading)]
                  "
                >
                  {{ detail.nomor_surat || '-' }}
                </span>
              </div>

              <div class="flex flex-col gap-[10px]">
                <span
                  class="
                    text-[length:var(--app-font-xs)]
                    font-medium leading-[1.4] text-[var(--app-muted)]
                  "
                >
                  Tanggal Pengajuan
                </span>

                <span
                  class="
                    text-[length:var(--app-font-sm)]
                    font-semibold leading-[1.5] text-[var(--app-heading)]
                  "
                >
                  {{ formatDate(detail.tanggal_pengajuan || detail.created_at) }}
                </span>
              </div>

              <div class="flex flex-col gap-[10px]">
                <span
                  class="
                    text-[length:var(--app-font-xs)]
                    font-medium leading-[1.4] text-[var(--app-muted)]
                  "
                >
                  Pengaju
                </span>

                <span
                  class="
                    text-[length:var(--app-font-sm)]
                    font-semibold leading-[1.5] text-[var(--app-heading)]
                  "
                >
                  {{ submittedBy }}
                </span>
              </div>
            </div>

            <div class="mt-6 grid grid-cols-3 gap-6 max-[768px]:grid-cols-1">
              <div class="flex flex-col gap-[10px]">
                <span
                  class="
                    text-[length:var(--app-font-xs)]
                    font-medium leading-[1.4] text-[var(--app-muted)]
                  "
                >
                  Klasifikasi
                </span>

                <span
                  class="
                    text-[length:var(--app-font-sm)]
                    font-semibold leading-[1.5] text-[var(--app-heading)]
                  "
                >
                  {{ detail.klasifikasi || '-' }}
                </span>
              </div>

              <div class="flex flex-col gap-[10px]">
                <span
                  class="
                    text-[length:var(--app-font-xs)]
                    font-medium leading-[1.4] text-[var(--app-muted)]
                  "
                >
                  Catatan
                </span>

                <span
                  class="
                    text-[length:var(--app-font-sm)]
                    font-semibold leading-[1.5] text-[var(--app-heading)]
                  "
                >
                  {{ latestNote }}
                </span>
              </div>

              <div class="flex flex-col gap-[10px]">
                <span
                  class="
                    text-[length:var(--app-font-xs)]
                    font-medium leading-[1.4] text-[var(--app-muted)]
                  "
                >
                  Status Saat Ini
                </span>

                <span
                  class="
                    text-[length:var(--app-font-sm)]
                    font-semibold leading-[1.5] text-[var(--app-heading)]
                  "
                >
                  {{ detail.status || 'Pending' }}
                </span>
              </div>
            </div>
          </VCard>

          <VCard padding-class="p-8">
            <div
              class="
                mb-8 flex items-center justify-between gap-4
                max-[768px]:flex-col max-[768px]:items-stretch
              "
            >
              <div class="flex items-center gap-4">
                <div
                  class="
                    flex h-12 w-12 shrink-0 items-center justify-center
                    rounded-[12px] bg-[var(--app-accent)]
                    text-[var(--app-text-inverse)]
                  "
                >
                  <FilePen class="h-[26px] w-[26px]" />
                </div>

                <div class="min-w-0">
                  <h2
                    class="
                      m-0 text-[length:var(--app-section-title-font)]
                      font-bold leading-[1.2] text-[var(--app-heading)]
                    "
                  >
                    {{ formCardTitle }}
                  </h2>

                  <p
                    class="
                      mt-[6px] mb-0 text-[length:var(--app-font-sm)]
                      leading-[1.6] text-[var(--app-muted)]
                    "
                  >
                    {{ formCardSubtitle }}
                  </p>
                </div>
              </div>

              <VButton
                v-if="showEditButton"
                variant="tertiary"
                size="sm"
                @click="navigateToRevision"
              >
                {{ editButtonLabel }}
              </VButton>
            </div>

            <div class="grid grid-cols-3 gap-6 max-[768px]:grid-cols-1">
              <template v-if="formDataEntries.length > 0">
                <div
                  v-for="entry in formDataEntries"
                  :key="entry.key"
                  class="flex flex-col gap-[10px]"
                >
                  <span
                    class="
                      text-[length:var(--app-font-xs)]
                      font-medium leading-[1.4] text-[var(--app-muted)]
                    "
                  >
                    {{ entry.label }}
                  </span>

                  <span
                    class="
                      text-[length:var(--app-font-sm)]
                      font-semibold leading-[1.5] text-[var(--app-heading)]
                    "
                  >
                    {{ entry.value }}
                  </span>
                </div>
              </template>

              <template v-else>
                <div class="col-span-3 max-[768px]:col-span-1">
                  <p
                    class="
                      m-0 text-[length:var(--app-font-sm)]
                      italic leading-[1.5] text-[var(--app-muted)]
                    "
                  >
                    Tidak ada data tambahan yang diisi.
                  </p>
                </div>
              </template>
            </div>
          </VCard>

          <VCard padding-class="p-8">
            <div class="mb-8 flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="
                    flex h-12 w-12 shrink-0 items-center justify-center
                    rounded-[12px] bg-[var(--app-accent)]
                    text-[var(--app-text-inverse)]
                  "
                >
                  <CheckCircle2 class="h-[26px] w-[26px]" />
                </div>

                <div class="min-w-0">
                  <h2
                    class="
                      m-0 text-[length:var(--app-section-title-font)]
                      font-bold leading-[1.2] text-[var(--app-heading)]
                    "
                  >
                    Status Surat
                  </h2>

                  <p
                    class="
                      mt-[6px] mb-0 text-[length:var(--app-font-sm)]
                      leading-[1.6] text-[var(--app-muted)]
                    "
                  >
                    Lihat tahapan verifikasi dan catatan dari proses pengajuan.
                  </p>
                </div>
              </div>
            </div>

            <div class="w-full pb-4">
              <VSteps :steps="statusSteps" />
            </div>

            <div
              v-if="latestStatusNote"
              class="mt-6 flex w-full justify-center"
            >
              <div
                class="
                  flex w-full max-w-[520px] overflow-hidden rounded-[20px]
                  border border-[var(--app-card-border)] bg-[var(--app-card)]
                  shadow-[0_10px_30px_rgba(15,23,42,0.08)]
                "
              >
                <div class="w-2 shrink-0 bg-[var(--app-accent)]"></div>

                <div class="flex flex-1 flex-col gap-[10px] p-[18px_18px_18px_16px]">
                  <div class="flex items-center gap-3">
                    <div
                      class="
                        grid h-10 w-10 min-w-10 place-items-center rounded-full
                        bg-[var(--app-accent)] text-[var(--app-text-inverse)]
                      "
                    >
                      <User class="h-[18px] w-[18px]" />
                    </div>

                    <div class="flex flex-col gap-0.5">
                      <p
                        class="
                          m-0 text-[length:var(--app-font-sm)]
                          font-bold leading-[1.3] text-[var(--app-heading)]
                        "
                      >
                        {{ latestStatusNote.actor }}
                      </p>

                      <p
                        class="
                          m-0 text-[length:var(--app-font-xs)]
                          leading-[1.4] text-[var(--app-muted)]
                        "
                      >
                        {{ latestStatusNote.role }}
                      </p>
                    </div>
                  </div>

                  <p
                    class="
                      m-0 text-[length:var(--app-font-sm)]
                      leading-[1.6] text-[var(--app-text)]
                    "
                  >
                    {{ latestStatusNote.note }}
                  </p>

                  <div
                    class="
                      flex items-center gap-2
                      text-[length:var(--app-font-xs)]
                      leading-[1.4] text-[var(--app-muted)]
                    "
                  >
                    <Clock class="h-4 w-4" />

                    <span>{{ latestStatusNote.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </VCard>

          <div class="flex justify-end gap-4 max-[768px]:flex-col">
            <VButton
              v-if="isApproved"
              variant="primary"
              @click="handleDownload"
            >
              Unduh Surat
            </VButton>

            <VButton
              v-if="isCancelable"
              variant="secondary"
              @click="showCancelDialog = true"
            >
              Batalkan Pengajuan
            </VButton>
          </div>
        </div>
      </div>
    </main>

    <ConfirmationModal
      v-model:isOpen="showCancelDialog"
      title="Batalkan Pengajuan"
      description="Apakah Anda yakin ingin membatalkan pengajuan surat ini? Tindakan ini tidak dapat dikembalikan."
      confirmText="Iya"
      cancelText="Tidak"
      :loading="isCancelling"
      @confirm="cancelRequest"
    />
  </DashboardLayout>
</template>