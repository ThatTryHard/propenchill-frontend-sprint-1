<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import api from '@/plugins/axios'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VPagination from '@/components/common/VPagination.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VTable from '@/components/common/VTable.vue'
import VChip from '@/components/common/VChip.vue'
import { Plus } from 'lucide-vue-next'

interface RiwayatItem {
  id_pengajuan: number
  template_nama?: string
  nomor_surat?: string
  tanggal_pengajuan?: string
  status?: string
}

const headers = [
  { text: 'ID Surat', value: 'id_surat' },
  { text: 'Jenis Surat', value: 'template_nama' },
  { text: 'Nomor Surat', value: 'nomor_surat' },
  { text: 'Tanggal Pengajuan', value: 'tanggal_pengajuan' },
  { text: 'Status', value: 'status' },
  { text: 'Aksi', value: 'aksi' },
]

const tableColumns = computed(() =>
  headers.map((header) => ({
    key: header.value,
    label: header.text,
    align:
      header.value === 'template_nama'
        ? ('left' as const)
        : ('center' as const),
    nowrap: header.value !== 'template_nama',
  })),
)

const listPengajuan = ref<RiwayatItem[]>([])
const filterStatus = ref('')
const filterMonth = ref('')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const isLoading = ref(false)

const getMonthName = (m: number) => {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]

  return months[m - 1]
}

const monthOptions = [
  { label: 'Bulan', value: '' },
  ...Array.from({ length: 12 }, (_, index) => {
    const month = index + 1
    return { label: getMonthName(month) || `Bulan ${month}`, value: String(month) }
  }),
]

