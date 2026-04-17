<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Folder, User, Calendar, Search } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/users/auth'
import { useSuratAntreanStore, type SuratAntrean } from '@/stores/surat_antrean'
import mailIcon from '@/assets/mail.png'
import diprosesIcon from '@/assets/diproses.png'
import disetujuiIcon from '@/assets/disetujui.png'
import ditolakIcon from '@/assets/ditolak.png'
import VDropdown from '@/components/common/VDropdown.vue'
import VAlert from '@/components/common/VAlert.vue'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import DepartmentTeacherSidebar from '@/components/department_teachers/DepartmentTeacherSidebar.vue'
import KepsekSidebar from '@/components/kepsek/KepsekSidebar.vue'

const router = useRouter()
const store = useSuratAntreanStore()
const authStore = useAuthStore()

const departmentRoles = ['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK']
const isAdmin = computed(() => authStore.role === 'ADMIN')
const isKepsek = computed(() => authStore.role === 'KEPSEK')
const isDepartmentTeacher = computed(() => departmentRoles.includes(authStore.role || ''))

const statusFilterOptions = [
  { label: 'Semua', value: '' },
  { label: 'Proses', value: 'Diproses' },
  { label: 'Menunggu Verifikasi Kepsek', value: 'Menunggu Verifikasi Kepsek' },
  { label: 'Disetujui', value: 'Disetujui' },
  { label: 'Ditolak', value: 'Ditolak' },
]

const bidangOptions = [
  { label: 'Pilih Bidang', value: '' },
  { label: 'Bidang Keagamaan', value: 'BIDANG_AGAMA' },
  { label: 'Bidang Akademik', value: 'BIDANG_AKADEMIK' },
  { label: 'Bidang Kesiswaan', value: 'BIDANG_KESISWAAN' },
]

const search = ref('')
const selectedStatusFilter = ref('')
const currentPage = ref(1)
const limit = ref(10)
const selectedBidang = ref('')
const generalError = ref('')
const successMessage = ref('')

const suratList = computed(() => store.suratList)
const stats = computed(() => store.stats)
const pagination = computed(() => store.pagination)

const filteredSuratList = computed(() => {
  const withChronologicalOrder = (items: SuratAntrean[]) => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.tanggal_pengajuan || a.created_at || '').getTime()
      const dateB = new Date(b.tanggal_pengajuan || b.created_at || '').getTime()
      return dateA - dateB
    })
  }

  let result = withChronologicalOrder(suratList.value)

  if (selectedStatusFilter.value) {
    result = result.filter((s) => s.status === selectedStatusFilter.value)
  } else {
    const inProgress = result.filter((s) => s.status === 'Diproses')
    const processed = result.filter((s) => s.status !== 'Diproses')
    result = [...inProgress, ...processed]
  }

  if (search.value.trim()) {
    const query = search.value.toLowerCase()
    result = result.filter((s) => {
      const title = getLetterTitle(s).toLowerCase()
      const description = getLetterDescription(s).toLowerCase()
      const pengaju = String(s.nama_pengaju || '').toLowerCase()
      const kategori = String(s.kategori || '').toLowerCase()
      return (
        title.includes(query) ||
        description.includes(query) ||
        pengaju.includes(query) ||
        kategori.includes(query)
      )
    })
  }

  // Filter by bidang if selected
  if (selectedBidang.value) {
    const bidangMap: Record<string, string> = {
      'BIDANG_AGAMA': 'KEAGAMAAN',
      'BIDANG_AKADEMIK': 'AKADEMIK',
      'BIDANG_KESISWAAN': 'KESISWAAN',
    }
    const targetJenis = bidangMap[selectedBidang.value]
    if (targetJenis) {
      result = result.filter((s) => s.template_jenis === targetJenis || s.kategori === targetJenis)
    }
  }

  return result
})

function getLetterTitle(item: SuratAntrean) {
  return item.perihal || item.template_nama || item.perkara || 'Tanpa Perihal'
}

function getLetterDescription(item: SuratAntrean) {
  return item.description || item.deskripsi || 'Tidak ada deskripsi surat.'
}

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

function resolveDetailPath(item: SuratAntrean) {
  if (isAdmin.value) {
    return `/admin/surat-antrean/${item.id_surat}`
  }

  if (isKepsek.value) {
    return `/kepsek/surat-antrean/${item.id_surat}`
  }

  if (isDepartmentTeacher.value) {
    return `/department-teachers/surat-antrean/${item.id_surat}`
  }

  return `/admin/surat-antrean/${item.id_surat}`
}

function goToDetail(item: SuratAntrean) {
  router.push(resolveDetailPath(item))
}

async function fetchData() {
  generalError.value = ''
  successMessage.value = ''

  try {
    await store.fetchAntreanList(currentPage.value)
  } catch {
    generalError.value = 'Gagal memuat data antrean verifikasi surat.'
  }
}

