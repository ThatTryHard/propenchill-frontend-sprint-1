<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <div class="p-6 flex flex-col gap-[16px] h-full font-['Plus_Jakarta_Sans']">
      <section class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-[32px] font-bold text-[#111827]">
              Dashboard Kinerja Persuratan
            </h1>
            <p class="text-[24px] text-[#858a91]">Kelola Kinerja Persuratan</p>
          </div>
          <div class="flex flex-wrap gap-3 w-full max-w-[420px]">
            <div class="w-[200px]">
              <KepsekSelect
                v-model="selectedMonth"
                :options="monthOptions"
                placeholder="Bulan Ini"
              />
            </div>
            <div class="w-[200px]">
              <KepsekSelect
                v-model="selectedRole"
                :options="roleOptions"
                placeholder="Role Anda"
              />
            </div>
          </div>
        </div>

        <VAlert
          v-if="errorMessage"
          type="error"
          title="Gagal"
          :message="errorMessage"
          @close="store.setError('')"
        />
      </section>

      <section class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[16px]">
        <KepsekSummaryCard
          :title="'Total Surat\n(Masuk/Keluar)'"
          :value="summary.total_surat"
        />
        <KepsekSummaryCard
          :title="'Tingkat\nPenyelesaian'"
          :value="formatPercent(summary.tingkat_penyelesaian)"
          suffix="%"
        />
        <KepsekSummaryCard
          :title="'Menunggu\n(Kepsek)'"
          :value="summary.menunggu_persetujuan"
        />
        <KepsekSummaryCard
          :title="'Rata-rata Waktu\nPemrosesan'"
          :value="formatNumber(summary.rata_rata_waktu_proses)"
          suffix="Hari"
        />
      </section>

      <section class="grid grid-cols-1 xl:grid-cols-3 gap-[16px]">
        <KepsekPanel paddingClass="px-[24px] py-[16px] h-[280px]">
          <KepsekLineChart
            title="Trend Waktu Persuratan"
            subtitle="Total surat masuk dan keluar selama 12 bulan"
            :data="trendWaktuChart"
            :chartHeight="190"
          />
        </KepsekPanel>

        <KepsekPanel paddingClass="px-[24px] py-[16px] h-[280px]">
          <KepsekGroupedBarChart
            title="Perbandingan Wali Murid vs Guru"
            subtitle="Insight aktivitas persuratan berdasarkan peran"
            :data="perbandinganChart"
            :chartHeight="180"
          />
        </KepsekPanel>

        <KepsekPanel paddingClass="px-[24px] py-[16px] h-[280px]">
          <KepsekPieChart
            title="Status Persuratan"
            subtitle="Distribusi status surat saat ini"
            :data="statusChart"
            :chartSize="170"
          />
        </KepsekPanel>
      </section>

      <section class="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-[16px]">
        <KepsekPanel paddingClass="px-[24px] py-[16px] h-[320px] overflow-y-auto">
          <div class="flex flex-col gap-4">
            <div>
              <h3 class="text-[16px] font-semibold text-[#111827]">Approval Rate per User</h3>
              <p class="text-[12px] text-[#71757b]">Perbandingan tingkat persetujuan antar pengguna</p>
            </div>

            <div v-if="approvalRate.length === 0" class="text-[13px] text-[#94a3b8]">
              Belum ada data approval rate.
            </div>

            <div v-else class="flex flex-col gap-3">
              <div
                v-for="item in approvalRate"
                :key="item.nama"
                class="flex flex-col gap-2"
              >
                <!-- Top Row: Name and Percentage -->
                <div class="flex items-center justify-between">
                  <p class="text-[14px] font-semibold text-[#111827]">
                    {{ item.nama }} ({{ formatRole(item.role) }})
                  </p>
                  <span class="text-[14px] font-bold text-[#111827]">
                    {{ formatPercent(item.approval_rate) }}%
                  </span>
                </div>
                
                <!-- Bottom Row: Progress bar and acc/tolak text -->
                <div class="flex items-center gap-4">
                  <div class="flex-1 h-[8px] rounded-full bg-[#e2e8f0]">
                    <div
                      class="h-full rounded-full bg-[#5ca373]"
                      :style="{ width: `${Math.min(100, item.approval_rate)}%` }"
                    ></div>
                  </div>
                  <p class="text-[12px] text-[#94a3b8] min-w-[90px] text-right">
                    {{ item.jumlah_approve }} acc / {{ item.jumlah_tolak }} tolak
                  </p>
                </div>
              </div>
            </div>
          </div>
        </KepsekPanel>

        <KepsekPanel paddingClass="px-[24px] py-[16px] h-[320px] overflow-y-auto">
          <div class="flex flex-col h-full gap-4">
            <div class="flex items-start gap-4">
              <div
                class="rounded-[10px] bg-[linear-gradient(90.7368deg,#3f9760_0%,#d1955f_100%)] p-[8px] text-white"
              >
                <Mail class="h-5 w-5" />
              </div>
              <div>
                <h3 class="text-[18px] font-bold text-[#111827]">Flow Surat per Bidang</h3>
                <p class="text-[13px] text-[#71757b]">Surat masuk/keluar dari 3 bidang</p>
              </div>
            </div>

            <div class="flex flex-col justify-around flex-1 text-[15px] font-semibold gap-2">
              <div v-for="item in flowBidangList" :key="item.label" class="flex flex-col gap-[2px]">
                <div class="font-normal text-[#111827] text-[14px]">{{ item.label }}</div>
                <div class="flex w-full justify-between pr-4 items-center">
                  <span class="text-[#c77e3c]">↓ Surat Masuk</span>
                  <span class="text-[#c77e3c] font-bold">{{ item.surat_masuk }}</span>
                </div>
                <div class="flex w-full justify-between pr-4 items-center">
                  <span class="text-[#2f8f58]">↑ Surat Keluar</span>
                  <span class="text-[#2f8f58] font-bold">{{ item.surat_keluar }}</span>
                </div>
              </div>
            </div>
          </div>
        </KepsekPanel>
      </section>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Mail } from 'lucide-vue-next'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import VAlert from '@/components/common/VAlert.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import KepsekSummaryCard from '@/components/kepsek/KepsekSummaryCard.vue'
