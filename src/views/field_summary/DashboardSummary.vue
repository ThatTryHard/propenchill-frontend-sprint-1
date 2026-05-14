<template>
  <DashboardLayout>
    <div class="space-y-6 pb-10">

      <div>
        <h1 class="text-[26px] font-bold text-[var(--app-heading)]">Ringkasan Surat Bidang {{ formattedKategori }}</h1>
        <p class="text-[15px] text-[var(--app-muted)] mt-1">Lihat dan kelola pengajuan surat yang telah dibuat</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="bg-[var(--app-success-light)] rounded-xl p-5 text-center border border-[var(--app-success-lighter)] shadow-sm flex flex-col justify-center items-center h-[120px]">
          <h3 class="text-[var(--app-heading)] font-bold text-[15px] leading-tight mb-2">Total Surat<br>Masuk</h3>
          <p class="text-3xl font-extrabold text-[var(--app-success-dark)] mb-1">{{ summaryData.total_masuk }}</p>
          <p class="text-[10px] text-[var(--app-muted)] font-medium">{{ summaryData.masuk_bulan_ini }} surat di bulan ini</p>
        </div>

        <div class="bg-[var(--app-success-light)] rounded-xl p-5 text-center border border-[var(--app-success-lighter)] shadow-sm flex flex-col justify-center items-center h-[120px]">
          <h3 class="text-[var(--app-heading)] font-bold text-[15px] leading-tight mb-2">Total Surat<br>Keluar</h3>
          <p class="text-3xl font-extrabold text-[var(--app-success-dark)] mb-1">{{ summaryData.total_keluar }}</p>
          <p class="text-[10px] text-[var(--app-muted)] font-medium">{{ summaryData.keluar_bulan_ini }} surat di bulan ini</p>
        </div>

        <div class="bg-[var(--app-success-light)] rounded-xl p-5 text-center border border-[var(--app-success-lighter)] shadow-sm flex flex-col justify-center items-center h-[120px]">
          <h3 class="text-[var(--app-heading)] font-bold text-[15px] leading-tight mb-2">Menunggu<br>Verifikasi</h3>
          <p class="text-3xl font-extrabold text-[var(--app-success-dark)] mb-1">{{ summaryData.pending }}</p>
          <p class="text-[10px] text-[var(--app-muted)] font-medium">{{ summaryData.pending }} sedang diproses</p>
        </div>

        <div class="bg-[var(--app-success-light)] rounded-xl p-5 text-center border border-[var(--app-success-lighter)] shadow-sm flex flex-col justify-center items-center h-[120px]">
          <h3 class="text-[var(--app-heading)] font-bold text-[15px] leading-tight mb-2">Surat<br>Ditolak</h3>
          <p class="text-3xl font-extrabold text-[var(--app-success-dark)] mb-1">{{ summaryData.ditolak }}</p>
          <p class="text-[10px] text-[var(--app-muted)] font-medium px-2">{{ summaryData.pesanDitolak }}</p>
        </div>
      </div>

      <div class="bg-[var(--app-bg)] p-5 rounded-xl shadow-sm border border-[var(--app-border)] flex items-center gap-6">

        <div class="flex items-center gap-3 pr-4 h-[56px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="26" viewBox="0 0 37 34" fill="none" class="text-[var(--app-heading)]">
            <path d="M35 1.66675L1.66669 1.66675L15 17.4334V28.3334L21.6667 31.6667V17.4334L35 1.66675Z" stroke="currentColor" stroke-width="3.33333" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-[17px] font-bold text-[var(--app-heading)]">Filter Data</span>
        </div>

        <div class="flex flex-1 items-center gap-5">

          <div class="flex items-center gap-3">
            <label class="text-[16px] font-bold text-[var(--app-heading)] whitespace-nowrap">Tanggal</label>
            <div class="w-[180px] rounded-[12px] p-[2px] shadow-sm bg-[linear-gradient(90.74deg,var(--app-success),var(--app-warning))] transition-all duration-200 hover:shadow-md">
              <div class="bg-[var(--app-bg)] rounded-[10px] overflow-hidden border-none h-[52px] flex items-center px-[16px]">
                <input
                  type="date"
                  v-model="filters.tanggal"
                  class="w-full text-[16px] font-semibold text-[var(--app-text)] bg-transparent outline-none border-none ring-0 cursor-pointer appearance-none flex-row-reverse gap-2 m-0 p-0"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <label class="text-[16px] font-bold text-[var(--app-heading)] whitespace-nowrap">Status</label>
            <VDropdown
              :options="statusOptions"
              :items="statusOptions"
              v-model="filters.status"
              placeholder="Semua"
              class="w-[140px]"
            />
          </div>

          <div class="flex items-center gap-3">
            <label class="text-[16px] font-bold text-[var(--app-heading)] whitespace-nowrap">Klasifikasi</label>
            <VDropdown
              :options="klasifikasiOptions"
              :items="klasifikasiOptions"
              v-model="filters.klasifikasi"
              placeholder="Semua"
              class="w-[150px]"
            />
          </div>

          <div class="rounded-[12px] p-[2px] shadow-sm bg-[linear-gradient(90.74deg,var(--app-success),var(--app-warning))] transition-all duration-200 hover:shadow-md flex-shrink-0">
            <button @click="resetFilters" class="bg-[var(--app-bg)] w-[52px] h-[52px] rounded-[10px] flex items-center justify-center outline-none border-none hover:bg-[var(--app-border)] transition-colors cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.48395 3.00947 7.06897 3.99122 5.26 5.74L3 8M8 8H3V3M3 12C3 14.3869 3.94821 16.6761 5.63604 18.364C7.32387 20.0518 9.61305 21 12 21C14.516 20.9905 16.931 20.0088 18.74 18.26L21 16M21 21V16H16" stroke="var(--app-heading)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden flex flex-col">

        <div class="p-5 flex flex-col gap-5 w-full">

          <div class="relative w-full rounded-[12px] p-[2px] bg-[linear-gradient(90.74deg,#3f9760,#d1955f)] shadow-sm">
            <div class="bg-white rounded-[10px] flex items-center h-[48px] px-4">
              <span class="flex items-center pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M19 18.9999L14.66 14.6599M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" stroke="#B2B5BA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>

              <input
                type="text"
                v-model="searchQuery"
                class="w-full bg-transparent border-none outline-none text-[#9CA3AF] placeholder-[#9CA3AF] text-sm font-medium focus:ring-0"
                placeholder="Cari surat berdasarkan nama, deskripsi, atau kategori..."
              >
            </div>
          </div>

        <div class="custom-table w-full">
          <VTable :columns="tableHeaders" :rows="tableData">
            <template #cell-klasifikasi="{ row }">
              <span class="text-[13px] text-[#374151]">{{ row.klasifikasi || 'Surat Masuk' }}</span>
            </template>

            <template #cell-status="{ value }">
              <span v-if="!value || value === '-'" class="font-bold text-gray-500">-</span>
              <div
                v-else
                class="px-4 py-1.5 rounded-[20px] text-white text-[11px] font-bold inline-block text-center min-w-[80px]"
                :style="getStatusStyle(value)"
              >
                {{ value }}
              </div>
            </template>

            <template #cell-aksi="{ row }">
              <div class="flex items-center gap-3">
                <button
                  @click="goToDetail(row)"
                  class="text-[#858A91] font-medium text-[14px] underline decoration-1 underline-offset-4 hover:text-[#374151] transition-colors"
                >
                  Detail
                </button>

                <button
                  v-if="isDownloadable(row)"
                  @click="handleDownload(row)"
                  class="flex items-center justify-center hover:opacity-70 transition-opacity"
                  title="Unduh Surat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                    <path
                      d="M8.16663 10.6665V0.666504M12.3333 6.49984L8.16663 10.6665L3.99996 6.49984M15.6666 10.6665V13.9998C15.6666 14.4419 15.491 14.8658 15.1785 15.1783C14.8659 15.4909 14.442 15.6665 14 15.6665H2.33329C1.89127 15.6665 1.46734 15.4909 1.15478 15.1783C0.842221 14.8658 0.666626 14.4419 0.666626 13.9998L0.666626 10.6665"
                      stroke="#858A91"
                      stroke-width="1.33333"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </template>

            <template #cell-nomor_urut="{ row }">
              <span class="font-medium text-[#111827]">
                {{ row.nomor_urut }}
              </span>
            </template>
          </VTable>
        </div>

        </div> <div class="px-5 py-4 border-t border-[#E5E7EB] flex justify-between items-center bg-[#F8FBF9]">
          <span class="text-[13px] font-medium text-[#6B7280]">Show All</span>
          <VPagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @update:page="handlePageChange"
          />
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/users/auth';
import { useSuratAntreanStore } from '@/stores/surat_antrean';
import { useSuratMasukStore } from '@/stores/surat-masuk';
import DashboardLayout from './DashboardLayout.vue';
import VTable from '@/components/common/VTable.vue';
import VPagination from '@/components/common/VPagination.vue';
import VDropdown from '@/components/common/VDropdown.vue';
import api from '@/plugins/axios';

