<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main
      class="
        flex h-full flex-col gap-5
        bg-[var(--app-bg)] p-8
        font-[var(--font-sans)] text-[var(--app-text)]
      "
    >
      <section class="flex flex-col gap-3">
        <div>
          <h1
            class="
              m-0 text-[length:var(--app-page-title-font)]
              font-bold leading-[1.2] text-[var(--app-heading)]
            "
          >
            Daftar Surat Pending
          </h1>

          <p
            class="
              mt-1 mb-0 text-[length:var(--app-page-subtitle-font)]
              leading-[1.4] text-[var(--app-muted)]
            "
          >
            Surat menunggu verifikasi kepsek
          </p>
        </div>

        <VAlert
          v-if="errorMessage"
          type="error"
          title="Gagal"
          :message="errorMessage"
          @close="store.setError('')"
        />
      </section>

      <section class="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <KepsekPanel paddingClass="px-[24px] py-[16px] h-[330px]">
          <KepsekPendingDurasiFilter
            v-model="filterDurasi"
            :data="store.pendingDurasi"
          />
        </KepsekPanel>

        <KepsekPanel paddingClass="px-[27.363px] py-[19.9px] h-[330px]">
          <KepsekBarChart
            title="Distribusi Surat Pending"
            subtitle="Berdasarkan Bidang"
            :data="flowBidangChart"
            :chartHeight="241"
          />
        </KepsekPanel>
      </section>

      <section class="flex flex-wrap items-center justify-center gap-[10px]">
        <KepsekFilterField
          v-model="filterDate"
          label="Tanggal"
          type="date"
          placeholder="DD/MM/YYYY"
          :icon="Calendar"
        />

        <KepsekFilterField
          v-model="filterSender"
          label="Pengirim"
          placeholder="Pengirim"
          :icon="User"
        />

        <KepsekFilterField
          v-model="filterSubject"
          label="Perihal"
          placeholder="Perihal"
          :icon="FileText"
        />
      </section>

      <section>
        <KepsekPendingTable
          :columns="columns"
          :rows="filteredRows"
          :isLoading="store.loading.pending"
        >
          <template #cell-tanggal_diterima="{ value }">
            <span
              class="
                text-[length:var(--app-table-cell-font)]
                leading-[1.4] text-[var(--app-muted)]
              "
            >
              {{ formatDate(String(value || '')) }}
            </span>
          </template>

          <template #cell-status="{ value }">
            <span
              class="
                text-[length:var(--app-table-cell-font)]
                font-semibold leading-[1.4] text-[var(--app-warning)]
              "
            >
              {{ value }}
            </span>
          </template>

          <template #cell-aksi="{ row }">
            <VButton
              v-if="row.id_pengajuan"
              variant="secondary"
              size="sm"
              @click="goToVerification(row)"
            >
              Lihat Detail
            </VButton>

            <span
              v-else
              class="
                text-[length:var(--app-table-cell-font)]
                leading-[1.4] text-[var(--app-muted)]
              "
            >
              -
            </span>
          </template>
        </KepsekPendingTable>
      </section>

      <section class="flex justify-end">
        <VPagination
          v-model:currentPage="currentPage"
          :totalPages="totalPages"
          @page-change="handlePageChange"
        />
      </section>
    </main>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Calendar, FileText, User } from 'lucide-vue-next'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VAlert from '@/components/common/VAlert.vue'
import VButton from '@/components/common/VButton.vue'
import VPagination from '@/components/common/VPagination.vue'

import KepsekPendingDurasiFilter from '@/components/kepsek/KepsekPendingDurasiFilter.vue'
import KepsekBarChart from '@/components/kepsek/KepsekBarChart.vue'
import KepsekPanel from '@/components/kepsek/KepsekPanel.vue'
import KepsekFilterField from '@/components/kepsek/KepsekFilterField.vue'
import KepsekPendingTable from '@/components/kepsek/KepsekPendingTable.vue'

import { usePrincipalDashboardStore } from '@/stores/principal_dashboard'
import { useThemeColors } from '@/stores/principal_dashboard/themeColors'

const router = useRouter()
const store = usePrincipalDashboardStore()
const colors = useThemeColors()

const filterDate = ref('')
const filterSender = ref('')
const filterSubject = ref('')
const filterDurasi = ref('')
const currentPage = ref(1)

const columns = [
  {
    key: 'nomor_surat',
    label: 'Nomor Surat',
    tdClass:
      'px-6 py-4 text-[length:var(--app-table-cell-font)] font-semibold text-[var(--app-heading)]',
  },
  {
    key: 'verifikator',
    label: 'Verifikator',
    tdClass:
      'px-6 py-4 text-[length:var(--app-table-cell-font)] text-[var(--app-text)]',
  },
  {
    key: 'tanggal_diterima',
    label: 'Tanggal Terima',
    tdClass:
      'px-6 py-4 whitespace-nowrap text-[length:var(--app-table-cell-font)] text-[var(--app-muted)]',
  },
  {
    key: 'pengirim',
    label: 'Pengirim',
    tdClass:
      'px-6 py-4 text-[length:var(--app-table-cell-font)] text-[var(--app-text)]',
  },
  {
    key: 'jenis_surat',
    label: 'Jenis Surat',
    tdClass:
      'px-6 py-4 text-[length:var(--app-table-cell-font)] text-[var(--app-text)]',
  },
  {
    key: 'aksi',
    label: 'Aksi',
    tdClass: 'px-6 py-4 font-semibold',
  },
]

const errorMessage = computed(() => store.error)

const flowBidangChart = computed(() => [
  {
    label: 'Kesiswaan',
    value: store.distribusiSuratPending.kesiswaan,
    color: colors.value.success,
  },
  {
    label: 'Keagamaan',
    value: store.distribusiSuratPending.keagamaan,
    color: colors.value.accent,
  },
  {
    label: 'Akademik',
    value: store.distribusiSuratPending.akademik,
    color: colors.value.accent2,
  },
])

const filteredRows = computed(() => {
  let result = [...store.pendingLetters]

  if (filterDate.value) {
    result = result.filter((row) => row.tanggal_diterima?.startsWith(filterDate.value))
  }

  if (filterSender.value.trim()) {
    const query = filterSender.value.toLowerCase()
    result = result.filter((row) => row.pengirim.toLowerCase().includes(query))
  }

  if (filterSubject.value.trim()) {
    const query = filterSubject.value.toLowerCase()
    result = result.filter((row) => row.jenis_surat.toLowerCase().includes(query))
  }

  if (filterDurasi.value) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    result = result.filter((row) => {
      if (!row.tanggal_diterima) return false

      const rowDate = new Date(row.tanggal_diterima)
      rowDate.setHours(0, 0, 0, 0)

      const diffTime = today.getTime() - rowDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      if (filterDurasi.value === '< 3 Hari') return diffDays < 3
      if (filterDurasi.value === '3 - 7 Hari') return diffDays >= 3 && diffDays <= 7
      if (filterDurasi.value === '> 7 Hari') return diffDays > 7

      return true
    })
  }

  return result
})

const totalPages = computed(() => store.pendingPagination.total_halaman || 1)

const formatDate = (value: string) => {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const goToVerification = (row: { id_pengajuan?: number }) => {
  const id = row.id_pengajuan
  if (!id) return

  router.push(`/kepsek/surat-antrean/${id}`)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  store.fetchPendingPageData(page)
}

onMounted(() => {
  store.fetchPendingPageData(currentPage.value)
})
</script>