<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Folder, User, Calendar } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/users/auth'
import { useSuratAntreanStore, type SuratAntrean } from '@/stores/surat_antrean'

import mailIcon from '@/assets/mail.png'
import diprosesIcon from '@/assets/diproses.png'
import disetujuiIcon from '@/assets/disetujui.png'
import ditolakIcon from '@/assets/ditolak.png'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VAlert from '@/components/common/VAlert.vue'
import VPagination from '@/components/common/VPagination.vue'
import VCard from '@/components/common/VCard.vue'
import VButton from '@/components/common/VButton.vue'
import VChip from '@/components/common/VChip.vue'

const router = useRouter()
const store = useSuratAntreanStore()
const authStore = useAuthStore()

const departmentRoles = ['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK']
const isAdmin = computed(() => authStore.role === 'ADMIN')
const isKepsek = computed(() => authStore.role === 'KEPSEK')
const isDepartmentTeacher = computed(() => departmentRoles.includes(authStore.role || ''))

const statusFilterOptions = [
  { label: 'Semua', value: '' },
  { label: 'Diproses', value: 'Diproses' },
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

const statCards = computed(() => [
  {
    label: 'Total Surat',
    value: stats.value.total,
    icon: mailIcon,
    alt: 'Mail Icon',
    opacityClass: 'opacity-90',
  },
  {
    label: 'Diproses',
    value: stats.value.diproses,
    icon: diprosesIcon,
    alt: 'Diproses',
    opacityClass: 'opacity-70',
  },
  {
    label: 'Disetujui',
    value: stats.value.disetujui,
    icon: disetujuiIcon,
    alt: 'Disetujui',
    opacityClass: 'opacity-70',
  },
  {
    label: 'Ditolak',
    value: stats.value.ditolak,
    icon: ditolakIcon,
    alt: 'Ditolak',
    opacityClass: 'opacity-70',
  },
])

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

  if (selectedBidang.value) {
    const bidangMap: Record<string, string> = {
      BIDANG_AGAMA: 'KEAGAMAAN',
      BIDANG_AKADEMIK: 'AKADEMIK',
      BIDANG_KESISWAAN: 'KESISWAAN',
    }

    const targetJenis = bidangMap[selectedBidang.value]

    if (targetJenis) {
      result = result.filter((s) => s.template_jenis === targetJenis || s.kategori === targetJenis)
    }
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredSuratList.value.length / limit.value) || 1
})

const paginatedSuratList = computed(() => {
  const start = (currentPage.value - 1) * limit.value
  const end = start + limit.value

  return filteredSuratList.value.slice(start, end)
})

function getLetterTitle(item: SuratAntrean): string {
  return String(item.perihal || item.template_nama || item.perkara || 'Tanpa Perihal')
}

function getLetterDescription(item: SuratAntrean): string {
  return item.description || item.deskripsi || 'Tidak ada deskripsi surat.'
}

function getStatusVariant(status: string) {
  if (status === 'Disetujui') return 'primary'
  if (status === 'Diproses') return 'secondary'
  if (status === 'Ditolak') return 'tertiary'

  return 'tertiary'
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
    await store.fetchAntreanList()
  } catch {
    generalError.value = 'Gagal memuat data antrean verifikasi surat.'
  }
}

function handleApplyFilter() {
  currentPage.value = 1
}

function handleStatusFilterSelect(value: string) {
  selectedStatusFilter.value = value
  handleApplyFilter()
}

