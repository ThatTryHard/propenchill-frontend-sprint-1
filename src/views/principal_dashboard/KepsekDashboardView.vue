<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main
      class="
        flex h-full flex-col gap-4
        bg-[var(--app-bg)] p-6
        font-[var(--font-sans)] text-[var(--app-text)]
      "
    >
      <section class="flex flex-col gap-4">
        <div>
          <h1
            class="
              m-0 text-[length:var(--app-page-title-font)]
              font-bold leading-[1.2] text-[var(--app-heading)]
            "
          >
            Dashboard Kinerja Persuratan
          </h1>

          <p
            class="
              mt-1 mb-0 text-[length:var(--app-page-subtitle-font)]
              leading-[1.4] text-[var(--app-muted)]
            "
          >
            Kelola Kinerja Persuratan
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

      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

      <section class="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <KepsekPanel paddingClass="px-[24px] py-[16px] h-[280px]">
          <KepsekLineChart
            title="Trend Waktu Persuratan"
            subtitle="Total surat masuk dan keluar selama 12 bulan"
            :data="trendWaktuChart"
            :chartHeight="190"
          />
        </KepsekPanel>

        <KepsekPanel paddingClass="px-[24px] py-[16px] h-[280px]">
          <KepsekPendingDurasi :data="store.pendingDurasi" />
        </KepsekPanel>

        <KepsekPanel paddingClass="px-[24px] py-[16px] h-[280px]">
          <KepsekPieChart
            title="Status Surat Keluar"
            subtitle="Distribusi status surat keluar saat ini"
            :data="statusSuratKeluarChart"
            :chartSize="170"
          />
        </KepsekPanel>
      </section>

      <section class="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <KepsekPanel paddingClass="px-[24px] py-[16px] h-[320px] overflow-y-auto">
          <div class="flex flex-col gap-4">
            <div>
              <h3
                class="
                  m-0 text-[length:var(--app-section-title-font)]
                  font-semibold leading-[1.2] text-[var(--app-heading)]
                "
              >
                Approval Rate per User
              </h3>

              <p
                class="
                  mt-1 mb-0 text-[length:var(--app-font-xs)]
                  leading-[1.4] text-[var(--app-subtext)]
                "
              >
                Perbandingan tingkat persetujuan antar pengguna
              </p>
            </div>

            <div
              v-if="approvalRate.length === 0"
              class="
                text-[length:var(--app-font-sm)]
                leading-[1.5] text-[var(--app-muted)]
              "
            >
              Belum ada data approval rate.
            </div>

            <div v-else class="flex flex-col gap-3">
              <div
                v-for="item in approvalRate"
                :key="item.nama"
                class="flex flex-col gap-2"
              >
                <div class="flex items-center justify-between gap-4">
                  <p
                    class="
                      m-0 text-[length:var(--app-font-sm)]
                      font-semibold leading-[1.4] text-[var(--app-heading)]
                    "
                  >
                    {{ item.nama }} ({{ formatRole(item.role) }})
                  </p>

                  <span
                    class="
                      text-[length:var(--app-font-sm)]
                      font-bold leading-[1.4] text-[var(--app-heading)]
                    "
                  >
                    {{ formatPercent(item.approval_rate) }}%
                  </span>
                </div>

                <div class="flex items-center gap-4">
                  <div
                    class="
                      h-[8px] flex-1 overflow-hidden rounded-full
                      bg-[var(--app-card-border)]
                    "
                  >
                    <div
                      class="h-full rounded-full bg-[var(--app-success)]"
                      :style="{ width: `${Math.min(100, item.approval_rate)}%` }"
                    />
                  </div>

                  <p
                    class="
                      m-0 min-w-[90px] text-right
                      text-[length:var(--app-font-xs)]
                      leading-[1.4] text-[var(--app-muted)]
                    "
                  >
                    {{ item.jumlah_approve }} acc / {{ item.jumlah_tolak }} tolak
                  </p>
                </div>
              </div>
            </div>
          </div>
        </KepsekPanel>

        <KepsekPanel paddingClass="px-[24px] py-[16px] h-[320px] overflow-y-auto">
          <div class="flex h-full flex-col gap-4">
            <div class="flex items-start gap-4">
              <div
                class="
                  rounded-[10px]
                  bg-[linear-gradient(90.7368deg,var(--app-accent)_0%,var(--app-accent-2)_100%)]
                  p-[8px] text-[var(--app-text-inverse)]
                "
              >
                <Mail class="h-5 w-5" />
              </div>

              <div>
                <h3
                  class="
                    m-0 text-[length:var(--app-section-title-font)]
                    font-bold leading-[1.2] text-[var(--app-heading)]
                  "
                >
                  Flow Surat per Bidang
                </h3>

                <p
                  class="
                    mt-1 mb-0 text-[length:var(--app-font-sm)]
                    leading-[1.4] text-[var(--app-subtext)]
                  "
                >
                  Surat masuk/keluar dari 3 bidang
                </p>
              </div>
            </div>

            <div
              class="
                flex flex-1 flex-col justify-around gap-2
                text-[length:var(--app-font-sm)]
                font-semibold leading-[1.4]
              "
            >
              <div
                v-for="item in flowBidangList"
                :key="item.label"
                class="flex flex-col gap-[2px]"
              >
                <div
                  class="
                    text-[length:var(--app-font-sm)]
                    font-normal leading-[1.4] text-[var(--app-heading)]
                  "
                >
                  {{ item.label }}
                </div>

                <div class="flex w-full items-center justify-between pr-4">
                  <span class="text-[var(--app-warning)]">↓ Surat Masuk</span>
                  <span class="font-bold text-[var(--app-warning)]">
                    {{ item.surat_masuk }}
                  </span>
                </div>

                <div class="flex w-full items-center justify-between pr-4">
                  <span class="text-[var(--app-success)]">↑ Surat Keluar</span>
                  <span class="font-bold text-[var(--app-success)]">
                    {{ item.surat_keluar }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </KepsekPanel>
      </section>
    </main>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Mail } from 'lucide-vue-next'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import VAlert from '@/components/common/VAlert.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import KepsekSummaryCard from '@/components/kepsek/KepsekSummaryCard.vue'
