<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main class="flex-1 overflow-y-auto layout-bg">
      <div class="main-content-wrapper">
        <div class="header-section mb-10">
          <div class="title-group">
            <h1 class="text-[24px] md:text-[28px] font-bold leading-[120%] text-[#111827]">
              Detail Surat Keluar
            </h1>
            <p class="text-[13px] md:text-[14px] leading-[145%] text-[#858a91] mt-1">
              Berikut detail surat keluar
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-6 w-full max-w-[1440px]">
          <section class="card">
            <div class="card-header">
              <div class="header-left">
                <div class="icon-box">
                  <FileText class="icon-white" />
                </div>
                <div>
                  <h2 class="card-title">
                    {{ detail.template_nama || detail.nama_template || '-' }}
                  </h2>
                  <p class="card-id">ID: {{ detail.id_pengajuan || '-' }}</p>
                </div>
              </div>
              <div class="status-chip" :class="getStatusClass(detail.status)">
                {{ detail.status || 'Pending' }}
              </div>
            </div>

            <div class="info-grid three-cols">
              <div class="info-block">
                <div class="info-label">Nomor Surat</div>
                <div class="info-value">{{ detail.nomor_surat || '-' }}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Tanggal Pengajuan</div>
                <div class="info-value">
                  {{ formatDate(detail.tanggal_pengajuan || detail.created_at) }}
                </div>
              </div>
              <div class="info-block">
                <div class="info-label">Pengaju</div>
                <div class="info-value">{{ submittedBy }}</div>
              </div>
            </div>

            <div class="info-grid three-cols mt-6">
              <div class="info-block">
                <div class="info-label">Klasifikasi</div>
                <div class="info-value">{{ detail.klasifikasi || '-' }}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Catatan</div>
                <div class="info-value">{{ latestNote }}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Status Saat Ini</div>
                <div class="info-value">{{ detail.status || 'Pending' }}</div>
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card-header card-header-with-action">
              <div class="header-left">
                <div class="icon-box">
                  <FilePen class="icon-white" />
                </div>
                <div>
                  <h3 class="section-title">{{ formCardTitle }}</h3>
                  <p class="section-subtitle">{{ formCardSubtitle }}</p>
                </div>
              </div>

              <VButton
                v-if="showEditButton"
                variant="tertiary"
                class="btn-edit"
                @click="navigateToRevision"
              >
                {{ editButtonLabel }}
              </VButton>
            </div>

            <div class="info-grid three-cols">
              <template v-if="formDataEntries.length > 0">
                <div v-for="entry in formDataEntries" :key="entry.key" class="info-block">
                  <div class="info-label">{{ entry.label }}</div>
                  <div class="info-value">{{ entry.value }}</div>
                </div>
              </template>

              <template v-else>
                <div class="info-block" style="grid-column: span 3">
                  <div class="info-value" style="color: #64748b; font-style: italic">
                    Tidak ada data tambahan yang diisi.
                  </div>
                </div>
              </template>
            </div>
          </section>

          <section class="card">
            <div class="card-header">
              <div class="header-left">
                <div class="icon-box status-icon-card">
                  <CheckCircle2 class="icon-white" />
                </div>
                <div>
                  <h3 class="section-title">Status Surat</h3>
                  <p class="section-subtitle">
                    Lihat tahapan verifikasi dan catatan dari proses pengajuan.
                  </p>
                </div>
              </div>
            </div>

            <div class="status-steps-container">
              <VSteps :steps="statusSteps" />
            </div>

            <div v-if="latestStatusNote" class="status-summary-card">
              <div class="compact-status-card">
                <div class="compact-status-border"></div>
                <div class="compact-status-content">
                  <div class="compact-status-header">
                    <div class="compact-status-avatar">
                      <User class="compact-status-avatar-icon" />
                    </div>
                    <div class="compact-status-meta">
                      <p class="compact-status-author">{{ latestStatusNote.actor }}</p>
                      <p class="compact-status-role">{{ latestStatusNote.role }}</p>
                    </div>
                  </div>
                  <p class="compact-status-text">{{ latestStatusNote.note }}</p>
                  <div class="compact-status-footer">
                    <Clock class="compact-status-clock" />
                    <span>{{ latestStatusNote.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div class="actions-row">
            <VButton
              v-if="isApproved"
              variant="primary"
              class="btn-primary"
              @click="handleDownload"
            >
              Unduh Surat
            </VButton>

            <VButton
              v-if="isCancelable"
              variant="primary"
              class="btn-danger"
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

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/plugins/axios'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/users/auth'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VSteps from '@/components/common/VSteps.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import { FileText, FilePen, CheckCircle2, Clock, User } from 'lucide-vue-next'
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
  if (payloadObj.data && typeof payloadObj.data === 'object') return payloadObj.data as DetailState
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
    return { actor: 'Sistem', role: 'Sistem', note: 'Belum ada catatan pada tahap ini.', time: '-' }
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

const getStatusClass = (status: unknown) => {
  const normalized = normalizeStatus(status)
  if (
    ['pending', 'diproses', 'menunggu verifikasi kepsek', 'menunggu_verifikasi_kepsek'].includes(
      normalized,
    )
  ) {
    return 'status-pending'
  }
  if (['disetujui', 'selesai', 'verified', 'approved'].includes(normalized)) return 'status-success'
  if (['ditolak', 'rejected', 'dibatalkan'].includes(normalized)) return 'status-danger'
  return 'status-default'
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
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `surat_${detail.value.id_pengajuan}.pdf`)
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

onMounted(fetchDetail)
</script>

<style scoped>
.main-content-wrapper {
  padding: 40px 60px;
  width: 100%;
  max-width: 1440px;
}
.layout-bg {
  background: var(--Gradient-Primary-Background, linear-gradient(180deg, #fff 0%, #eaf7ef 100%));
}
.card {
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--gradient-gradient-10, linear-gradient(91deg, #3f9760 0%, #d1955f 100%));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.status-icon-card {
  background: var(
    --gradient-gradient-10,
    linear-gradient(91deg, #3f9760 0%, #d1955f 100%)
  ) !important;
}
.icon-white {
  color: white;
  width: 26px;
  height: 26px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}
.card-id {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border-radius: 99px;
  font-size: 18px;
  font-weight: 600;
  line-height: 120%;
  text-align: center;
  white-space: nowrap;
}
.status-chip.status-pending {
  background: var(--Primary-Primary-600, #f59e0b);
  box-shadow:
    0 2.526px 5.053px 0 rgba(255, 255, 255, 0.4) inset,
    0 -2.526px 5.053px 0 rgba(0, 0, 0, 0.2) inset;
  backdrop-filter: blur(6.315px);
  color: #ffffff;
}
.status-success {
  background: radial-gradient(77.91% 77.91% at 50% 100%, #4ade80 4.91%, #15803d 100%);
  box-shadow:
    0 2.526px 5.053px 0 rgba(255, 255, 255, 0.4) inset,
    0 -2.526px 5.053px 0 rgba(0, 0, 0, 0.2) inset;
  backdrop-filter: blur(6.315px);
  color: #ffffff;
}
.status-danger {
  background: radial-gradient(77.91% 77.91% at 50% 100%, #f87171 4.91%, #b91c1c 100%);
  box-shadow:
    0 2.526px 5.053px 0 rgba(255, 255, 255, 0.4) inset,
    0 -2.526px 5.053px 0 rgba(0, 0, 0, 0.2) inset;
  backdrop-filter: blur(6.315px);
  color: #ffffff;
}
.status-default {
  background-color: #e2e8f0;
  color: #475569;
}

.info-grid {
  display: grid;
  gap: 24px;
}
.info-grid.three-cols {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.info-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.card-header-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.section-subtitle {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}
.btn-edit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 99px;
  border: 1px solid #d1d5db;
  background: #f8fafc;
  color: #0f172a;
  font-weight: 700;
  cursor: pointer;
}

.info-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}
.info-value {
  font-size: 16px;
  color: #0f172a;
  font-weight: 600;
  line-height: 1.5;
}

.mt-6 {
  margin-top: 24px;
}
.status-summary-card {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 24px;
}
.compact-status-card {
  display: flex;
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
}
.compact-status-border {
  width: 8px;
  background: #15803d;
}
.compact-status-content {
  flex: 1;
  padding: 18px 18px 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.compact-status-header {
  display: flex;
  gap: 12px;
  align-items: center;
}
.compact-status-avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background: #185f3b;
  display: grid;
  place-items: center;
}
.compact-status-avatar-icon {
  width: 18px;
  height: 18px;
  color: #ffffff;
}
.compact-status-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.compact-status-author {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}
.compact-status-role {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}
.compact-status-text {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}
.compact-status-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
}
.compact-status-clock {
  width: 16px;
  height: 16px;
}
.status-steps-container {
  width: 100%;
  padding-bottom: 16px;
}

.actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
}
.btn-secondary,
.btn-danger,
.btn-primary {
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  border: none;
  transition:
    transform 0.2s,
    opacity 0.2s;
}
.btn-secondary {
  background-color: #e2e8f0;
  color: #334155;
}
.btn-danger {
  border-radius: 20px;
  background: radial-gradient(77.91% 77.91% at 50% 100%, #f87171 4.91%, #b91c1c 100%);
  box-shadow:
    0 -2px 0 0 rgba(0, 0, 0, 0.4) inset,
    0 1px 0 0 rgba(248, 250, 252, 0.4) inset;
  color: #ffffff;
}
.btn-primary {
  background: linear-gradient(91deg, #3f9760 0%, #0c4923 100%);
  color: #ffffff;
}
.btn-secondary:hover,
.btn-danger:hover,
.btn-primary:hover {
  transform: translateY(-2px);
  opacity: 0.95;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: grid;
  place-items: center;
  z-index: 100;
}
.modal-card {
  width: min(400px, calc(100% - 32px));
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px;
}
.modal-text {
  color: #475569;
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 24px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .main-content-wrapper {
    padding: 24px 20px;
  }
  .info-grid.three-cols {
    grid-template-columns: 1fr;
  }
  .card-header,
  .card-header-with-action {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  .actions-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