import KepsekLineChart from '@/components/kepsek/KepsekLineChart.vue'
import KepsekGroupedBarChart from '@/components/kepsek/KepsekGroupedBarChart.vue'
import KepsekPieChart from '@/components/kepsek/KepsekPieChart.vue'
import KepsekPanel from '@/components/kepsek/KepsekPanel.vue'
import KepsekSelect from '@/components/kepsek/KepsekSelect.vue'
import { usePrincipalDashboardStore } from '@/stores/principal_dashboard'

const store = usePrincipalDashboardStore()

const selectedMonth = ref('')
const selectedRole = ref('')

const monthOptions = [
  { label: 'Bulan Ini', value: 'current' },
  { label: 'Bulan Lalu', value: 'previous' },
]

const roleOptions = [
  { label: 'Semua Role', value: 'all' },
  { label: 'Wali Murid', value: 'WALI_MURID' },
  { label: 'Guru', value: 'GURU' },
]

const summary = computed(() => store.summary)
const approvalRate = computed(() => store.approvalRate)
const flowWaliMurid = computed(() => store.flowWaliMurid)
const errorMessage = computed(() => store.error)

const trendWaktuChart = computed(() =>
  store.trendWaktu.map((item) => ({
    label: item.bulan,
    masuk: item.surat_masuk,
    keluar: item.surat_keluar,
  }))
)

const perbandinganChart = computed(() =>
  store.perbandinganPeran.map((item) => ({
    label: formatRole(item.role),
    masuk: item.surat_masuk,
    keluar: item.surat_keluar,
  })),
)

const statusChart = computed(() => [
  { label: 'Disetujui', value: store.statusSurat.disetujui, color: '#5ca373' },
  { label: 'Menunggu (Semua)', value: store.statusSurat.menunggu, color: '#d29a64' },
  { label: 'Ditolak', value: store.statusSurat.ditolak, color: '#c36c5f' },
  { label: 'Diproses', value: store.statusSurat.diproses, color: '#4c8aa8' },
])

const flowBidangList = computed(() => [
  {
    label: 'Akademik',
    surat_masuk: store.flowPerBidang.akademik.surat_masuk,
    surat_keluar: store.flowPerBidang.akademik.surat_keluar,
  },
  {
    label: 'Kesiswaan',
    surat_masuk: store.flowPerBidang.kesiswaan.surat_masuk,
    surat_keluar: store.flowPerBidang.kesiswaan.surat_keluar,
  },
  {
    label: 'Keagamaan',
    surat_masuk: store.flowPerBidang.keagamaan.surat_masuk,
    surat_keluar: store.flowPerBidang.keagamaan.surat_keluar,
  },
])

const formatPercent = (value: number) => {
  if (Number.isNaN(value)) return '0'
  return value % 1 === 0 ? String(Math.round(value)) : value.toFixed(1)
}

const formatNumber = (value: number) => {
  if (Number.isNaN(value)) return '0'
  return value % 1 === 0 ? String(Math.round(value)) : value.toFixed(1)
}

const formatRole = (role: string) => {
  const normalized = role.toUpperCase()
  if (normalized === 'WALI_MURID') return 'Wali Murid'
  if (normalized === 'GURU') return 'Guru'
  if (normalized === 'KEPSEK') return 'Kepsek'
  if (normalized.startsWith('BIDANG_')) {
    const bidang = normalized.replace('BIDANG_', '')
    return `Bidang ${bidang.charAt(0).toUpperCase() + bidang.slice(1).toLowerCase()}`
  }
  return role || '-'
}

onMounted(() => {
  store.fetchDashboardData()
})
</script>