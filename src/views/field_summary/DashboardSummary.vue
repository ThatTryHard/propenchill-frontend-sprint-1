<template>
  <FieldSummaryLayout>
    <div class="space-y-6 pb-10">

      <div>
        <h1 class="text-[length:var(--app-page-title-font)] font-bold text-[var(--app-heading)]">
          Ringkasan Surat Bidang {{ formattedKategori }}
        </h1>
        <p class="mt-1 text-[length:var(--app-page-subtitle-font)] text-[var(--app-muted)]">
          Lihat dan kelola pengajuan surat yang telah dibuat
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div class="bg-[var(--app-soft-card)] rounded-xl p-5 text-center border border-[var(--app-border)] shadow-sm flex flex-col justify-center items-center h-[120px]">
          <h3 class="mb-2 text-[length:var(--app-font-base)] font-bold leading-tight text-[var(--app-heading)]">Total Surat<br>Masuk</h3>
          <p class="mb-1 text-[length:var(--app-font-display)] font-extrabold text-[var(--app-success-dark)]">{{ summaryData.total_masuk }}</p>
          <p class="text-[length:var(--app-font-caption)] font-medium text-[var(--app-muted)]">{{ summaryData.masuk_bulan_ini }} surat di bulan ini</p>
        </div>

        <div class="bg-[var(--app-soft-card)] rounded-xl p-5 text-center border border-[var(--app-border)] shadow-sm flex flex-col justify-center items-center h-[120px]">
          <h3 class="mb-2 text-[length:var(--app-font-base)] font-bold leading-tight text-[var(--app-heading)]">Total Surat<br>Keluar</h3>
          <p class="mb-1 text-[length:var(--app-font-display)] font-extrabold text-[var(--app-success-dark)]">{{ summaryData.total_keluar }}</p>
          <p class="text-[length:var(--app-font-caption)] font-medium text-[var(--app-muted)]">{{ summaryData.keluar_bulan_ini }} surat di bulan ini</p>
        </div>

        <div class="bg-[var(--app-soft-card)] rounded-xl p-5 text-center border border-[var(--app-border)] shadow-sm flex flex-col justify-center items-center h-[120px]">
          <h3 class="mb-2 text-[length:var(--app-font-base)] font-bold leading-tight text-[var(--app-heading)]">Menunggu<br>Verifikasi</h3>
          <p class="mb-1 text-[length:var(--app-font-display)] font-extrabold text-[var(--app-warning)]">{{ summaryData.pending }}</p>
          <p class="text-[length:var(--app-font-caption)] font-medium text-[var(--app-muted)]">{{ summaryData.pending }} sedang diproses</p>
        </div>

        <div class="bg-[var(--app-soft-card)] rounded-xl p-5 text-center border border-[var(--app-border)] shadow-sm flex flex-col justify-center items-center h-[120px]">
          <h3 class="mb-2 text-[length:var(--app-font-base)] font-bold leading-tight text-[var(--app-heading)]">Surat<br>Ditolak</h3>
          <p class="mb-1 text-[length:var(--app-font-display)] font-extrabold text-[var(--app-danger)]">{{ summaryData.ditolak }}</p>
          <p class="px-2 text-[length:var(--app-font-caption)] font-medium text-[var(--app-muted)]">{{ summaryData.pesanDitolak }}</p>
        </div>

      </div>

      <div class="bg-[var(--app-card)] p-5 rounded-xl shadow-sm border border-[var(--app-card-border)] flex items-center gap-6 flex-wrap">

        <div class="flex items-center gap-3 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 37 34" fill="none" class="text-[var(--app-heading)]">
            <path d="M35 1.66675L1.66669 1.66675L15 17.4334V28.3334L21.6667 31.6667V17.4334L35 1.66675Z" stroke="currentColor" stroke-width="3.33333" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="text-[length:var(--app-font-lg)] font-bold text-[var(--app-heading)]">Filter Data</span>
        </div>

        <div class="flex flex-1 items-end gap-4">

          <div class="flex flex-1 flex-col gap-1.5">
            <span class="text-[length:var(--app-input-label-font)] font-semibold text-[var(--app-text)]">Tanggal</span>
            <VInputField
              v-model="filters.tanggal"
              type="date"
            />
          </div>

          <div class="flex flex-1 flex-col gap-1.5">
            <span class="text-[length:var(--app-input-label-font)] font-semibold text-[var(--app-text)]">Status</span>
            <VDropdown
              :options="statusOptions"
              :items="statusOptions"
              v-model="filters.status"
              placeholder="Semua"
              class="w-full"
            />
          </div>

          <div class="flex flex-1 flex-col gap-1.5">
            <span class="text-[length:var(--app-input-label-font)] font-semibold text-[var(--app-text)]">Klasifikasi</span>
            <VDropdown
              :options="klasifikasiOptions"
              :items="klasifikasiOptions"
              v-model="filters.klasifikasi"
              placeholder="Semua"
              class="w-full"
            />
          </div>

          <div class="rounded-[var(--app-input-radius)] p-[2px] bg-[linear-gradient(90.74deg,var(--app-success),var(--app-warning))] transition-all duration-200 hover:shadow-md shrink-0 self-end">
            <button
              @click="resetFilters"
              class="bg-[var(--app-input-bg)] min-w-[42px] h-[42px] rounded-[var(--app-input-inner-radius)] flex items-center justify-center border-none hover:bg-[var(--app-table-row-hover)] transition-colors cursor-pointer px-2"
              title="Reset filter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-[var(--app-heading)]">
                <path d="M21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.48395 3.00947 7.06897 3.99122 5.26 5.74L3 8M8 8H3V3M3 12C3 14.3869 3.94821 16.6761 5.63604 18.364C7.32387 20.0518 9.61305 21 12 21C14.516 20.9905 16.931 20.0088 18.74 18.26L21 16M21 21V16H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

        </div>
      </div>

      <div class="bg-[var(--app-card)] rounded-xl shadow-sm border border-[var(--app-card-border)] overflow-hidden flex flex-col">

        <div class="p-5 pb-0">
          <VInputField
            v-model="searchQuery"
            state="search"
            placeholder="Cari berdasarkan nomor surat, pengirim, atau perihal..."
          />
        </div>

        <div class="p-5">
          <VTable :columns="tableHeaders" :rows="tableData">

            <template #cell-klasifikasi="{ row }">
              <span class="text-[length:var(--app-font-xs)] text-[var(--app-text)]">{{ row.klasifikasi || 'Surat Masuk' }}</span>
            </template>

            <template #cell-status="{ value }">
              <span v-if="!value || value === '-'" class="font-bold text-[var(--app-muted)]">-</span>
              <VChip
                v-else
                :label="formatStatusLabel(value)"
                :variant="getStatusChipVariant(value)"
              />
            </template>

            <template #cell-aksi="{ row }">
              <div class="flex items-center gap-3">
                <button
                  @click="goToDetail(row)"
                  class="text-[length:var(--app-font-sm)] font-medium text-[var(--app-muted)] underline decoration-1 underline-offset-4 transition-colors hover:text-[var(--app-heading)]"
                >
                  Detail
                </button>
                <button
                  v-if="isDownloadable(row)"
                  @click="handleDownload(row)"
                  class="flex items-center justify-center hover:opacity-70 transition-opacity text-[var(--app-muted)]"
                  title="Unduh Surat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                    <path
                      d="M8.16663 10.6665V0.666504M12.3333 6.49984L8.16663 10.6665L3.99996 6.49984M15.6666 10.6665V13.9998C15.6666 14.4419 15.491 14.8658 15.1785 15.1783C14.8659 15.4909 14.442 15.6665 14 15.6665H2.33329C1.89127 15.6665 1.46734 15.4909 1.15478 15.1783C0.842221 14.8658 0.666626 14.4419 0.666626 13.9998L0.666626 10.6665"
                      stroke="currentColor"
                      stroke-width="1.33333"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </template>

            <template #cell-nomor_urut="{ row }">
              <span class="font-medium text-[var(--app-heading)]">{{ row.nomor_urut }}</span>
            </template>

          </VTable>
        </div>

        <div class="px-5 py-4 border-t border-[var(--app-card-border)] flex justify-end items-center bg-[var(--app-soft-card)]">
          <VPagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @update:page="handlePageChange"
          />
        </div>

      </div>
    </div>
  </FieldSummaryLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/users/auth';
