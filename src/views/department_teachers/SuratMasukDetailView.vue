<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import { useGlobalAlert } from '@/composables/useGlobalAlert'
import { useSuratMasukStore, type DisposisiPayload } from '@/stores/surat-masuk'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import DisposisiModal from '@/components/department_teachers/DisposisiModal.vue'
import VModal from '@/components/common/VModal.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'
import VActionButton from '@/components/common/VActionButton.vue'
import VButton from '@/components/common/VButton.vue'
import VCard from '@/components/common/VCard.vue'
import VChip from '@/components/common/VChip.vue'

import {
  ArrowLeftIcon,
  FileTextIcon,
  LoaderCircleIcon,
  SendIcon,
  UserRoundIcon,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const suratMasukStore = useSuratMasukStore()
const { showAlert } = useGlobalAlert()

const idSurat = route.params.id as string
const isDisposisiModalOpen = ref(false)
const isVerifyModalOpen = ref(false)
const verifyNote = ref('')

const suratDetail = computed(() => suratMasukStore.suratDetail)

const canDisposisi = computed(() => {
  const role = authStore.role || ''
  const detail = suratMasukStore.suratDetail
  const status = detail?.status
  const isBidang = ['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'].includes(role)

  const localUser = JSON.parse(localStorage.getItem('user') || 'null') as { id?: number } | null
  const currentUserId = typeof localUser?.id === 'number' ? localUser.id : null
  const currentUserName = (authStore.user?.nama || '').trim().toLowerCase()
  const pencatatName = (detail?.pencatat_nama || '').trim().toLowerCase()

  const isOwnerById = currentUserId !== null && detail?.pencatat_id === currentUserId
  const isOwnerByName = Boolean(currentUserName && pencatatName && currentUserName === pencatatName)
  const isOwner = isOwnerById || isOwnerByName

  return isBidang && status === 'diajukan' && isOwner
})

const fetchDetail = async () => {
  try {
    await suratMasukStore.fetchSuratMasukDetail(idSurat)
  } catch {
    showAlert('error', 'Gagal memuat detail surat.', 'Error')
    router.push('/department-teachers/surat-masuk')
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const formatStatus = (status?: string) => {
  if (!status) return '-'

  return status.replace(/_/g, ' ')
}

const getStatusVariant = (status?: string) => {
  const normalizedStatus = String(status || '').toLowerCase()

  if (['diajukan', 'pending'].includes(normalizedStatus)) return 'tertiary' as const
  if (['didisposisikan', 'disposisi', 'diproses'].includes(normalizedStatus)) return 'warning' as const
  if (['selesai', 'verified', 'disetujui'].includes(normalizedStatus)) return 'primary' as const
  if (['ditolak', 'rejected', 'dibatalkan'].includes(normalizedStatus)) return 'danger' as const

  return 'primary' as const
}

const getSifatVariant = (sifat?: string) => {
  const normalizedSifat = String(sifat || '').toLowerCase()

  if (normalizedSifat === 'penting') return 'warning' as const
  if (normalizedSifat === 'rahasia') return 'danger' as const

  return 'primary' as const
}

const openFile = () => {
  if (suratMasukStore.suratDetail?.file_lampiran) {
    window.open(suratMasukStore.suratDetail.file_lampiran, '_blank')
  } else {
    showAlert('warning', 'File lampiran tidak tersedia.', 'Perhatian')
  }
}

const handleDisposisiSubmit = async (payload: DisposisiPayload) => {
  try {
    await suratMasukStore.submitDisposisi(idSurat, payload)
    showAlert('success', 'Surat berhasil didisposisikan ke Kepala Sekolah.', 'Berhasil')
    isDisposisiModalOpen.value = false
    await fetchDetail()
  } catch {
    showAlert('error', suratMasukStore.error || 'Gagal memproses disposisi.', 'Gagal')
  }
}

const canVerifyAsKepsek = computed(() => {
  const role = authStore.role || ''
  return role === 'KEPSEK' && suratMasukStore.suratDetail?.status === 'menunggu_verifikasi_kepsek'
})

const handleVerifySubmit = async () => {
  if (!verifyNote.value || !verifyNote.value.trim()) {
    showAlert('warning', 'Catatan verifikasi wajib diisi.', 'Perhatian')
    return
  }

  try {
    await suratMasukStore.verifySuratMasuk(idSurat, verifyNote.value.trim())
    showAlert('success', 'Surat berhasil diverifikasi dan ditandai selesai.', 'Berhasil')
    isVerifyModalOpen.value = false
    verifyNote.value = ''
    await fetchDetail()
  } catch {
    showAlert('error', suratMasukStore.error || 'Gagal memverifikasi surat.', 'Gagal')
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main class="surat-detail-page">
      <VActionButton
        variant="secondary"
        class="surat-detail-back-button"
        @click="router.back()"
      >
        <ArrowLeftIcon :size="16" />
        <span>Kembali ke Daftar Surat</span>
      </VActionButton>

      <section
        v-if="suratMasukStore.loadingDetail"
        class="surat-detail-loading"
      >
        <LoaderCircleIcon
          class="surat-detail-loading-icon"
          :size="32"
        />

        <p class="surat-detail-loading-text">
          Memuat Detail Surat...
        </p>
      </section>

      <template v-else-if="suratDetail">
        <section class="surat-detail-header">
          <h1 class="surat-detail-title">
            Detail Surat Masuk
          </h1>

          <p class="surat-detail-subtitle">
            Informasi lengkap mengenai pencatatan, disposisi, dan pengirim surat.
          </p>
        </section>

        <VCard
          class="surat-detail-card"
          paddingClass="p-6"
          overflowClass="overflow-visible"
        >
          <div class="surat-detail-card-content">
            <header class="surat-detail-section-header">
              <div class="surat-detail-section-heading">
                <div class="surat-detail-section-icon">
                  <UserRoundIcon :size="30" />
                </div>

                <div class="surat-detail-section-copy">
                  <p class="surat-detail-section-eyebrow">
                    Informasi Pencatatan
                  </p>

                  <h2 class="surat-detail-section-title">
                    Sistem Admin
                  </h2>
                </div>
              </div>

              <VChip
                class="surat-detail-chip surat-detail-chip--meta"
                :label="`Pencatat: ${suratDetail.pencatat_nama || '-'}`"
                variant="primary"
              />
            </header>

            <div class="surat-detail-grid">
              <div class="surat-detail-info-item">
                <span class="surat-detail-info-label">Nomor Agenda</span>
                <span class="surat-detail-info-value">
                  {{ suratDetail.nomor_agenda }}
                </span>
              </div>

              <div class="surat-detail-info-item">
                <span class="surat-detail-info-label">Ditujukan Kepada</span>
                <span class="surat-detail-info-value">
                  Kepala Sekolah
                </span>
              </div>

              <div class="surat-detail-info-item">
                <span class="surat-detail-info-label">Status Surat</span>

                <VChip
                  class="surat-detail-chip surat-detail-chip--status"
                  :label="formatStatus(suratDetail.status)"
                  :variant="getStatusVariant(suratDetail.status)"
                />
              </div>

              <div class="surat-detail-info-item">
                <span class="surat-detail-info-label">Tanggal Surat</span>
                <span class="surat-detail-info-value">
                  {{ formatDate(suratDetail.tanggal_surat) }}
                </span>
              </div>

              <div class="surat-detail-info-item">
                <span class="surat-detail-info-label">Tanggal Diterima</span>
                <span class="surat-detail-info-value">
                  {{ formatDate(suratDetail.tanggal_terima) }}
                </span>
              </div>

              <div class="surat-detail-info-item">
                <span class="surat-detail-info-label">Jenis Surat</span>
                <span class="surat-detail-info-value">
                  {{ suratDetail.jenis_surat || '-' }}
                </span>
              </div>

              <div class="surat-detail-info-item surat-detail-info-item--full">
                <span class="surat-detail-info-label">Perihal</span>
                <span class="surat-detail-info-value surat-detail-info-value--paragraph">
                  {{ suratDetail.perihal }}
                </span>
              </div>
            </div>

            <div class="surat-detail-actions">
              <VButton
                v-if="suratDetail.file_lampiran"
                variant="secondary"
                @click="openFile"
              >
                <template #leftIcon>
                  <FileTextIcon :size="18" />
                </template>

                Lihat Dokumen Fisik
              </VButton>

              <VButton
                v-if="canDisposisi"
                variant="primary"
                @click="isDisposisiModalOpen = true"
              >
                <template #leftIcon>
                  <SendIcon :size="18" />
                </template>

                Disposisi Surat
              </VButton>

              <VButton
                v-if="canVerifyAsKepsek"
                variant="primary"
                @click="isVerifyModalOpen = true"
              >
                <template #leftIcon>
                  <SendIcon :size="18" />
                </template>

                Verifikasi & Selesai
              </VButton>
            </div>
          </div>
        </VCard>

        <VCard
          class="surat-detail-card"
          paddingClass="p-6"
          overflowClass="overflow-visible"
        >
          <div class="surat-detail-card-content">
            <header class="surat-detail-section-header">
              <div class="surat-detail-section-heading">
                <div class="surat-detail-section-icon">
                  <FileTextIcon :size="30" />
                </div>

                <div class="surat-detail-section-copy">
                  <p class="surat-detail-section-eyebrow">
                    Pengirim Dokumen
                  </p>

                  <h2 class="surat-detail-section-title">
                    Informasi Instansi
                  </h2>
                </div>
              </div>
            </header>

            <div class="surat-detail-grid">
              <div class="surat-detail-info-item">
                <span class="surat-detail-info-label">Nama Instansi / Pengirim</span>
                <span class="surat-detail-info-value">
                  {{ suratDetail.pengirim?.nama_instansi || '-' }}
                </span>
              </div>

              <div class="surat-detail-info-item surat-detail-info-item--wide">
                <span class="surat-detail-info-label">Alamat Pengirim</span>
                <span class="surat-detail-info-value">
                  {{ suratDetail.pengirim?.alamat || '-' }}
                </span>
              </div>

              <div class="surat-detail-info-item surat-detail-info-item--full">
                <span class="surat-detail-info-label">Kontak Pengirim</span>
                <span class="surat-detail-info-value">
                  {{ suratDetail.pengirim?.kontak || '-' }}
                </span>
              </div>
            </div>
          </div>
        </VCard>

        <VCard
          v-if="suratDetail.disposisi_terakhir"
          class="surat-detail-disposition-card"
          paddingClass="p-6"
          overflowClass="overflow-visible"
        >
          <div class="surat-detail-disposition-content">
            <header class="surat-detail-disposition-header">
              <div class="surat-detail-disposition-heading">
                <div class="surat-detail-disposition-icon">
                  <SendIcon :size="24" />
                </div>

                <div>
                  <h2 class="surat-detail-disposition-title">
                    Lembar Disposisi
                  </h2>

                  <p class="surat-detail-disposition-meta">
                    Diteruskan oleh:
                    {{ suratDetail.disposisi_terakhir.from_user_nama }}
                  </p>
                </div>
              </div>

              <VChip
                class="surat-detail-chip surat-detail-chip--status"
                :label="suratDetail.disposisi_terakhir.sifat"
                :variant="getSifatVariant(suratDetail.disposisi_terakhir.sifat)"
              />
            </header>

            <section class="surat-detail-disposition-note">
              <span class="surat-detail-disposition-note-label">
                Instruksi / Catatan Telaah:
              </span>

              <p class="surat-detail-disposition-note-text">
                “{{ suratDetail.disposisi_terakhir.instruksi }}”
              </p>
            </section>

            <p class="surat-detail-disposition-date">
              Dikirim pada:
              {{ formatDate(suratDetail.disposisi_terakhir.created_at) }}
            </p>
          </div>
        </VCard>
      </template>
    </main>

    <DisposisiModal
      :isOpen="isDisposisiModalOpen"
      :loading="suratMasukStore.submittingDisposisi"
      @update:isOpen="isDisposisiModalOpen = $event"
      @submit="handleDisposisiSubmit"
    />

    <VModal
      :isOpen="isVerifyModalOpen"
      title="Verifikasi Kepala Sekolah"
      description="Tambahkan catatan/ arahan singkat sebelum menandai surat sebagai selesai."
      :buttons="[]"
      maxWidthClass="max-w-[560px]"
      @update:isOpen="(val) => { isVerifyModalOpen = val }">
      <div class="mt-4 flex w-full flex-col gap-5 text-left font-[var(--font-sans)] text-[var(--app-text)]">
        <VTextareaField
          :modelValue="verifyNote"
          label="Catatan / Arahan"
          placeholder="Tuliskan arahan singkat untuk tindak lanjut..."
          :rows="5"
          @update:modelValue="(v) => { verifyNote = v }"
        />

        <div class="relative z-10 mt-2 flex items-center justify-end gap-3">
          <VButton variant="secondary" class="min-w-[104px]" @click="isVerifyModalOpen = false">Batal</VButton>
          <VButton variant="primary" class="min-w-[160px]" @click="handleVerifySubmit">Verifikasi & Selesai</VButton>
        </div>
      </div>
    </VModal>
  </DashboardLayout>
</template>

<style scoped>
.surat-detail-page {
  display: flex;
  width: 100%;
  min-height: 100vh;
  flex-direction: column;
  align-items: stretch;
  flex: 1;
  max-width: none;
  gap: 24px;
  background: var(--app-bg);
  color: var(--app-text);
  font-family: var(--font-sans);
  padding: 32px;
}

.surat-detail-back-button {
  align-self: flex-start;
  width: fit-content;
}

.surat-detail-chip {
  min-height: 38px;
  padding: 0 18px;
  font-size: var(--app-font-sm);
  font-weight: 800;
}

.surat-detail-chip--meta {
  min-height: 42px;
  padding: 0 20px;
}

.surat-detail-chip--status {
  min-height: 40px;
  padding: 0 18px;
}

.surat-detail-loading {
  display: flex;
  min-height: 320px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
}

.surat-detail-loading-icon {
  color: var(--app-accent);
  animation: surat-detail-spin 0.8s linear infinite;
}

.surat-detail-loading-text {
  margin: 0;
  color: var(--app-subtext);
  font-size: var(--app-font-sm);
  font-weight: 600;
  line-height: 1.5;
}

.surat-detail-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.surat-detail-title {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-page-title-font);
  font-weight: 800;
  line-height: 1.2;
}

.surat-detail-subtitle {
  margin: 0;
  color: var(--app-subtext);
  font-size: var(--app-page-subtitle-font);
  line-height: 1.4;
}

.surat-detail-card,
.surat-detail-disposition-card {
  width: 100%;
  border-color: var(--app-card-border);
  background: var(--app-card);
  color: var(--app-text);
  box-shadow: var(--app-card-shadow);
}

.surat-detail-card-content,
.surat-detail-disposition-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.surat-detail-section-header,
.surat-detail-disposition-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid var(--app-card-border);
  padding-bottom: 18px;
}

.surat-detail-section-heading,
.surat-detail-disposition-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 14px;
}

.surat-detail-section-icon,
.surat-detail-disposition-icon {
  display: flex;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: var(--gradient-brand);
  color: var(--app-text-inverse);
}

.surat-detail-section-copy {
  min-width: 0;
}

.surat-detail-section-eyebrow {
  margin: 0;
  color: var(--app-subtext);
  font-size: var(--app-font-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  line-height: 1.3;
  text-transform: uppercase;
}

.surat-detail-section-title,
.surat-detail-disposition-title {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-section-title-font);
  font-weight: 800;
  line-height: 1.2;
}

.surat-detail-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 40px;
  row-gap: 24px;
}

.surat-detail-info-item {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
}

.surat-detail-info-item--wide {
  grid-column: span 2;
}

.surat-detail-info-item--full {
  grid-column: 1 / -1;
}

.surat-detail-info-label {
  color: var(--app-subtext);
  font-size: var(--app-font-sm);
  font-weight: 600;
  line-height: 1.35;
}

.surat-detail-info-value {
  color: var(--app-heading);
  font-size: var(--app-font-md);
  font-weight: 700;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.surat-detail-info-value--paragraph {
  font-weight: 600;
  line-height: 1.6;
}

.surat-detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  border-top: 1px solid var(--app-card-border);
  padding-top: 18px;
}

.surat-detail-disposition-card {
  position: relative;
}

.surat-detail-disposition-card::before {
  position: absolute;
  inset: 0 auto 0 0;
  width: 6px;
  border-radius: 999px 0 0 999px;
  background: var(--app-warning);
  content: '';
}

.surat-detail-disposition-meta {
  margin: 6px 0 0;
  color: var(--app-subtext);
  font-size: var(--app-font-sm);
  font-weight: 600;
  line-height: 1.4;
}

.surat-detail-disposition-note {
  border: 1px solid var(--app-warning-border);
  border-radius: 16px;
  background: var(--app-warning-bg);
  padding: 18px;
}

.surat-detail-disposition-note-label {
  color: var(--app-warning);
  font-size: var(--app-font-xs);
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1.3;
  text-transform: uppercase;
}

.surat-detail-disposition-note-text {
  margin: 10px 0 0;
  color: var(--app-subtext);
  font-size: var(--app-font-base);
  font-style: italic;
  font-weight: 600;
  line-height: 1.6;
}

.surat-detail-disposition-date {
  margin: 0;
  color: var(--app-subtext);
  font-size: var(--app-font-xs);
  font-weight: 600;
  line-height: 1.4;
  text-align: right;
}

@keyframes surat-detail-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .surat-detail-page {
    padding: 24px;
  }

  .surat-detail-section-header,
  .surat-detail-disposition-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .surat-detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .surat-detail-info-item--wide {
    grid-column: 1 / -1;
  }
}

@media (max-width: 640px) {
  .surat-detail-page {
    gap: 18px;
    padding: 18px;
  }

  .surat-detail-back-button {
    width: 100%;
    max-width: 320px;
  }

  .surat-detail-grid {
    grid-template-columns: 1fr;
  }

  .surat-detail-actions {
    flex-direction: column;
  }
}
</style>