const props = defineProps<{ kategori: string }>();
const router = useRouter();
const authStore = useAuthStore();
const antreanStore = useSuratAntreanStore();
const suratMasukStore = useSuratMasukStore();

const allSuratData = ref<any[]>([]);

const formattedKategori = computed(() => {
  if (!props.kategori) return '';
  return props.kategori.charAt(0).toUpperCase() + props.kategori.slice(1);
});

const filters = ref({
  tanggal: '',
  status: '',
  klasifikasi: ''
});

const searchQuery = ref('');
const currentPage = ref(1);
const limit = ref(10);

const statusOptions = [
  { label: 'Semua', value: '' },
  { label: 'Diproses', value: 'Diproses' },
  { label: 'Diajukan', value: 'diajukan' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Disetujui', value: 'Disetujui' },
  { label: 'Ditolak', value: 'Ditolak' }
];

const klasifikasiOptions = [
  { label: 'Semua', value: '' },
  { label: 'Surat Masuk', value: 'Surat Masuk' },
  { label: 'Surat Keluar', value: 'Surat Keluar' }
];

const tableHeaders = [
  { key: 'nomor_urut', label: 'No.' },
  { key: 'nomor_surat', label: 'Nomor Surat' },
  { key: 'created_at', label: 'Tanggal Diterima' },
  { key: 'nama_pengaju', label: 'Pengirim' },
  { key: 'perihal', label: 'Perihal' },
  { key: 'klasifikasi', label: 'Klasifikasi Surat' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: 'Aksi' }
];

function formatDate(value: string) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function resolveDetailPath(item: any) {
  const role = String(authStore.role || '').toUpperCase();
  const id = item.id_surat || item.id_surat_masuk;

  if (item.arah_surat === 'Surat Masuk') {
    if (role === 'ADMIN') return `/admin/surat-masuk/${id}`;
    if (role === 'KEPSEK') return `/kepsek/surat-masuk/${id}`;
    return `/department-teachers/surat-masuk/${id}`;
  } else {
    if (role === 'ADMIN') return `/admin/surat-antrean/${id}`;
    if (role === 'KEPSEK') return `/kepsek/surat-antrean/${id}`;
    return `/department-teachers/surat-antrean/${id}`;
  }
}

const filteredSuratList = computed(() => {
  let result = [...allSuratData.value];

  if (props.kategori) {
    const targetKategori = props.kategori.toUpperCase();
    result = result.filter(s => {
       const kategoriFilter = String(s.kategori_filter || '').toUpperCase();
       return kategoriFilter.includes(targetKategori);
    });
  }

  if (filters.value.status) {
    result = result.filter(s =>
      String(s.status || '').toLowerCase() === String(filters.value.status).toLowerCase()
    );
  }

  if (filters.value.tanggal) {
    result = result.filter(s => {
        const suratDate = String(s.tanggal_diterima || '').split('T')[0];
        return suratDate === filters.value.tanggal;
    });
  }

  if (filters.value.klasifikasi) {
    result = result.filter(s => s.arah_surat === filters.value.klasifikasi);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((s) => {
      const title = String(s.perihal || '').toLowerCase();
      const pengaju = String(s.pengirim || '').toLowerCase();
      return title.includes(query) || pengaju.includes(query);
    });
  }

  return result.sort((a, b) => new Date(b.tanggal_diterima).getTime() - new Date(a.tanggal_diterima).getTime());
});

const summaryData = computed(() => {
  const currentList = filteredSuratList.value;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const countBulanIni = (arahSurat: string) => {
    return currentList.filter(s => {
      if (s.arah_surat !== arahSurat) return false;
      if (!s.tanggal_diterima) return false;
      const d = new Date(s.tanggal_diterima);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;
  };

  const listDitolak = currentList.filter(s => {
    const st = String(s.status || '').toLowerCase();
    return st === 'ditolak' || st === 'dibatalkan';
  });

  const jumlahDitolak = listDitolak.length;
  let keteranganDitolak = "Belum ada surat yang ditolak";

  if (jumlahDitolak > 0) {
    const counts: Record<string, number> = {};
    listDitolak.forEach(s => {
      const p = s.perihal || 'Tanpa Perihal';
      counts[p] = (counts[p] || 0) + 1;
    });

    let maxCount = 0;
    let palingSering = '';

    for (const [perihal, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        palingSering = perihal;
      }
    }

    keteranganDitolak = `"${palingSering}" sering ditolak`;
  }

  return {
    total_masuk: currentList.filter(s => s.arah_surat === 'Surat Masuk').length,
    masuk_bulan_ini: countBulanIni('Surat Masuk'),
    total_keluar: currentList.filter(s => s.arah_surat === 'Surat Keluar').length,
    keluar_bulan_ini: countBulanIni('Surat Keluar'),
    pending: currentList.filter(s => ['Diproses', 'Diajukan', 'Pending'].includes(s.status)).length,
    ditolak: jumlahDitolak,
    pesanDitolak: keteranganDitolak
  };
});

const totalPages = computed(() => {
  return Math.ceil(filteredSuratList.value.length / limit.value) || 1;
});

const tableData = computed(() => {
  const start = (currentPage.value - 1) * limit.value;
  const end = start + limit.value;

  return filteredSuratList.value.slice(start, end).map((item, index) => ({
    ...item,

    nomor_urut: start + index + 1,

    nomor_surat: item.nomor_surat || '-',
    created_at: formatDate(item.tanggal_diterima),
    nama_pengaju: item.pengirim,
    perihal: item.perihal,
    klasifikasi: item.arah_surat,
    status: item.status
  }));
});

const fetchData = async () => {
  try {
    await antreanStore.fetchAntreanList();
    const suratKeluar = antreanStore.suratList.map((item: any) => ({
      ...item,
      arah_surat: 'Surat Keluar',
      tanggal_diterima: item.tanggal_pengajuan || item.created_at || '',
      pengirim: item.nama_pengaju || '-',
      perihal: item.perihal || item.template_nama || 'Tanpa Perihal',
      kategori_filter: String(item.kategori || '').toUpperCase()
    }));

    await suratMasukStore.fetchSuratMasukList();
    const suratMasuk = suratMasukStore.suratList.map((item: any) => {
      return {
        ...item,
        arah_surat: 'Surat Masuk',
        nomor_surat: item.nomor_surat_sistem || '-',
        tanggal_diterima: item.tanggal_terima || item.created_at || '',
        pengirim: item.pengirim?.nama_instansi || item.instansi_pengirim || '-',
        perihal: item.perihal || 'Tanpa Perihal',
        status: item.status || 'Diajukan',
        kategori_filter: String(item.kategori || item.bidang || item.tujuan || props.kategori).toUpperCase()
      };
    });

    allSuratData.value = [...suratKeluar, ...suratMasuk];

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};

const resetFilters = () => {
  filters.value = { tanggal: '', status: '', klasifikasi: '' };
  searchQuery.value = '';
  currentPage.value = 1;
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    green: 'radial-gradient(77.91% 77.91% at 50% 100%, #3F9760 4.91%, #0C4923 100%)',
    red: 'radial-gradient(77.91% 77.91% at 50% 100%, #EF4444 4.91%, #991B1B 100%)',
    yellow: 'radial-gradient(77.91% 77.91% at 50% 100%, #FBBF24 4.91%, #B45309 100%)',
  };

  let selectedGradient = styles.yellow;
  if (status === 'Disetujui' || status === 'Selesai') selectedGradient = styles.green;
  if (status === 'Ditolak') selectedGradient = styles.red;

  return {
    background: selectedGradient,
    borderRadius: '20px',
    boxShadow: 'inset 0 -2px 0 0 rgba(0, 0, 0, 0.40), inset 0 1px 0 0 rgba(248, 250, 252, 0.40)',
    border: 'none'
  };
};

const goToDetail = (row: any) => {
  const kategori = row.klasifikasi === 'Surat Masuk' ? 'masuk' : 'keluar';
  const id = row.id_surat_masuk || row.id_surat;

  if (id) {
    router.push({
      path: `/akademik/detail/${kategori}/${id}`,
      query: { urut: row.nomor_urut }
    });
  } else {
    console.error("ID tidak ditemukan!", row);
  }
};

const isDownloadable = (row: any) => {
  const s = String(row.status || '').toLowerCase();
  const isApproved = ['disetujui', 'selesai', 'verified', 'approved'].includes(s);
  const hasNomor = row.nomor_surat && row.nomor_surat !== '-';

  return isApproved && hasNomor;
};

const handleDownload = async (row: any) => {
  try {
    const id = row.id_surat_masuk || row.id_surat;
    const kategori = row.klasifikasi === 'Surat Masuk' ? 'masuk' : 'keluar';

    let endpoint = `/api/letters/requests/${id}/download`;
    if (kategori === 'masuk') {
      endpoint = `/api/letters/surat-masuk/${id}/download`;
    }

    const response = await api.get(endpoint, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Surat_${kategori.toUpperCase()}_${id}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error: any) {
    console.error('Download error:', error);
    alert(error.response?.data?.error || 'Gagal mengunduh surat.');
  }
};

watch([filters, searchQuery], () => {
  currentPage.value = 1;
}, { deep: true });

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
input:focus {
  outline: none !important;
  box-shadow: none !important;
}

input {
  color: #9CA3AF !important;
}

input::placeholder {
  color: #9CA3AF !important;
  opacity: 1;
}

.custom-table {
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.custom-table :deep(thead tr) {
  background-color: #D4E8D9 !important;
}

.custom-table :deep(th) {
  color: #1F2937 !important;
  font-weight: 700 !important;
  font-size: 13px !important;
  padding: 16px !important;
  border: none !important;
  text-align: left !important;
}

.custom-table :deep(th:first-child) {
  border-top-left-radius: 0 !important;
}

.custom-table :deep(th:last-child) {
  border-top-right-radius: 0 !important;
}

.custom-table :deep(td) {
  padding: 16px !important;
  font-size: 13px !important;
  color: #1F2937 !important;
  border-bottom: 1px solid #E5E7EB !important;
  vertical-align: middle !important;
}

.custom-table-wrapper {
  padding: 0 !important;
  margin: 0 !important;
}
</style>