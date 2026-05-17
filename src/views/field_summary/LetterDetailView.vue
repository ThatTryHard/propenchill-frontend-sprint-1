<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <div class="p-8 font-['Plus_Jakarta_Sans'] bg-[var(--app-bg)] min-h-screen">
      <div class="mb-8">
        <p class="text-[length:var(--app-font-sm)] text-[var(--app-muted)] font-medium">
          Dashboard Ringkasan Surat Bidang Akademik >
          <span class="text-[var(--app-text)] font-bold">Detail Informasi Surat</span>
        </p>
      </div>

      <div class="bg-[var(--app-card)] rounded-[24px] border border-[var(--app-card-border)] shadow-sm p-8">
        <div class="mb-10">
          <h1 class="text-[length:var(--app-page-title-font)] font-bold text-[var(--app-text)]">Detail Informasi Surat</h1>
          <p class="text-[length:var(--app-font-sm)] text-[var(--app-muted)]">Berikut detail informasi surat</p>
        </div>

        <div class="flex justify-between items-start mb-12">
            <div class="flex items-center gap-5">
                <div
                class="w-[64px] h-[64px] flex items-center justify-center flex-shrink-0"
                style="border-radius: 10px; background: linear-gradient(91deg, var(--app-accent) 0%, var(--app-accent-2) 100%);"
                >
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <path d="M23.3334 3.33326L10.0001 3.33326C9.11603 3.33326 8.26818 3.68445 7.64306 4.30957C7.01794 4.93469 6.66675 5.78254 6.66675 6.66659L6.66675 33.3333C6.66675 34.2173 7.01794 35.0652 7.64306 35.6903C8.26818 36.3154 9.11603 36.6666 10.0001 36.6666H30.0001C30.8841 36.6666 31.732 36.3154 32.3571 35.6903C32.9822 35.0652 33.3334 34.2173 33.3334 33.3333V13.3333M23.3334 3.33326C23.861 3.3324 24.3836 3.43593 24.871 3.63787C25.3584 3.83982 25.801 4.13619 26.1734 4.50992L32.1534 10.4899C32.5281 10.8624 32.8254 11.3055 33.0279 11.7935C33.2304 12.2816 33.3334 12.8049 33.3334 13.3333M23.3334 3.33326V11.6666C23.3334 12.1086 23.509 12.5325 23.8216 12.8451C24.1341 13.1577 24.5581 13.3333 25.0001 13.3333L33.3334 13.3333M16.6667 14.9999H13.3334M26.6667 21.6666H13.3334M26.6667 28.3333H13.3334" stroke="var(--app-text-inverse)" stroke-width="3.33333" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                </div>

                <div>
                <h2 class="mb-1 text-[length:var(--app-font-title)] font-extrabold leading-tight text-[var(--app-text)]">
                    {{ letterData.perihal }}
                </h2>
                <p class="text-[length:var(--app-font-lg)] font-bold text-[var(--app-muted)]">ID: {{ letterData.id_surat }}</p>
                </div>
            </div>

            <div
              class="inline-block min-w-[120px] rounded-[20px] px-8 py-2.5 text-center text-[length:var(--app-font-sm)] font-bold text-[var(--app-text-inverse)]"
                :style="getStatusStyle(letterData.status)"
            >
                {{ letterData.status }}
            </div>
            </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-20">
          <div class="space-y-10">
            <div>
              <p class="mb-1 text-[length:var(--app-font-sm)] font-bold text-[var(--app-text)]">No. Urut Tabel</p>
              <p class="text-[length:var(--app-font-md)] font-medium text-[var(--app-muted)]">{{ letterData.nomor_agenda }}</p>
            </div>
            <div>
              <p class="mb-1 text-[length:var(--app-font-sm)] font-bold text-[var(--app-text)]">Nomor Surat</p>
              <p class="text-[length:var(--app-font-md)] font-medium text-[var(--app-muted)]">{{ letterData.nomor_surat }}</p>
            </div>
          </div>

          <div class="space-y-10">
            <div>
              <p class="mb-1 text-[length:var(--app-font-sm)] font-bold text-[var(--app-text)]">Pengirim</p>
              <p class="text-[length:var(--app-font-md)] font-medium text-[var(--app-muted)]">{{ letterData.pengirim }}</p>
            </div>
            <div>
              <p class="mb-1 text-[length:var(--app-font-sm)] font-bold text-[var(--app-text)]">Tanggal Terima</p>
              <p class="text-[length:var(--app-font-md)] font-medium text-[var(--app-muted)]">{{ letterData.tanggal_terima }}</p>
            </div>
          </div>

          <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-20">
             <div>
                <p class="mb-1 text-[length:var(--app-font-sm)] font-bold text-[var(--app-text)]">Perihal</p>
                <p class="text-[length:var(--app-font-md)] font-medium text-[var(--app-muted)]">{{ letterData.perihal_detail }}</p>
             </div>
             <div>
                <p class="mb-1 text-[length:var(--app-font-sm)] font-bold text-[var(--app-text)]">Klasifikasi Surat</p>
                <p class="text-[length:var(--app-font-md)] font-medium text-[var(--app-muted)]">{{ letterData.klasifikasi }}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSuratAntreanStore } from '@/stores/surat_antrean';