import { useSuratAntreanStore } from '@/stores/surat_antrean';
import { useSuratMasukStore } from '@/stores/surat-masuk';
import FieldSummaryLayout from '@/components/layout/FieldSummaryLayout.vue';
import VTable from '@/components/common/VTable.vue';
import VPagination from '@/components/common/VPagination.vue';
import VDropdown from '@/components/common/VDropdown.vue';
import VInputField from '@/components/common/VInputField.vue';
import VChip from '@/components/common/VChip.vue';
import api from '@/plugins/axios';

type ChipVariant = 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger' | 'deleted';

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

const filters = ref({ tanggal: '', status: '', klasifikasi: '' });
const searchQuery = ref('');
const currentPage = ref(1);
const limit = ref(10);

const statusOptions = [
  { label: 'Semua', value: '' },
  { label: 'Diajukan', value: 'diajukan' },
  { label: 'Menunggu Verifikasi Kepsek', value: 'menunggu_verifikasi_kepsek' },
  { label: 'Disetujui', value: 'disetujui' },
  { label: 'Ditolak', value: 'ditolak' },
  { label: 'Dibatalkan', value: 'dibatalkan' },
];

const klasifikasiOptions = [
  { label: 'Semua', value: '' },
  { label: 'Surat Masuk', value: 'Surat Masuk' },
  { label: 'Surat Keluar', value: 'Surat Keluar' },
];

