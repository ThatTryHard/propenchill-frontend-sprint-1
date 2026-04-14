<template>
  <div class="flex min-h-screen bg-[#f8fafc]">
    <VSidebar
      :navItems="navItems"
      :bottomItems="bottomItems"
      :userName="authStore.user?.nama"
      :userEmail="authStore.user?.email"
    />

    <main class="flex-1 overflow-y-auto bg-[#f8fafc]">
      <div class="page-container">
        <div class="page-header">
          <h1 class="page-title">Detail Surat Keluar</h1>
          <p class="page-subtitle">Berikut detail surat keluar</p>
        </div>

        <div class="content-wrapper">
          <div class="card">
            <div class="card-header">
              <div class="header-left">
                <div class="icon-box">
                  <FileText class="icon-white" />
                </div>
                <div>
                  <h2 class="card-title">{{ detail.template_nama || '-' }}</h2>
                  <p class="card-id">ID: {{ detail.id_pengajuan || '-' }}</p>
                </div>
              </div>
              <div class="status-chip" :class="getStatusClass(detail.status)">
                {{ detail.status || 'Tidak tersedia' }}
              </div>
            </div>

            <div class="info-grid three-cols">
              <div class="info-block">
                <div class="info-label">Nomor Surat</div>
                <div class="info-value">{{ detail.nomor_surat || '-' }}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Tanggal Pengajuan</div>
                <div class="info-value">{{ formatDate(detail.tanggal_pengajuan) }}</div>
              </div>
              <div class="info-block">
                <div class="info-label">Pengaju</div>
                <div class="info-value">{{ detail.siswa_nama || '-' }}</div>
              </div>
            </div>
          </div>
          </div>

        <div class="actions-row">
          <button class="btn-secondary" @click="$router.push('/surat-keluar/riwayat')">Kembali</button>
          <button v-if="detail.status === 'Pending'" class="btn-danger" @click="showCancelDialog = true">
            Batalkan Pengajuan
          </button>
        </div>
      </div>
    </main>
    <div v-if="showCancelDialog" class="modal-overlay">
       </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/plugins/axios';
import { useAuthStore } from '@/stores/users/auth'; 
import VSidebar from '@/components/common/VSidebar.vue'; 
import { 
  FileText, 
  ClipboardList, 
  CheckCircle,
  LayoutGrid, 
  Mail,       
  Settings,
  HelpCircle,
  LogOut 
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore(); 

const navItems = [
  { 
    name: 'surat-keluar', 
    label: 'Daftar Pengajuan Surat Keluar', 
    path: '/surat-keluar/riwayat', 
    icon: LayoutGrid 
  },
  { 
    name: 'surat-masuk', 
    label: 'Daftar Pengajuan Surat Masuk', 
    path: '/surat-masuk/riwayat', 
    icon: Mail 
  },
];

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

const bottomItems = [
  { name: 'settings', label: 'Settings', icon: Settings },
  { name: 'help', label: 'Help', icon: HelpCircle },
  { name: 'logout', label: 'Log Out', icon: LogOut, action: handleLogout },
];

const detail = ref({ form_data: {}, tracking_status: [] });
const showCancelDialog = ref(false);
const isCancelling = ref(false);

const fetchDetail = async () => {
  try {
    const response = await api.get(`/api/letters/requests/${route.params.id}`);
    detail.value = response.data;
  } catch (error) {
    try {
      const listResponse = await api.get('/api/letters/my-requests');
      const found = listResponse.data.find((item) => item.id_pengajuan == route.params.id);
      if (found) detail.value = found;
    } catch (nestedError) {
      console.error(nestedError);
    }
  }
};

const cancelRequest = async () => {
  isCancelling.value = true;
  try {
    const response = await api.put(`/api/letters/requests/${detail.value.id_pengajuan}/cancel`);
    if (response.status === 200) {
      detail.value.status = 'Dibatalkan';
      detail.value.tracking_status = [
        {
          status: 'Dibatalkan',
          aktivitas: 'Pengajuan dibatalkan oleh pengguna',
          waktu: new Date().toISOString()
        },
        ...(detail.value.tracking_status || [])
      ];
      showCancelDialog.value = false;
      alert('Pengajuan berhasil dibatalkan');
    }
  } catch (error) {
    alert(error.response?.data?.error || 'Gagal membatalkan surat');
  } finally {
    isCancelling.value = false;
  }
};

// Styling disesuaikan dengan warna hi-fi
const getStatusClass = (status) => {
  if (status === 'Pending') return 'status-pending';
  if (status === 'Selesai' || status === 'Disetujui') return 'status-success';
  if (status === 'Dibatalkan' || status === 'Ditolak') return 'status-danger';
  return 'status-default';
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
const formatDateTime = (d) => d ? new Date(d).toLocaleString('id-ID') : '-';

onMounted(fetchDetail);
</script>

<style scoped>
.page-container {
  max-width: 1000px;
  margin: 0; 
  padding: 32px 48px; 
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* CARDS STYLING */
.card {
  background: #f8fafc;
  border-radius: 20px;
  padding: 32px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mb-24 {
  margin-bottom: 24px;
}

/* ICONS & GRADIENT */
.icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #4f9e6d 0%, #bd8c5e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-white {
  color: white;
  width: 26px;
  height: 26px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.card-id {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* STATUS CHIP */
.status-chip {
  padding: 8px 16px;
  border-radius: 99px;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.status-success {
  background-color: #185f3b;
  color: #ffffff;
}

.status-pending {
  background-color: #f59e0b;
  color: #ffffff;
}

.status-danger {
  background-color: #ef4444;
  color: #ffffff;
}

.status-default {
  background-color: #e2e8f0;
  color: #475569;
}

/* CONTENT GRIDS */
.info-grid {
  display: grid;
  gap: 24px;
}

.info-grid.three-cols {
  grid-template-columns: repeat(3, 1fr);
}

.info-grid.single-col {
  grid-template-columns: 1fr;
  gap: 20px;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: #0f172a;
  font-weight: 600;
  line-height: 1.5;
}

/* TIMELINE STYLING */
.timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-item {
  display: flex;
  gap: 20px;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
}

.marker-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f9e6d 0%, #bd8c5e 100%);
  margin-top: 4px;
}

.marker-line {
  width: 2px;
  flex: 1;
  background-color: #cbd5e1;
  margin: 4px 0;
  min-height: 30px;
}

.timeline-content {
  flex: 1;
  padding-bottom: 24px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
}

.timeline-status {
  font-weight: 700;
  color: #0f172a;
  font-size: 15px;
}

.timeline-time {
  font-size: 13px;
  color: #64748b;
}

.timeline-desc {
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
}

.history-empty {
  color: #64748b;
  font-style: italic;
}

/* BUTTONS */
.actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
}

.btn-secondary,
.btn-danger {
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  border: none;
  transition: transform 0.2s, opacity 0.2s;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #334155;
}

.btn-danger {
  background-color: #ef4444;
  color: #ffffff;
}

.btn-secondary:hover,
.btn-danger:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: grid;
  place-items: center;
  z-index: 100;
}

.modal-card {
  width: min(400px, calc(100% - 32px));
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px;
}

.modal-text {
  color: #475569;
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 24px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .info-grid.three-cols {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 16px;
  }
}
</style>