function handlePageChange(page: number) {
  currentPage.value = page
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main
      class="flex h-full flex-col gap-6 bg-[var(--app-bg)] p-8 font-[var(--font-sans)] text-[var(--app-text)]"
    >
      <section class="mb-2 flex flex-col gap-3">
        <div
          class="flex items-center justify-between gap-3 max-[768px]:flex-col max-[768px]:items-stretch"
        >
          <div>
            <h1
              class="m-0 text-[length:var(--app-page-title-font)] font-bold leading-[1.2] text-[var(--app-heading)]"
            >
              Verifikasi dan Persetujuan Berjenjang
            </h1>

            <p
              class="mt-1 mb-0 text-[length:var(--app-page-subtitle-font)] leading-[1.45] text-[var(--app-muted)]"
            >
              Verifikasi Surat
            </p>
          </div>

          <div v-if="isAdmin" class="w-[220px] max-[768px]:w-full">
            <VDropdown
              v-model="selectedBidang"
              :options="bidangOptions"
              placeholder="Pilih Bidang"
            />
          </div>
        </div>

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

      <section>
        <VInputField
          v-model="search"
          state="search"
          placeholder="Cari surat berdasarkan nama, deskripsi, atau kategori..."
          @keydown.enter="handleApplyFilter"
        />
      </section>

      <section class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <VCard
          v-for="card in statCards"
          :key="card.label"
          padding-class="p-0"
          class="relative h-[128px] overflow-hidden"
        >
          <div :class="['absolute bottom-0 left-0', card.opacityClass]">
            <img
              :src="card.icon"
              :alt="card.alt"
              class="h-[78px] w-[78px] translate-x-[-10px] translate-y-[10px] object-contain"
            />
          </div>

          <div
            class="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center"
          >
            <p
              class="m-0 text-[length:var(--app-font-xl)] font-semibold leading-[1.2] text-[var(--app-heading)]"
            >
              {{ card.label }}
            </p>

            <h2
              class="mt-4 mb-0 text-[length:var(--app-font-display)] font-bold leading-[1.2] text-[var(--app-heading)]"
            >
              {{ card.value }}
            </h2>
          </div>
        </VCard>
      </section>

      <section>
        <div class="flex flex-wrap items-center gap-2 rounded-full bg-[var(--app-soft-card)] p-1">
          <VButton
            v-for="option in statusFilterOptions"
            :key="option.value"
            :variant="selectedStatusFilter === option.value ? 'primary' : 'tertiary'"
            size="sm"
            class="flex-1"
            @click="handleStatusFilterSelect(option.value)"
          >
            {{ option.label }}
          </VButton>
        </div>
      </section>

      <section v-if="store.loading">
        <VCard padding-class="px-6 py-10">
          <p
            class="m-0 text-center text-[length:var(--app-table-state-font)] leading-[1.5] text-[var(--app-muted)]"
          >
            Memuat data surat...
          </p>
        </VCard>
      </section>

      <section v-else-if="filteredSuratList.length === 0">
        <VCard padding-class="px-6 py-10">
          <p
            class="m-0 text-center text-[length:var(--app-table-state-font)] leading-[1.5] text-[var(--app-muted)]"
          >
            Belum ada surat yang sesuai filter.
          </p>
        </VCard>
      </section>

      <section v-else class="flex flex-col gap-4">
        <VCard
          v-for="item in paginatedSuratList"
          :key="item.id_surat"
          padding-class="px-6 py-6"
          class="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div class="mb-3 flex items-start justify-between gap-4">
            <h3
              class="m-0 flex-1 text-[length:var(--app-card-title-font)] font-bold leading-[1.4] text-[var(--app-heading)]"
            >
              {{ getLetterTitle(item) }}
            </h3>

            <VChip :label="item.status" :variant="getStatusVariant(item.status)" />
          </div>

          <p
            class="mb-4 mt-0 text-[length:var(--app-font-sm)] leading-relaxed text-[var(--app-muted)]"
          >
            {{ getLetterDescription(item) }}
          </p>

          <div class="mb-5 flex flex-wrap items-center gap-5">
            <div
              class="flex items-center gap-1.5 text-[length:var(--app-font-sm)] leading-[1.4] text-[var(--app-muted)]"
            >
              <Folder class="h-4 w-4 text-[var(--app-muted)]" />
              <span>{{ item.kategori || '-' }}</span>
            </div>

            <div
              class="flex items-center gap-1.5 text-[length:var(--app-font-sm)] leading-[1.4] text-[var(--app-muted)]"
            >
              <User class="h-4 w-4 text-[var(--app-muted)]" />
              <span>{{ item.nama_pengaju }}</span>
            </div>

            <div
              class="flex items-center gap-1.5 text-[length:var(--app-font-sm)] leading-[1.4] text-[var(--app-muted)]"
            >
              <Calendar class="h-4 w-4 text-[var(--app-muted)]" />
              <span>{{ formatDate(item.tanggal_pengajuan) }}</span>
            </div>
          </div>

          <VButton variant="tertiary" @click="goToDetail(item)"> Detail </VButton>
        </VCard>
      </section>

      <section v-if="totalPages > 1" class="mt-6 flex justify-end">
        <VPagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          :siblingCount="1"
          @page-change="handlePageChange"
        />
      </section>
    </main>
  </DashboardLayout>
</template>