const tableHeaders = [
  { key: 'nomor_urut', label: 'No.' },
  { key: 'nomor_surat', label: 'Nomor Surat' },
  { key: 'created_at', label: 'Tanggal Diterima' },
  { key: 'nama_pengaju', label: 'Pengirim' },
  { key: 'perihal', label: 'Perihal' },
  { key: 'klasifikasi', label: 'Klasifikasi Surat' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: 'Aksi' },
];

function formatDate(value: string) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

const filteredSuratList = computed(() => {
  let result = [...allSuratData.value];

  if (props.kategori) {
    const targetKategori = props.kategori.toUpperCase();
    result = result.filter(s =>
      String(s.kategori_filter || '').toUpperCase().includes(targetKategori)
    );
  }

  if (filters.value.status) {
    result = result.filter(s =>
      normalizeStatusValue(String(s.status || '')) === filters.value.status
    );
  }

  if (filters.value.tanggal) {
    result = result.filter(s =>
      String(s.tanggal_diterima || '').split('T')[0] === filters.value.tanggal
    );
  }

  if (filters.value.klasifikasi) {
    result = result.filter(s => s.arah_surat === filters.value.klasifikasi);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter(s =>
      String(s.perihal || '').toLowerCase().includes(q) ||
      String(s.pengirim || '').toLowerCase().includes(q) ||
      String(s.nomor_surat || '').toLowerCase().includes(q)
    );
  }

  return result.sort(
    (a, b) => new Date(b.tanggal_diterima).getTime() - new Date(a.tanggal_diterima).getTime()
  );
});

