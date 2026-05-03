<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <div class="p-8 flex flex-col gap-[20px] h-full font-['Plus_Jakarta_Sans']">
      <section class="flex flex-col gap-3">
        <div>
          <h1 class="text-[32px] font-bold text-[#111827]">
            Daftar Surat Pending
          </h1>
          <p class="text-[24px] text-[#858a91]">
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

      <section class="grid grid-cols-1 xl:grid-cols-2 gap-[20px]">
        <KepsekPanel paddingClass="px-[27.363px] py-[19.9px] h-[330px]">
          <KepsekPieChart
            title="Distribusi Jenis Surat"
            subtitle="Berdasarkan Pengirim"
            :data="distribusiChart"
            :chartSize="241"
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
            <span>{{ formatDate(String(value || '')) }}</span>
          </template>

          <template #cell-status="{ value }">
            <span class="text-[16px] font-semibold text-[#c77e3c]">{{ value }}</span>
          </template>

          <template #cell-aksi="{ row }">
            <button
              v-if="resolveDetailPath(row)"
              class="text-[#2f8f58] font-semibold text-[16px] hover:underline"
              @click="goToDetail(row)"
            >
              Lihat Detail
            </button>
            <span v-else class="text-[#94a3b8] text-[16px]">-</span>
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
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import VPagination from '@/components/common/VPagination.vue'
import VAlert from '@/components/common/VAlert.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import KepsekPieChart from '@/components/kepsek/KepsekPieChart.vue'
import KepsekBarChart from '@/components/kepsek/KepsekBarChart.vue'
import KepsekPanel from '@/components/kepsek/KepsekPanel.vue'
import KepsekFilterField from '@/components/kepsek/KepsekFilterField.vue'
import KepsekPendingTable from '@/components/kepsek/KepsekPendingTable.vue'
import { usePrincipalDashboardStore } from '@/stores/principal_dashboard'
import { Calendar, User, FileText } from 'lucide-vue-next'

const router = useRouter()
const store = usePrincipalDashboardStore()

const filterDate = ref('')
const filterSender = ref('')
const filterSubject = ref('')
const currentPage = ref(1)

const columns = [
  { key: 'nomor_surat', label: 'Nomor Surat' },
  { key: 'verifikator', label: 'Verifikator' },
  { key: 'tanggal_diterima', label: 'Tanggal Diterima' },
  { key: 'pengirim', label: 'Pengirim' },
  { key: 'jenis_surat', label: 'Jenis Surat' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: 'Aksi' },
]

const errorMessage = computed(() => store.error)

const distribusiChart = computed(() => [
  { label: 'Surat Izin', value: store.distribusiJenisSurat.izin, color: '#6c8f6f' },
  { label: 'Surat Tugas', value: store.distribusiJenisSurat.tugas, color: '#7b9f7d' },
  { label: 'Surat Keterangan', value: store.distribusiJenisSurat.keterangan, color: '#5d7d60' },
  { label: 'Surat Undangan', value: store.distribusiJenisSurat.undangan, color: '#b19777' },
  { label: 'Surat Pengajuan', value: store.distribusiJenisSurat.pengajuan, color: '#8f7458' },
])

const flowBidangChart = computed(() => [
  {
    label: 'Kesiswaan',
    value: store.flowPerBidang.kesiswaan.surat_masuk + store.flowPerBidang.kesiswaan.surat_keluar,
    color: '#5f7f64',
  },
  {
    label: 'Keagamaan',
    value: store.flowPerBidang.keagamaan.surat_masuk + store.flowPerBidang.keagamaan.surat_keluar,
    color: '#9db08f',
  },
  {
    label: 'Akademik',
    value: store.flowPerBidang.akademik.surat_masuk + store.flowPerBidang.akademik.surat_keluar,
    color: '#c7ad86',
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

const resolveDetailPath = (row: { id?: number; id_surat?: number }) => {
  const id = row.id_surat || row.id
  if (!id) return ''
  return `/kepsek/surat-antrean/${id}`
}

const goToDetail = (row: { id?: number; id_surat?: number }) => {
  const path = resolveDetailPath(row)
  if (!path) return
  router.push(path)
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  store.fetchPendingPageData(page)
}

onMounted(() => {
  store.fetchPendingPageData(currentPage.value)
})
</script>