function handleApplyFilter() {
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
      <AdminSidebar v-if="isAdmin" />
      <KepsekSidebar v-else-if="isKepsek" :userName="authStore.user?.nama" :userEmail="authStore.user?.email" />
      <DepartmentTeacherSidebar v-else :userName="authStore.user?.nama" :userEmail="authStore.user?.email" />
    </template>

    <div class="p-8 flex flex-col gap-6 h-full font-['Plus_Jakarta_Sans']">
      <section class="mb-6 flex flex-col gap-2">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h1 class="text-[24px] md:text-[28px] font-bold leading-[120%] text-[#111827]">
              Verifikasi dan Persetujuan Berjenjang
            </h1>
            <p class="text-[13px] md:text-[14px] leading-[145%] text-[#858a91]">Verifikasi Surat</p>
          </div>

          <VDropdown v-if="isAdmin" v-model="selectedBidang" :options="bidangOptions"
            placeholder="Pilih Bidang" class="!w-[220px]" />
        </div>

        <VAlert v-if="generalError" type="error" title="Gagal" :message="generalError" @close="generalError = ''" />

        <VAlert v-if="successMessage" type="success" title="Berhasil" :message="successMessage"
          @close="successMessage = ''" />
      </section>

      <section class="mb-4">
        <div class="relative">
          <Search class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b2b5ba]" />
          <input v-model="search" type="text" placeholder="Cari surat berdasarkan nama, deskripsi, atau kategori..."
            class="h-[46px] w-full rounded-[14px] border border-[#d9e2e7] bg-white pl-12 pr-4 text-[16px] text-[#111827] outline-none transition placeholder:text-[#b2b5ba] focus:border-[#3f9760]"
            @keyup.enter="handleApplyFilter" />
        </div>
      </section>

      <section class="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <img :src="diprosesIcon" alt="Diproses"
              class="h-[78px] w-[78px] object-contain translate-x-[-10px] translate-y-[10px]" />
          </div>
          <div class="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
            <p class="text-[28px] font-semibold text-[#111827]">Diproses</p>
            <h2 class="mt-4 text-[35px] font-bold text-[#111827]">{{ stats.diproses }}</h2>
          </div>
        </div>

        <div class="relative h-[128px] overflow-hidden rounded-[28px] border border-[#d9e2e7] bg-[#eef5f0] shadow-sm">
          <div class="absolute bottom-0 left-0 opacity-70">
            <img :src="disetujuiIcon" alt="Disetujui"
              class="h-[78px] w-[78px] object-contain translate-x-[-10px] translate-y-[10px]" />
          </div>
          <div class="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
            <p class="text-[28px] font-semibold text-[#111827]">Disetujui</p>
            <h2 class="mt-4 text-[35px] font-bold text-[#111827]">{{ stats.disetujui }}</h2>
          </div>
        </div>

        <div class="relative h-[128px] overflow-hidden rounded-[28px] border border-[#d9e2e7] bg-[#eef5f0] shadow-sm">
          <div class="absolute bottom-0 left-0 opacity-70">
            <img :src="ditolakIcon" alt="Ditolak"
              class="h-[78px] w-[78px] object-contain translate-x-[-10px] translate-y-[10px]" />
          </div>
          <div class="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
            <p class="text-[28px] font-semibold text-[#111827]">Ditolak</p>
            <h2 class="mt-4 text-[35px] font-bold text-[#111827]">{{ stats.ditolak }}</h2>
          </div>
        </div>
      </section>

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
          <div class="flex items-start justify-between gap-4 mb-3">
            <h3 class="text-[18px] font-bold leading-[1.4] text-[#111827] flex-1">
              {{ getLetterTitle(item) }}
            </h3>
            <span
              :class="['px-4 py-1.5 rounded-full text-[14px] font-semibold whitespace-nowrap', getStatusClass(item.status)]">
              {{ item.status }}
            </span>
          </div>

          <p class="text-[14px] text-[#6b7280] mb-4 leading-relaxed">
            {{ getLetterDescription(item) }}
          </p>

          <div class="flex flex-wrap items-center gap-5 mb-5">
            <div class="flex items-center gap-1.5 text-[14px] text-[#6b7280]">
              <Folder class="w-4 h-4 text-[#9ca3af]" />
              <span>{{ item.kategori || '-' }}</span>
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

          <button type="button"
            class="w-full sm:w-auto bg-[#d4e8d9] hover:bg-[#c5dbcc] text-[#1f2937] px-8 py-2.5 rounded-[12px] text-[14px] font-semibold transition-all duration-300 hover:-translate-y-0.5"
            @click="goToDetail(item)">
            Detail
          </button>
        </article>
      </section>

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