const summaryData = computed(() => {
  const list = filteredSuratList.value;
  const mo   = new Date().getMonth();
  const yr   = new Date().getFullYear();

  const countMonth = (arah: string) =>
    list.filter(s => {
      if (s.arah_surat !== arah || !s.tanggal_diterima) return false;
      const d = new Date(s.tanggal_diterima);
      return d.getMonth() === mo && d.getFullYear() === yr;
    }).length;

  const listDitolak = list.filter(s =>
    ['ditolak', 'dibatalkan'].includes(String(s.status || '').toLowerCase())
  );
  const jumlahDitolak = listDitolak.length;
  let pesanDitolak = 'Belum ada surat yang ditolak';

  if (jumlahDitolak > 0) {
    const counts: Record<string, number> = {};
    listDitolak.forEach(s => {
      const p = s.perihal || 'Tanpa Perihal';
      counts[p] = (counts[p] || 0) + 1;
    });
    const palingSering = Object.entries(counts).reduce(
      (best, [k, v]) => (v > best[1] ? [k, v] : best), ['', 0]
    )[0];
    pesanDitolak = `"${palingSering}" sering ditolak`;
  }

  return {
    total_masuk:      list.filter(s => s.arah_surat === 'Surat Masuk').length,
    masuk_bulan_ini:  countMonth('Surat Masuk'),
    total_keluar:     list.filter(s => s.arah_surat === 'Surat Keluar').length,
    keluar_bulan_ini: countMonth('Surat Keluar'),
    pending: list.filter(s => ['Diproses', 'Diajukan', 'Pending'].includes(s.status)).length,
    ditolak: jumlahDitolak,
    pesanDitolak,
  };
});

const totalPages = computed(() =>
  Math.ceil(filteredSuratList.value.length / limit.value) || 1
);

const tableData = computed(() => {
  const start = (currentPage.value - 1) * limit.value;
  return filteredSuratList.value.slice(start, start + limit.value).map((item, i) => ({
    ...item,
    nomor_urut:   start + i + 1,
    nomor_surat:  item.nomor_surat || '-',
    created_at:   formatDate(item.tanggal_diterima),
    nama_pengaju: item.pengirim,
    perihal:      item.perihal,
    klasifikasi:  item.arah_surat,
    status:       item.status,
  }));
});

const fetchData = async () => {
  try {
    await antreanStore.fetchAntreanList();
    const suratKeluar = antreanStore.suratList.map((item: any) => ({
      ...item,
      arah_surat:      'Surat Keluar',
      tanggal_diterima: item.tanggal_pengajuan || item.created_at || '',
      pengirim:         item.nama_pengaju || '-',
      perihal:          item.perihal || item.template_nama || 'Tanpa Perihal',
      kategori_filter:  String(item.kategori || '').toUpperCase(),
    }));

    await suratMasukStore.fetchSuratMasukList();
    const suratMasuk = suratMasukStore.suratList.map((item: any) => ({
      ...item,
      arah_surat:      'Surat Masuk',
      nomor_surat:     item.nomor_surat_sistem || '-',
      tanggal_diterima: item.tanggal_terima || item.created_at || '',
      pengirim:         item.pengirim?.nama_instansi || item.instansi_pengirim || '-',
      perihal:          item.perihal || 'Tanpa Perihal',
      status:           item.status || 'Diajukan',
      kategori_filter:  String(item.kategori || item.bidang || item.tujuan || props.kategori).toUpperCase(),
    }));

    allSuratData.value = [...suratKeluar, ...suratMasuk];
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
  }
};

// ── Status helpers (mirrors ActivityLogListView) ─────────────────────────
const normalizeStatusValue = (raw?: string): string => {
  if (!raw) return ''
  const s = String(raw).trim().toLowerCase()
  if (['diajukan', 'pending', 'diproses', 'submitted'].includes(s)) return 'diajukan'
  if (['menunggu verifikasi kepsek', 'menunggu_verifikasi_kepsek',
       'menunggu verifikasi', 'waiting principal verification'].includes(s))
    return 'menunggu_verifikasi_kepsek'
  if (['verified', 'terverifikasi', 'disetujui', 'approved', 'selesai'].includes(s)) return 'disetujui'
  if (['rejected', 'ditolak'].includes(s)) return 'ditolak'
  if (['dibatalkan', 'cancelled', 'canceled'].includes(s)) return 'dibatalkan'
  if (['dihapus', 'terhapus', 'deleted'].includes(s)) return 'dihapus'
  return s
}