import { useSuratMasukStore } from '@/stores/surat-masuk';
import DashboardLayout from '@/components/common/DashboardLayout.vue';
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue';

const route = useRoute();
const antreanStore = useSuratAntreanStore();
const suratMasukStore = useSuratMasukStore();

const letterData = ref({
  id_surat: '-',
  perihal: 'Memuat...',
  status: '...',
  nomor_agenda: '-',
  nomor_surat: '-',
  pengirim: '-',
  tanggal_terima: '-',
  perihal_detail: '-',
  klasifikasi: '-'
});

function formatDate(value: string) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const fetchDetail = async () => {
  const id = Number(route.params.id);
  const kategori = route.params.kategori;

  const urut = route.query.urut;

  try {
    letterData.value.perihal = 'Memuat...';

    await Promise.all([
      antreanStore.suratList.length === 0 ? antreanStore.fetchAntreanList() : Promise.resolve(),
      suratMasukStore.suratList.length === 0 ? suratMasukStore.fetchSuratMasukList() : Promise.resolve()
    ]);

    let dataFound = null;

    if (kategori === 'keluar') {
      dataFound = antreanStore.suratList.find(s => Number(s.id_surat) === id);
      if (dataFound) {
        letterData.value = {
          id_surat: String(dataFound.id_surat),
          perihal: String(dataFound.perihal || dataFound.template_nama || 'Tanpa Perihal'),
          status: String(dataFound.status || 'Diproses'),
          nomor_agenda: urut ? String(urut) : String(dataFound.id_surat),
          nomor_surat: String(dataFound.nomor_surat || '-'),
          pengirim: String(dataFound.nama_pengaju || '-'),
          tanggal_terima: formatDate(dataFound.tanggal_pengajuan || dataFound.created_at || ''),
          perihal_detail: String(dataFound.perihal || dataFound.template_nama || 'Tanpa Perihal'),
          klasifikasi: 'Surat Keluar'
        };
      }
    } else {
      dataFound = suratMasukStore.suratList.find((s: any) => Number(s.id_surat_masuk) === id);
      if (dataFound) {
        letterData.value = {
          id_surat: String(dataFound.id_surat_masuk),
          perihal: dataFound.perihal || 'Tanpa Perihal',
          status: dataFound.status || 'Diajukan',
          nomor_agenda: urut ? String(urut) : String(dataFound.id_surat_masuk),
          nomor_surat: dataFound.nomor_surat_sistem || '-',
          pengirim: dataFound.pengirim?.nama_instansi || '-',
          tanggal_terima: formatDate(dataFound.tanggal_terima || dataFound.created_at || ''),
          perihal_detail: dataFound.perihal || 'Tanpa Perihal',
          klasifikasi: 'Surat Masuk'
        };
      }
    }

    if (!dataFound) {
       letterData.value.perihal = 'Data Tidak Ditemukan';
    }

  } catch (error) {
    console.error("Gagal ambil detail:", error);
    letterData.value.perihal = 'Error Mengambil Data';
  }
};

const getStatusStyle = (status: string) => {
  const styles: Record<string, string> = {
    green: 'radial-gradient(77.91% 77.91% at 50% 100%, var(--app-success) 4.91%, color-mix(in srgb, var(--app-success) 68%, #000 32%) 100%)',
    red: 'radial-gradient(77.91% 77.91% at 50% 100%, var(--app-danger) 4.91%, color-mix(in srgb, var(--app-danger) 68%, #000 32%) 100%)',
    yellow: 'radial-gradient(77.91% 77.91% at 50% 100%, var(--app-warning) 4.91%, color-mix(in srgb, var(--app-warning) 68%, #000 32%) 100%)',
  };

  const s = String(status || '').toLowerCase();
  let selectedGradient = styles.yellow;
  let textColor = 'var(--app-text-inverse)';

  if (s === 'disetujui' || s === 'selesai') {
    selectedGradient = styles.green;
  } else if (s === 'ditolak' || s === 'dibatalkan') {
    selectedGradient = styles.red;
  }

  return {
    background: selectedGradient,
    borderRadius: '20px',
    boxShadow: 'inset 0 -2px 0 0 rgba(0, 0, 0, 0.40), inset 0 1px 0 0 rgba(255, 255, 255, 0.40)',
    border: 'none',
    color: textColor,
    fontSize: '14px',
    padding: '10px 30px'
  };
};

onMounted(fetchDetail);
</script>
