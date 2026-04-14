<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  FileText,
  ArrowLeft,
  XCircle,
  CheckCircle,
  Settings,
  CircleHelp,
  LogOut,
  Folder,
  User,
  Calendar,
} from 'lucide-vue-next'

import { useAuthStore } from '@/stores/users/auth'
import { useSuratAntreanStore } from '@/stores/surat_antrean'
import VChip from '@/components/common/VChip.vue'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import RejectModal from '@/components/surat_antrean/RejectModal.vue'

const route = useRoute()
const router = useRouter()
const store = useSuratAntreanStore()
const authStore = useAuthStore()

const navItems = [
  {
    name: 'verifikasi',
    label: 'Verifikasi dan Persetujuan Berjenjang',
    path: '/surat-antrean',
    icon: FileText,
  },
  {
    name: 'detail-surat',
    label: 'Detail Surat',
    path: '/surat-antrean/detail',
    icon: FileText,
    isActive: true,
  },
]

const bottomItems = [
  { name: 'settings', label: 'Settings', icon: Settings },
  { name: 'help', label: 'Help', icon: CircleHelp },
  { name: 'logout', label: 'Log Out', icon: LogOut },
]

const generalError = ref('')
const successMessage = ref('')
const isRejectModalOpen = ref(false)

const surat = computed(() => store.selectedSurat)
const loading = computed(() => store.detailLoading)
const actionLoading = computed(() => store.actionLoading)

function parseJsonSafely<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'Diproses':
      return 'bg-[#3f9760] text-white'
    case 'Disetujui':
      return 'bg-[#3f9760] text-white'
    case 'Ditolak':
      return 'bg-[#3f9760] text-white'
    default:
      return 'bg-[#3f9760] text-white'
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

function goBack() {
  router.push('/surat-antrean')
}

async function handleApprove() {
  if (!surat.value) return

  generalError.value = ''
  successMessage.value = ''

  try {
    await store.approveSurat(surat.value.id_surat)
    successMessage.value = 'Surat berhasil disetujui.'
  } catch (error) {
    generalError.value = 'Gagal menyetujui surat. Silakan coba lagi.'
  }
}

function openRejectModal() {
  isRejectModalOpen.value = true
}

function closeRejectModal() {
  isRejectModalOpen.value = false
}

async function handleReject(needRevision: boolean, userNote: string) {
  if (!surat.value) return

  generalError.value = ''
  successMessage.value = ''

  const reason = needRevision ? `[Revisi Required] ${userNote}` : `[No Revision] ${userNote}`

  try {
    await store.rejectSurat(surat.value.id_surat, reason)
    successMessage.value = 'Surat berhasil ditolak.'
    isRejectModalOpen.value = false
  } catch (error) {
    generalError.value = 'Gagal menolak surat. Silakan coba lagi.'
  }
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (id) {
    try {
      await store.fetchSuratDetail(id)
    } catch {
      generalError.value = 'Gagal memuat detail surat.'
    }
  }
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <AdminSidebar :navItems="navItems" :bottomItems="bottomItems" />
    </template>

    <div class="p-8 flex flex-col gap-6 h-full font-['Plus_Jakarta_Sans']">
      <!-- Back Button -->
      <section class="mb-6">
        <button type="button" class="flex items-center gap-2 text-[#71757b] hover:text-[#111827] transition-colors"
          @click="goBack">
          <ArrowLeft class="h-5 w-5" />
          <span class="text-[14px] font-medium">Kembali</span>
        </button>
      </section>

      <!-- Alerts -->
      <section class="mb-6">
        <VAlert v-if="generalError" type="error" title="Gagal" :message="generalError" @close="generalError = ''" />

        <VAlert v-if="successMessage" type="success" title="Berhasil" :message="successMessage"
          @close="successMessage = ''" />
      </section>

      <!-- Loading State -->
      <section v-if="loading"
        class="rounded-[28px] border border-[#d9e2e7] bg-white/80 px-6 py-10 text-center text-[#858a91]">
        Memuat detail surat...
      </section>

      <!-- Detail Content -->
      <section v-else-if="surat" class="flex flex-col gap-6">
        <article
          class="rounded-[20px] border border-[#e5e7eb] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:-translate-y-0.5">

          <!-- Header: Title & Status -->
          <div class="flex items-start justify-between gap-4 mb-3">
            <h3 class="text-[18px] font-bold leading-[1.4] text-[#111827] flex-1">
              {{ surat.perihal }}
            </h3>
            <span :class="[
              'px-4 py-1.5 rounded-full text-[14px] font-semibold whitespace-nowrap',
              getStatusVariant(surat.status)
            ]">
              {{ surat.status }}
            </span>
          </div>

          <!-- Description -->
          <p class="text-[14px] text-[#6b7280] mb-4 leading-relaxed">
            {{ surat.description || 'Pengajuan kegiatan pramuka kelas 10' }}
          </p>

          <!-- Meta Information -->
          <div class="flex flex-wrap items-center gap-5 mb-5">
            <div class="flex items-center gap-1.5 text-[14px] text-[#6b7280]">
              <Folder class="w-4 h-4 text-[#9ca3af]" />
              <span>{{ surat.kategori || 'Kesiswaan' }}</span>
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

        <!-- Content Section -->
        <div class="rounded-[28px] border border-[#d9e2e7] bg-white/80 p-6 shadow-sm">
          <h2 class="text-[18px] font-bold leading-[120%] text-[#111827] mb-4">
            Isi Surat
          </h2>
          <div class="text-[14px] leading-[155%] text-[#2f3743] whitespace-pre-wrap">
            {{ surat.deskripsi || 'Tidak ada deskripsi.' }}
          </div>
        </div>

        <!-- Action Buttons (only show if status is Diproses) -->
        <div v-if="surat.status === 'Diproses'" class="flex items-center justify-center gap-4">
          <VButton variant="secondary" class="!rounded-full !px-6 w-150" :disabled="actionLoading"
            @click="openRejectModal">
            Tolak
          </VButton>

          <VButton variant="primary" class="!rounded-full !px-6 w-150" :disabled="actionLoading" @click="handleApprove">
            Terima
          </VButton>
        </div>
      </section>

      <!-- Not Found State -->
      <section v-else class="rounded-[28px] border border-[#d9e2e7] bg-white/80 px-6 py-10 text-center text-[#858a91]">
        Surat tidak ditemukan.
      </section>
    </div>

    <RejectModal :isOpen="isRejectModalOpen" @update:isOpen="closeRejectModal" @confirm="handleReject" />
  </DashboardLayout>
</template>