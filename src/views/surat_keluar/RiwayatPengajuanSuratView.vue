<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main class="flex-1 overflow-y-auto layout-bg">
      <div class="main-content-wrapper">
        <div class="header-section">
          <div class="title-group">
            <h1 class="text-[24px] md:text-[28px] font-bold leading-[120%] text-[#111827]">
              Daftar Pengajuan Surat Keluar
            </h1>
            <p class="text-[13px] md:text-[14px] leading-[145%] text-[#858a91] mt-1">
              Lihat dan kelola pengajuan surat yang telah dibuat
            </p>
          </div>
          <VButton 
            class="hifi-btn-custom-green" 
            @click="$router.push('/surat-keluar/pengajuan')"
          >
            <template #left-icon>
              <Plus :size="20" :stroke-width="3" color="white" class="mr-2" />
            </template>
            <template #icon>
              <Plus :size="20" :stroke-width="3" color="white" class="mr-2" />
            </template>
            <Plus :size="20" :stroke-width="3" color="white" class="mr-2 inline-block" />
            <span>Buat Pengajuan</span>
          </VButton>
        </div>

        <div class="search-section">
          <VInputField v-model="searchQuery" state="search" placeholder="Cari Surat" />
        </div>

        <div class="filter-section">
          <div class="dropdown-group">
            <div class="hifi-dropdown">
              <VDropdown v-model="filterMonth" :options="monthOptions" placeholder="Bulan" />
            </div>
            <div class="hifi-dropdown">
              <VDropdown v-model="filterStatus" :options="statusOptions" placeholder="Status" />
            </div>
          </div>
        </div>

        <div class="hifi-table-container">
          <div class="table-wrapper">
            <table class="hifi-table">
              <thead>
                <tr>
                  <th v-for="col in headers" :key="col.value">{{ col.text }}</th>
                </tr>
              </thead>
              <tbody>
                <template v-if="filteredSurat.length > 0">
                  <tr v-for="(row, index) in filteredSurat" :key="row.id_pengajuan">
                    <td class="cell-center">{{ index + 1 }}</td>
                    <td class="cell-jenis-surat">{{ row.template_nama }}</td>
                    <td class="cell-center">{{ row.nomor_surat || '-' }}</td>
                    <td class="cell-center">{{ formatDate(row.tanggal_pengajuan) }}</td>
                    <td class="cell-status">{{ row.status }}</td>
                    <td class="cell-action" @click="$router.push(`/surat-keluar/detail/${row.id_pengajuan}`)">
                      Detail
                    </td>
                  </tr>
                </template>
                <template v-else>
                  <tr>
                    <td colspan="6" class="empty-state">Tidak ada data pengajuan surat yang tersedia.</td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <div class="show-all">Show All</div>
        </div>

        <div class="pagination-container">
          <VPagination v-model:current-page="currentPage" :total-pages="10" />
        </div>
      </div>
    </main>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/plugins/axios';
import DashboardLayout from '@/components/common/DashboardLayout.vue';
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue';
import VButton from '@/components/common/VButton.vue';
import VPagination from '@/components/common/VPagination.vue';
import VInputField from '@/components/common/VInputField.vue';
import VDropdown from '@/components/common/VDropdown.vue';
import { 
  Plus
} from 'lucide-vue-next';

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
];

const listPengajuan = ref<RiwayatItem[]>([]);
const filterStatus = ref('');
const filterMonth = ref('');
const searchQuery = ref('');
const currentPage = ref(1);

const monthOptions = [
  { label: 'Bulan', value: '' },
  ...Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return { label: getMonthName(month) || `Bulan ${month}`, value: String(month) };
  }),
];

const statusOptions = [
  { label: 'Status', value: '' },
  { label: 'Verified', value: 'Verified' },
  { label: 'Rejected', value: 'Rejected' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Menunggu Verifikasi Kepsek', value: 'Menunggu Verifikasi Kepsek' },
  { label: 'Dibatalkan', value: 'Dibatalkan' },
];

const getMonthName = (m: number) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return months[m - 1];
};

