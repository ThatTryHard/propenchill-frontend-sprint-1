<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  FileText,
  Folder,
  User,
  Calendar,
  Search,
  Settings,
  CircleHelp,
  LogOut,
} from 'lucide-vue-next'

import { useAuthStore } from '@/stores/users/auth'
import { useSuratAntreanStore, type SuratAntrean } from '@/stores/surat_antrean'
import mailIcon from '@/assets/mail.png'
import studentIcon from '@/assets/Siswa SVG.svg'
import diprosesIcon from '@/assets/diproses.png'
import disetujuiIcon from '@/assets/disetujui.png'
import ditolakIcon from '@/assets/ditolak.png'
import VDropdown from '@/components/common/VDropdown.vue'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import VChip from '@/components/common/VChip.vue'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'

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
  },
]

const bottomItems = [
  { name: 'settings', label: 'Settings', icon: Settings },
  { name: 'help', label: 'Help', icon: CircleHelp },
  { name: 'logout', label: 'Log Out', icon: LogOut },
]

const statusFilterOptions = [
  { label: 'Semua', value: '' },
  { label: 'Diproses', value: 'Diproses' },
  { label: 'Disetujui', value: 'Disetujui' },
  { label: 'Ditolak', value: 'Ditolak' },
]

const sortOptions = [
  { label: 'Terbaru', value: 'created_at-desc' },
  { label: 'Terlama', value: 'created_at-asc' },
]

const search = ref('')
const selectedStatusFilter = ref('')
const sortValue = ref('created_at-desc')
const currentPage = ref(1)
const limit = ref(10)
const selectedApprover = ref('')
const isApproverDropdownOpen = ref(false)

const approverOptions = [
  { label: 'Kepala Sekolah', value: 'KEPSEK' },
  { label: 'Kepala Kebidangan', value: 'BIDANG' },
]

const generalError = ref('')
const successMessage = ref('')

const suratList = computed(() => store.suratList)
const stats = computed(() => store.stats)
const pagination = computed(() => store.pagination)