const statusOptions = [
  { label: 'Status', value: '' },
  { label: 'Verified', value: 'Verified' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Menunggu Verifikasi Kepsek', value: 'Menunggu Verifikasi Kepsek' },
  { label: 'Dibatalkan', value: 'Dibatalkan' },
]

const fetchRiwayat = async () => {
  isLoading.value = true

  try {
    const response = await api.get('/api/letters/my-requests')
    listPengajuan.value = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
        ? response.data
        : []
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

const normalizeStatus = (status: string | null | undefined) => String(status || '').toLowerCase()

const filteredSurat = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return listPengajuan.value.filter((surat) => {
    const matchesSearch = !query || surat.template_nama?.toLowerCase().includes(query)

    const matchesMonth =
      !filterMonth.value ||
      new Date(surat.tanggal_pengajuan || '').getMonth() + 1 === parseInt(filterMonth.value)

    const matchesStatus =
      !filterStatus.value || normalizeStatus(surat.status) === normalizeStatus(filterStatus.value)

    return matchesSearch && matchesMonth && matchesStatus
  })
})

const totalPages = computed(() => {
  const total = Math.ceil(filteredSurat.value.length / itemsPerPage)
  return total > 0 ? total : 1
})

const rowStartIndex = computed(() => (currentPage.value - 1) * itemsPerPage)

const paginatedSurat = computed(() => {
  const start = rowStartIndex.value
  const end = start + itemsPerPage
  return filteredSurat.value.slice(start, end)
})

watch([searchQuery, filterMonth, filterStatus], () => {
  currentPage.value = 1
})

watch(totalPages, (newTotalPages) => {
  if (currentPage.value > newTotalPages) {
    currentPage.value = newTotalPages
  }
})

const formatDate = (d?: string) =>
  d
    ? new Date(d).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-'

const getStatusVariant = (status?: string) => {
  const normalized = normalizeStatus(status)

  if (normalized === 'verified') return 'primary'
  if (normalized === 'pending' || normalized === 'menunggu verifikasi kepsek') return 'warning'
  if (normalized === 'rejected') return 'danger'
  if (normalized === 'dibatalkan') return 'deleted'

  return 'tertiary'
}

onMounted(fetchRiwayat)
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main
      class="
        min-h-full bg-[var(--app-bg)] px-[60px] py-10
        font-[var(--font-sans)] text-[var(--app-text)]
        max-[900px]:px-6 max-[900px]:py-7
        max-[640px]:px-4
      "
    >
      <div class="flex max-w-[1440px] flex-col">
        <header
          class="
            mb-8 flex items-center justify-between gap-5
            max-[768px]:flex-col max-[768px]:items-stretch
          "
        >
          <div class="min-w-0">
            <h1
              class="
                m-0 text-[length:var(--app-page-title-font)]
                font-bold leading-[1.2] text-[var(--app-heading)]
              "
            >
              Daftar Pengajuan Surat Keluar
            </h1>

            <p
              class="
                mt-1 mb-0 text-[length:var(--app-page-subtitle-font)]
                font-medium leading-[1.45] text-[var(--app-muted)]
              "
            >
              Lihat dan kelola pengajuan surat yang telah dibuat
            </p>
          </div>

          <VButton
            variant="primary"
            size="sm"
            class="shrink-0 max-[768px]:w-full"
            @click="$router.push('/surat-keluar/pengajuan')"
          >
            <template #leftIcon>
              <Plus :size="16" :stroke-width="3" />
            </template>

            <span>Buat Pengajuan</span>
          </VButton>
        </header>

        <section class="mb-3">
          <VInputField
            v-model="searchQuery"
            state="search"
            placeholder="Cari Surat"
          />
        </section>

        <section class="mb-6 flex justify-end">
          <div
            class="
              flex gap-3
              max-[900px]:w-full max-[900px]:flex-col
            "
          >
            <div class="w-[180px] flex-none max-[900px]:w-full">
              <VDropdown
                v-model="filterMonth"
                :options="monthOptions"
                placeholder="Bulan"
              />
            </div>

            <div class="w-[300px] flex-none max-[900px]:w-full">
              <VDropdown
                v-model="filterStatus"
                :options="statusOptions"
                placeholder="Status"
              />
            </div>
          </div>
        </section>

        <section class="flex flex-col">
          <VTable
            :columns="tableColumns"
            :rows="paginatedSurat"
            :is-loading="isLoading"
            loading-message="Memuat data pengajuan surat..."
            empty-message="Tidak ada data pengajuan surat yang tersedia."
          >
            <template #cell-id_surat="{ index }">
              <span
                class="
                  text-[length:var(--app-table-cell-font)]
                  leading-[1.35] text-[var(--app-subtext)]
                "
              >
                {{ rowStartIndex + index + 1 }}
              </span>
            </template>

            <template #cell-template_nama="{ row }">
              <span
                class="
                  block max-w-[280px]
                  text-[length:var(--app-table-cell-font)]
                  font-semibold leading-[1.4] text-[var(--app-heading)]
                "
              >
                {{ row.template_nama || '-' }}
              </span>
            </template>

            <template #cell-nomor_surat="{ row }">
              <span
                class="
                  text-[length:var(--app-table-cell-font)]
                  leading-[1.35] text-[var(--app-subtext)]
                "
              >
                {{ row.nomor_surat || '-' }}
              </span>
            </template>

            <template #cell-tanggal_pengajuan="{ row }">
              <span
                class="
                  text-[length:var(--app-table-cell-font)]
                  leading-[1.35] text-[var(--app-subtext)]
                "
              >
                {{ formatDate(row.tanggal_pengajuan) }}
              </span>
            </template>

            <template #cell-status="{ row }">
              <VChip
                :label="row.status || '-'"
                :variant="getStatusVariant(row.status)"
              />
            </template>

            <template #cell-aksi="{ row }">
              <VButton
                variant="secondary"
                size="sm"
                @click="$router.push(`/surat-keluar/detail/${row.id_pengajuan}`)"
              >
                Detail
              </VButton>
            </template>
          </VTable>

          <div
            class="
              mt-4 flex items-center justify-between gap-4
              max-[640px]:flex-col max-[640px]:items-start
            "
          >
            <p
              class="
                m-0 text-[length:var(--app-font-sm)]
                font-medium leading-[1.4] text-[var(--app-muted)]
              "
            >
              Menampilkan {{ paginatedSurat.length }} dari {{ filteredSurat.length }} data
            </p>

            <VPagination
              v-model:current-page="currentPage"
              :total-pages="totalPages"
            />
          </div>
        </section>
      </div>
    </main>
  </DashboardLayout>
</template>