import KepsekLineChart from '@/components/kepsek/KepsekLineChart.vue'
import KepsekPieChart from '@/components/kepsek/KepsekPieChart.vue'
import KepsekPanel from '@/components/kepsek/KepsekPanel.vue'
import KepsekPendingDurasi from '@/components/kepsek/KepsekPendingDurasi.vue'
import { usePrincipalDashboardStore } from '@/stores/principal_dashboard'
import { useThemeColors } from '@/stores/principal_dashboard/themeColors'

const store = usePrincipalDashboardStore()
const colors = useThemeColors()

const summary = computed(() => store.summary)
const approvalRate = computed(() => store.approvalRate)
const errorMessage = computed(() => store.error)

const trendWaktuChart = computed(() =>
  store.trendWaktu.map((item) => ({
    label: item.bulan,
    masuk: item.surat_masuk,
    keluar: item.surat_keluar,
  })),
)

const statusSuratKeluarChart = computed(() => [
  {
    label: 'Menunggu (Wakil Bidang)',
    value: store.statusSuratKeluar.menunggu_wakil_bidang,
    color: colors.value.warning,
  },
  {
    label: 'Menunggu (Kepsek)',
    value: store.statusSuratKeluar.menunggu_kepsek,
    color: colors.value.info,
  },
  {
    label: 'Disetujui',
    value: store.statusSuratKeluar.disetujui,
    color: colors.value.success,
  },
  {
    label: 'Ditolak',
    value: store.statusSuratKeluar.ditolak,
    color: colors.value.danger,
  },
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