function parseJsonSafely<T>(value: string | null): T | null {
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

const localUser = computed<Record<string, any> | null>(() => {
  return parseJsonSafely<Record<string, any>>(localStorage.getItem('user'))
})

const currentUser = computed<Record<string, any> | null>(() => {
  if (localUser.value) return localUser.value
  const authAny = authStore as unknown as Record<string, any>
  return authAny.user || authAny.currentUser || null
})

const userName = computed(() => {
  return currentUser.value?.nama || currentUser.value?.full_name || currentUser.value?.name || authStore.nama || 'User'
})

const userEmail = computed(() => {
  return currentUser.value?.email || authStore.email || '-'
})

// Filter data berdasarkan status dan search
const filteredSuratList = computed(() => {
  let result = suratList.value

  // Filter berdasarkan status
  if (selectedStatusFilter.value) {
    result = result.filter((s) => s.status === selectedStatusFilter.value)
  }

  // Filter berdasarkan search
  if (search.value.trim()) {
    const query = search.value.toLowerCase()
    result = result.filter(
      (s) =>
        s.perihal.toLowerCase().includes(query) ||
        s.nama_pengaju.toLowerCase().includes(query)
    )
  }

  return result
})

function getStatusVariant(status: string) {
  switch (status) {
    case 'Diproses':
      return 'primary'
    case 'Disetujui':
      return 'success'
    case 'Ditolak':
      return 'danger'
    default:
      return 'secondary'
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'Disetujui':
      return 'bg-[#3f9760] text-white'
    case 'Diproses':
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

function goToDetail(item: SuratAntrean) {
  router.push(`/surat-antrean/${item.id_surat}`)
}

async function fetchData() {
  generalError.value = ''
  successMessage.value = ''
  await store.fetchAntreanList(currentPage.value)
}

function handleApplyFilter() {
  currentPage.value = 1
  fetchData()
}

function handleResetFilter() {
  search.value = ''
  selectedStatusFilter.value = ''
  sortValue.value = 'created_at-desc'
  currentPage.value = 1
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <AdminSidebar :navItems="navItems" :bottomItems="bottomItems" />
    </template>

    <div class="p-8 flex flex-col gap-6 h-full font-['Plus_Jakarta_Sans']">
      <!-- Header -->
      <section class="mb-6 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-[24px] md:text-[28px] font-bold leading-[120%] text-[#111827]">
              Verifikasi dan Persetujuan Berjenjang
            </h1>
            <p class="text-[13px] md:text-[14px] leading-[145%] text-[#858a91]">
              Verifikasi Surat
            </p>
          </div>
          <VDropdown v-model="selectedApprover" :options="approverOptions" placeholder="Pilih Verifikator"
            class="!w-[200px]" />
        </div>

        <VAlert v-if="generalError" type="error" title="Gagal" :message="generalError" @close="generalError = ''" />

        <VAlert v-if="successMessage" type="success" title="Berhasil" :message="successMessage"
          @close="successMessage = ''" />
      </section>

      <!-- Filter Section -->
      <section class="mb-8">
        <div class="relative">
          <Search class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b2b5ba]" />
          <input v-model="search" type="text" placeholder="Cari berdasarkan perihal surat atau nama pengaju..."
            class="h-[46px] w-full rounded-[14px] border border-[#d9e2e7] bg-white pl-12 pr-4 text-[16px] text-[#111827] outline-none transition placeholder:text-[#b2b5ba] focus:border-[#3f9760]"
            @keyup.enter="handleApplyFilter" />
        </div>
      </section>

      <!-- Stats Cards -->
      <section class="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="relative h-[128px] overflow-hidden rounded-[28px] border border-[#d9e2e7] bg-[#eef5f0] shadow-sm">
          <div class="absolute bottom-0 left-0 opacity-90">
            <img :src="mailIcon" alt="Mail Icon"
              class="h-[78px] w-[78px] object-contain translate-x-[-10px] translate-y-[10px]" />
          </div>
          <div class="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
            <p class="text-[28px] font-semibold text-[#111827]">Total Surat</p>
            <h2 class="mt-4 text-[35px] font-bold text-[#111827]">{{ stats.total }}</h2>
          </div>
        </div>

        <div class="relative h-[128px] overflow-hidden rounded-[28px] border border-[#d9e2e7] bg-[#eef5f0] shadow-sm">
          <div class="absolute bottom-0 left-0 opacity-70">
            <img :src="diprosesIcon" alt="Student Icon"
              class="h-[78px] w-[78px] object-contain translate-x-[-10px] translate-y-[10px]" />
          </div>
          <div class="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
            <p class="text-[28px] font-semibold text-[#111827]">Diproses</p>
            <h2 class="mt-4 text-[35px] font-bold text-[#111827]">{{ stats.diproses }}</h2>
          </div>
        </div>

        <div class="relative h-[128px] overflow-hidden rounded-[28px] border border-[#d9e2e7] bg-[#eef5f0] shadow-sm">
          <div class="absolute bottom-0 left-0 opacity-70">
            <img :src="disetujuiIcon" alt="Student Icon"
              class="h-[78px] w-[78px] object-contain translate-x-[-10px] translate-y-[10px]" />
          </div>
          <div class="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
            <p class="text-[28px] font-semibold text-[#111827]">Disetujui</p>
            <h2 class="mt-4 text-[35px] font-bold text-[#111827]">{{ stats.disetujui }}</h2>
          </div>
        </div>

        <div class="relative h-[128px] overflow-hidden rounded-[28px] border border-[#d9e2e7] bg-[#eef5f0] shadow-sm">
          <div class="absolute bottom-0 left-0 opacity-70">
            <img :src="ditolakIcon" alt="Student Icon"
              class="h-[78px] w-[78px] object-contain translate-x-[-10px] translate-y-[10px]" />
          </div>
          <div class="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
            <p class="text-[28px] font-semibold text-[#111827]">Ditolak</p>
            <h2 class="mt-4 text-[35px] font-bold text-[#111827]">{{ stats.ditolak }}</h2>
          </div>
        </div>
      </section>

      <!-- Status Filter Tabs -->
      <section class="mb-6">
        <div class="relative flex h-[46px] items-center rounded-full bg-[#d4e8d9] p-1">
          <button v-for="option in statusFilterOptions" :key="option.value" type="button" :class="[
            'relative flex-1 rounded-full px-4 py-2 text-[14px] font-semibold transition-all duration-300',
            selectedStatusFilter === option.value
              ? 'bg-[#3f9760] text-white shadow-[0px_2px_8px_rgba(63,150,96,0.4)]'
              : 'text-[#71757b] hover:text-[#3f9760]'
          ]" @click="selectedStatusFilter = option.value">
            {{ option.label }}
          </button>
        </div>
      </section>

      <!-- Data List Section -->
      <section class="mb-4">
        <h2 class="text-[20px] md:text-[18px] font-bold leading-[120%] text-[#111827]">
          Daftar Surat
        </h2>
      </section>

      <section v-if="store.loading"
        class="rounded-[28px] border border-[#d9e2e7] bg-white/80 px-6 py-10 text-center text-[#858a91]">
        Memuat data surat...
      </section>

      <section v-else-if="filteredSuratList.length === 0"
        class="rounded-[28px] border border-[#d9e2e7] bg-white/80 px-6 py-10 text-center text-[#858a91]">
        Belum ada surat yang sesuai filter.
      </section>

      <section v-else class="flex flex-col gap-4">
        <article v-for="item in filteredSuratList" :key="item.id_surat"
          class="rounded-[20px] border border-[#e5e7eb] bg-white px-6 py-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:-translate-y-0.5">

          <!-- Header: Title & Status -->
          <div class="flex items-start justify-between gap-4 mb-3">
            <h3 class="text-[18px] font-bold leading-[1.4] text-[#111827] flex-1">
              {{ item.perihal }}
            </h3>
            <span :class="[
              'px-4 py-1.5 rounded-full text-[14px] font-semibold whitespace-nowrap',
              getStatusClass(item.status)
            ]">
              {{ item.status }}
            </span>
          </div>

          <!-- Description -->
          <p class="text-[14px] text-[#6b7280] mb-4 leading-relaxed">
            {{ item.description || 'Pengajuan kegiatan pramuka kelas 10' }}
          </p>

          <!-- Meta Information -->
          <div class="flex flex-wrap items-center gap-5 mb-5">
            <div class="flex items-center gap-1.5 text-[14px] text-[#6b7280]">
              <Folder class="w-4 h-4 text-[#9ca3af]" />
              <span>{{ item.kategori || 'Kesiswaan' }}</span>
            </div>

            <div class="flex items-center gap-1.5 text-[14px] text-[#6b7280]">
              <User class="w-4 h-4 text-[#9ca3af]" />
              <span>{{ item.nama_pengaju }}</span>
            </div>

            <div class="flex items-center gap-1.5 text-[14px] text-[#6b7280]">
              <Calendar class="w-4 h-4 text-[#9ca3af]" />
              <span>{{ formatDate(item.tanggal_pengajuan) }}</span>
            </div>
          </div>

          <!-- Detail Button -->
          <button type="button"
            class="w-full sm:w-auto bg-[#d4e8d9] hover:bg-[#c5dbcc] text-[#1f2937] px-8 py-2.5 rounded-[12px] text-[14px] font-semibold transition-all duration-300 hover:-translate-y-0.5"
            @click="goToDetail(item)">
            Detail
          </button>
        </article>
      </section>

      <!-- Pagination -->
      <section class="mt-6">
        <div class="mt-3 flex items-center justify-between px-2 text-sm text-[#858a91]">
          <span>
            Menampilkan halaman {{ pagination?.halaman_saat_ini || 1 }} dari {{ Math.ceil((pagination?.total_data || 0)
              /
              limit) || 1 }}
          </span>
          <div class="flex items-center gap-4">
            <button type="button" class="disabled:opacity-50"
              :disabled="!pagination || pagination.halaman_saat_ini <= 1" @click="currentPage--; fetchData()">
              Sebelumnya
            </button>
            <span class="font-semibold text-[#111827]">{{ pagination?.halaman_saat_ini || 1 }}</span>
            <button type="button" class="disabled:opacity-50"
              :disabled="!pagination || pagination.halaman_saat_ini >= Math.ceil((pagination?.total_data || 0) / limit)"
              @click="currentPage++; fetchData()">
              Berikutnya
            </button>
          </div>
        </div>
      </section>
    </div>
  </DashboardLayout>
</template>