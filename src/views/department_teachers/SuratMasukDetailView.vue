<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import { useGlobalAlert } from '@/composables/useGlobalAlert'
import { useSuratMasukStore, type DisposisiPayload } from '@/stores/surat-masuk'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import DisposisiModal from '@/components/department_teachers/DisposisiModal.vue'

// REUSABLE COMPONENTS
import VCard from '@/components/common/VCard.vue'
import VButton from '@/components/common/VButton.vue'
import VChip from '@/components/common/VChip.vue'
import { ArrowLeftIcon, FileTextIcon, SendIcon } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const suratMasukStore = useSuratMasukStore()
const { showAlert } = useGlobalAlert()

const idSurat = route.params.id as string

const isDisposisiModalOpen = ref(false)

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

onMounted(() => {
  fetchDetail()
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <div class="w-full min-h-screen bg-[#f8fafc]">
      <div class="w-full max-w-[1120px] mx-auto px-8 py-8 max-[768px]:px-4 flex flex-col gap-6">
        <button
          @click="router.back()"
          class="flex items-center gap-2 text-[#64748b] hover:text-[#3f9760] transition-colors w-fit font-semibold"
        >
          <ArrowLeftIcon :size="20" />
          <span class="text-[15px]">Kembali ke Daftar Surat</span>
        </button>

        <div v-if="suratMasukStore.loadingDetail" class="flex justify-center items-center py-20">
          <div class="flex flex-col items-center gap-3">
            <div
              class="w-8 h-8 border-4 border-[#3f9760] border-t-transparent rounded-full animate-spin"
            ></div>
            <p class="text-[#64748b] font-medium">Memuat Detail Surat...</p>
          </div>
        </div>

        <div v-else-if="suratMasukStore.suratDetail" class="flex flex-col gap-6">
          <div class="mb-2">
            <h1 class="m-0 text-[32px] leading-[120%] font-bold text-[#1e293b] tracking-tight">
              Detail Surat Masuk
            </h1>
            <p class="mt-2 mb-0 text-[16px] text-[#64748b]">
              Informasi lengkap mengenai pencatatan, disposisi, dan pengirim surat.
            </p>
          </div>

          <VCard
            paddingClass="p-8"
            class="bg-white border border-[#e2e8f0] shadow-sm rounded-[24px]"
          >
            <div class="flex flex-col gap-8">
              <div
                class="flex flex-wrap items-center justify-between gap-4 border-b border-[#f1f5f9] pb-6"
              >
                <div class="flex items-center gap-5">
                  <div class="flex-shrink-0">
                    <svg
                      width="61"
                      height="61"
                      viewBox="0 0 61 61"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="61" height="61" rx="16" fill="url(#paint0_linear_1_4344)" />
                      <path
                        d="M42 46.5C42 43.3174 40.7357 40.2652 38.4853 38.0147C36.2348 35.7643 33.1826 34.5 30 34.5M30 34.5C26.8174 34.5 23.7652 35.7643 21.5147 38.0147C19.2643 40.2652 18 43.3174 18 46.5M30 34.5C34.4183 34.5 38 30.9183 38 26.5C38 22.0817 34.4183 18.5 30 18.5C25.5817 18.5 22 22.0817 22 26.5C22 30.9183 25.5817 34.5 30 34.5ZM50 30.5C50 41.5457 41.0457 50.5 30 50.5C18.9543 50.5 10 41.5457 10 30.5C10 19.4543 18.9543 10.5 30 10.5C41.0457 10.5 50 19.4543 50 30.5Z"
                        stroke="#F8FAFC"
                        stroke-width="3"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear_1_4344"
                          x1="0"
                          y1="0"
                          x2="61.7742"
                          y2="0.794418"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stop-color="#3F9760" />
                          <stop offset="1" stop-color="#D1955F" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div class="flex flex-col gap-1.5">
                    <p
                      class="text-[14px] font-semibold text-[#64748b] tracking-wider uppercase m-0"
                    >
                      Informasi Pencatatan
                    </p>
                    <h2 class="text-[22px] font-bold text-[#1e293b] leading-none m-0">
                      Sistem Admin
                    </h2>
                  </div>
                </div>
                <VChip
                  :label="`Pencatat: ${suratMasukStore.suratDetail.pencatat_nama || '-'}`"
                  variant="primary"
                  class="!bg-[#f0fdf4] !text-[#166534] !border !border-[#bbf7d0] !text-[16px] !px-4 !py-4 !font-bold"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
                <div class="flex flex-col gap-1.5">
                  <span class="text-[14px] font-medium text-[#64748b]">Nomor Agenda</span>
                  <span class="text-[18px] font-semibold text-[#1e293b]">{{
                    suratMasukStore.suratDetail.nomor_agenda
                  }}</span>
                </div>
                <div class="flex flex-col gap-1.5">
                  <span class="text-[14px] font-medium text-[#64748b]">Ditujukan Kepada</span>
                  <span class="text-[18px] font-semibold text-[#1e293b]">Kepala Sekolah</span>
                </div>
                <div class="flex flex-col gap-1.5">
                  <span class="text-[14px] font-medium text-[#64748b]">Status Surat</span>
                  <span class="text-[18px] font-semibold text-[#1e293b] capitalize">{{
                    suratMasukStore.suratDetail.status.replace(/_/g, ' ')
                  }}</span>
                </div>
                <div class="flex flex-col gap-1.5">
                  <span class="text-[14px] font-medium text-[#64748b]">Tanggal Surat</span>
                  <span class="text-[18px] font-semibold text-[#1e293b]">{{
                    formatDate(suratMasukStore.suratDetail.tanggal_surat)
                  }}</span>
                </div>
                <div class="flex flex-col gap-1.5">
                  <span class="text-[14px] font-medium text-[#64748b]">Tanggal Diterima</span>
                  <span class="text-[18px] font-semibold text-[#1e293b]">{{
                    formatDate(suratMasukStore.suratDetail.tanggal_terima)
                  }}</span>
                </div>
                <div class="flex flex-col gap-1.5">
                  <span class="text-[14px] font-medium text-[#64748b]">Jenis Surat</span>
                  <span class="text-[18px] font-semibold text-[#1e293b]">{{
                    suratMasukStore.suratDetail.jenis_surat || '-'
                  }}</span>
                </div>
                <div class="flex flex-col gap-1.5 md:col-span-2 lg:col-span-3">
                  <span class="text-[14px] font-medium text-[#64748b]">Perihal</span>
                  <span class="text-[18px] font-medium text-[#1e293b] leading-relaxed">{{
                    suratMasukStore.suratDetail.perihal
                  }}</span>
                </div>
              </div>

              <div class="pt-6 border-t border-[#f1f5f9] flex flex-wrap items-center gap-4">
                <VButton
                  v-if="suratMasukStore.suratDetail.file_lampiran"
                  variant="secondary"
                  class="!bg-white !border-[#cbd5e1] hover:!bg-[#f8fafc] !text-[#475569] !rounded-[12px] !h-[44px]"
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
                  class="!bg-gradient-to-r !from-[#3F9760] !to-[#2f7a4b] !border-none !rounded-[12px] !h-[44px] shadow-[0_4px_12px_rgba(63,151,96,0.25)] hover:shadow-[0_6px_16px_rgba(63,151,96,0.35)] transition-all"
                  @click="isDisposisiModalOpen = true"
                >
                  <template #leftIcon>
                    <SendIcon :size="18" class="text-white" />
                  </template>
                  <span class="font-semibold text-white">Disposisi Surat</span>
                </VButton>
              </div>
            </div>
          </VCard>
          <VCard
            paddingClass="p-8"
            class="bg-white border border-[#e2e8f0] shadow-sm rounded-[24px]"
          >
            <div class="flex flex-col gap-8">
              <div class="flex items-center gap-5 border-b border-[#f1f5f9] pb-6">
                <div class="flex-shrink-0">
                  <svg
                    width="61"
                    height="61"
                    viewBox="0 0 61 61"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="61" height="61" rx="16" fill="url(#paint0_linear_1_4311)" />
                    <path
                      d="M33.3337 13.8334H20.0003C19.1163 13.8334 18.2684 14.1846 17.6433 14.8097C17.0182 15.4348 16.667 16.2827 16.667 17.1667V43.8334C16.667 44.7174 17.0182 45.5653 17.6433 46.1904C18.2684 46.8155 19.1163 47.1667 20.0003 47.1667H40.0003C40.8844 47.1667 41.7322 46.8155 42.3573 46.1904C42.9825 45.5653 43.3337 44.7174 43.3337 43.8334V23.8334M33.3337 13.8334C33.8612 13.8325 34.3838 13.936 34.8712 14.138C35.3586 14.3399 35.8013 14.6363 36.1737 15.01L42.1537 20.99C42.5284 21.3626 42.8256 21.8056 43.0281 22.2936C43.2307 22.7817 43.3345 23.305 43.3337 23.8334M33.3337 13.8334V22.1667C33.3337 22.6087 33.5093 23.0327 33.8218 23.3452C34.1344 23.6578 34.5583 23.8334 35.0003 23.8334L43.3337 23.8334M26.667 25.5H23.3337M36.667 32.1667H23.3337M36.667 38.8334H23.3337"
                      stroke="white"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_1_4311"
                        x1="0"
                        y1="0"
                        x2="61.7742"
                        y2="0.794418"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stop-color="#3F9760" />
                        <stop offset="1" stop-color="#D1955F" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div class="flex flex-col gap-1.5">
                  <p class="text-[14px] font-semibold text-[#64748b] tracking-wider uppercase m-0">
                    Pengirim Dokumen
                  </p>
                  <h2 class="text-[22px] font-bold text-[#1e293b] leading-none m-0">
                    Informasi Instansi
                  </h2>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-12">
                <div class="flex flex-col gap-1.5">
                  <span class="text-[14px] font-medium text-[#64748b]"
                    >Nama Instansi / Pengirim</span
                  >
                  <span class="text-[18px] font-semibold text-[#1e293b]">{{
                    suratMasukStore.suratDetail.pengirim?.nama_instansi || '-'
                  }}</span>
                </div>
                <div class="flex flex-col gap-1.5 md:col-span-2 lg:col-span-2">
                  <span class="text-[14px] font-medium text-[#64748b]">Alamat Pengirim</span>
                  <span class="text-[18px] font-semibold text-[#1e293b]">{{
                    suratMasukStore.suratDetail.pengirim?.alamat || '-'
                  }}</span>
                </div>
                <div class="flex flex-col gap-1.5 md:col-span-2 lg:col-span-3">
                  <span class="text-[14px] font-medium text-[#64748b]">Kontak Pengirim</span>
                  <span class="text-[18px] font-semibold text-[#1e293b]">{{
                    suratMasukStore.suratDetail.pengirim?.kontak || '-'
                  }}</span>
                </div>
              </div>
            </div>
          </VCard>
          <div
            v-if="suratMasukStore.suratDetail.disposisi_terakhir"
            class="relative overflow-hidden bg-gradient-to-br from-[#fdfbf7] to-[#fffefc] border border-[#fde68a] shadow-[0_4px_20px_rgba(245,158,11,0.05)] rounded-[24px] p-8"
          >
            <div
              class="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#f59e0b] to-[#fbbf24]"
            ></div>

            <div class="flex flex-col gap-6">
              <div
                class="flex flex-wrap items-center justify-between gap-4 border-b border-[#fef3c7] pb-5"
              >
                <div class="flex items-center gap-4">
                  <div
                    class="w-12 h-12 rounded-full bg-[#fef3c7] flex items-center justify-center text-[#d97706] shadow-inner"
                  >
                    <SendIcon :size="22" stroke-width="2.5" />
                  </div>
                  <div class="flex flex-col">
                    <h2 class="text-[20px] font-bold text-[#92400e] leading-none m-0">
                      Lembar Disposisi
                    </h2>
                    <p class="text-[14px] text-[#b45309] font-medium mt-1.5 m-0">
                      Diteruskan oleh:
                      {{ suratMasukStore.suratDetail.disposisi_terakhir.from_user_nama }}
                    </p>
                  </div>
                </div>
                <div
                  class="flex items-center gap-2 px-4 py-1.5 bg-white border border-[#fcd34d] rounded-full shadow-sm"
                >
                  <div
                    class="w-2 h-2 rounded-full"
                    :class="
                      suratMasukStore.suratDetail.disposisi_terakhir.sifat === 'Penting'
                        ? 'bg-[#ef4444] animate-pulse'
                        : 'bg-[#10b981]'
                    "
                  ></div>
                  <span class="text-[13px] font-bold text-[#92400e] uppercase tracking-wider">{{
                    suratMasukStore.suratDetail.disposisi_terakhir.sifat
                  }}</span>
                </div>
              </div>

              <div
                class="bg-white p-6 rounded-[16px] border border-[#fef08a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              >
                <span class="text-[12px] font-bold text-[#b45309] uppercase tracking-widest"
                  >Instruksi / Catatan Telaah:</span
                >
                <p class="mt-3 text-[16px] text-[#334155] leading-relaxed italic font-medium">
                  "{{ suratMasukStore.suratDetail.disposisi_terakhir.instruksi }}"
                </p>
              </div>

              <p class="text-[12px] font-medium text-[#d97706] text-right m-0">
                Dikirim pada:
                {{ formatDate(suratMasukStore.suratDetail.disposisi_terakhir.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DisposisiModal
      :isOpen="isDisposisiModalOpen"
      :loading="suratMasukStore.submittingDisposisi"
      @update:isOpen="isDisposisiModalOpen = $event"
      @submit="handleDisposisiSubmit"
    />
  </DashboardLayout>
</template>