const formatStatusLabel = (raw?: string): string => {
  const n = normalizeStatusValue(raw)
  if (!n) return '-'
  const labels: Record<string, string> = {
    diajukan:                    'Diajukan',
    menunggu_verifikasi_kepsek:  'Menunggu Kepsek',
    disetujui:                   'Disetujui',
    ditolak:                     'Ditolak',
    dibatalkan:                  'Dibatalkan',
    dihapus:                     'Dihapus',
  }
  return labels[n] ?? n.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const getStatusChipVariant = (raw?: string): ChipVariant => {
  const n = normalizeStatusValue(raw)
  if (n === 'diajukan') return 'tertiary'
  if (n === 'menunggu_verifikasi_kepsek') return 'warning'
  if (n === 'disetujui') return 'primary'
  if (n === 'ditolak' || n === 'dibatalkan') return 'danger'
  if (n === 'dihapus') return 'deleted'
  return 'tertiary'
}
// ─────────────────────────────────────────────────────────────────────────

const resetFilters = () => {
  filters.value = { tanggal: '', status: '', klasifikasi: '' };
  searchQuery.value = '';
  currentPage.value = 1;
};

const handlePageChange = (page: number) => { currentPage.value = page; };

// Gradient badges — self-lit, work in both themes
const getStatusStyle = (status: string) => {
  const s = String(status || '').toLowerCase();
  let gradient = 'radial-gradient(77.91% 77.91% at 50% 100%, #FBBF24 4.91%, #B45309 100%)';
  if (s === 'disetujui' || s === 'selesai')
    gradient = 'radial-gradient(77.91% 77.91% at 50% 100%, #3F9760 4.91%, #0C4923 100%)';
  if (s === 'ditolak' || s === 'dibatalkan')
    gradient = 'radial-gradient(77.91% 77.91% at 50% 100%, #EF4444 4.91%, #991B1B 100%)';
  return {
    background: gradient,
    borderRadius: '20px',
    boxShadow: 'inset 0 -2px 0 0 rgba(0,0,0,0.40), inset 0 1px 0 0 rgba(248,250,252,0.40)',
    border: 'none',
  };
};

const goToDetail = (row: any) => {
  const kategori = row.klasifikasi === 'Surat Masuk' ? 'masuk' : 'keluar';
  const id = row.id_surat_masuk || row.id_surat;
  if (id) {
    router.push({ path: `/akademik/detail/${kategori}/${id}`, query: { urut: row.nomor_urut } });
  } else {
    console.error('ID tidak ditemukan!', row);
  }
};

const isDownloadable = (row: any) => {
  const s = String(row.status || '').toLowerCase();
  return ['disetujui', 'selesai', 'verified', 'approved'].includes(s) &&
    row.nomor_surat && row.nomor_surat !== '-';
};

const handleDownload = async (row: any) => {
  try {
    const id = row.id_surat_masuk || row.id_surat;
    const kategori = row.klasifikasi === 'Surat Masuk' ? 'masuk' : 'keluar';
    const endpoint = kategori === 'masuk'
      ? `/api/letters/surat-masuk/${id}/download`
      : `/api/letters/requests/${id}/download`;

    const response = await api.get(endpoint, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Surat_${kategori.toUpperCase()}_${id}.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error('Download error:', err);
    alert(err.response?.data?.error || 'Gagal mengunduh surat.');
  }
};

watch([filters, searchQuery], () => { currentPage.value = 1; }, { deep: true });
onMounted(fetchData);
</script>