const fetchRiwayat = async () => {
  try {
    const response = await api.get('/api/letters/my-requests');
    listPengajuan.value = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
        ? response.data
        : [];
  } catch (error) { console.error(error); }
};

const normalizeStatus = (status: string | null | undefined) => String(status || '').toLowerCase();

const filteredSurat = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return listPengajuan.value.filter((surat) => {
    const matchesSearch = !query || surat.template_nama?.toLowerCase().includes(query);
    const matchesMonth = !filterMonth.value || new Date(surat.tanggal_pengajuan || '').getMonth() + 1 === parseInt(filterMonth.value);
    const matchesStatus =
      !filterStatus.value ||
      normalizeStatus(surat.status) === normalizeStatus(filterStatus.value);
    return matchesSearch && matchesMonth && matchesStatus;
  });
});

const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';

onMounted(fetchRiwayat);
</script>

<style scoped>
.main-content-wrapper {
  padding: 40px 60px;
  max-width: 1440px;
}

.layout-bg {
  background: var(--Gradient-Primary-Background, linear-gradient(180deg, #FFF 0%, #EAF7EF 100%));
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.hifi-btn-custom-green {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  padding: 12px 28px !important;
  border-radius: 20px !important;
  border: none !important;
  cursor: pointer;
  color: #ffffff !important;
  font-weight: 700 !important;
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: radial-gradient(77.91% 77.91% at 50% 100%, #3F9760 4.91%, #0C4923 100%) !important;
  box-shadow: 0 -2px 0 0 rgba(0, 0, 0, 0.40) inset, 0 1px 0 0 rgba(248, 250, 252, 0.40) inset !important;
  position: relative;
  z-index: 10;
}

.hifi-search-bar {
  position: relative;
  width: 100%;
  margin-bottom: 16px;
}

.hifi-search-bar input {
  width: 100%;
  padding: 14px 20px 14px 54px;
  border-radius: 12px;
  border: 1px solid #D1D5DB;
  font-size: 16px;
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
}

.filter-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 24px;
}

.dropdown-group {
  display: flex;
  gap: 12px;
}

.hifi-dropdown {
  position: relative;
}

.hifi-dropdown select {
  padding: 10px 40px 10px 16px;
  border-radius: 10px;
  border: 1px solid #111827;
  appearance: none;
  font-weight: 600;
  background: white;
}

.chevron-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.table-wrapper {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #E5E7EB;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.hifi-table {
  width: 100%;
  border-collapse: collapse;
}

.hifi-table thead th {
  background-color: #C6DECF;
  color: #111827;
  font-weight: 700;
  font-size: 18px;
  padding: 20px;
  text-align: center;
}

.hifi-table tbody tr:nth-child(even) {
  background-color: #F8FAFC;
}

.hifi-table tbody td {
  padding: 16px 20px;
  font-size: 16px;
  color: #111827;
  border-bottom: 1px solid #F3F4F6;
  vertical-align: middle;
}

.empty-state {
  text-align: center;
  padding: 40px !important;
  color: #6B7280;
  font-style: italic;
}

.cell-center {
  text-align: center;
}

.cell-jenis-surat {
  font-weight: 600;
  color: #111827;
  max-width: 280px;
  line-height: 1.4;
}

.cell-status {
  text-align: center;
  font-weight: 600;
}

.cell-action {
  text-align: center;
  text-decoration: underline;
  font-weight: 700;
  cursor: pointer;
  color: #111827;
}

.show-all {
  color: #9B9FA5;
  font-size: 14px;
  margin-top: 12px;
  font-weight: 500;
}

.pagination-container { display: flex; justify-content: center; margin-top: 40px; }
.inline-block { display: inline-block; }
.mr-2 { margin-right: 8px; }
</style>