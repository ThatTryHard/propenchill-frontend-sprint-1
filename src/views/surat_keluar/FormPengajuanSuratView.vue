<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main class="flex-1 overflow-y-auto layout-bg">
      <div class="main-content-wrapper">
        <div class="header-section mb-10">
          <div class="title-group">
            <h1 class="text-[24px] md:text-[28px] font-bold leading-[120%] text-[#111827]">
              Form Pengajuan Surat Keluar
            </h1>
            <p class="text-[13px] md:text-[14px] leading-[145%] text-[#858a91] mt-1">
              Lengkapi form di bawah ini untuk mengajukan surat
            </p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-6 w-full">
          <div class="flex flex-col gap-2">
            <label class="hifi-label">Pengaju Surat</label>
            <div class="relative w-full">
              <input type="text" :value="authStore.user?.nama" readonly class="hifi-input-readonly" />
              <Lock :size="20" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9FA5]" />
            </div>
          </div>

          <div v-if="isWaliMurid" class="flex flex-col gap-2">
            <label class="hifi-label">Nama Siswa (Anak)</label>
            <div class="relative w-full">
              <select v-model="formData.id_siswa" :required="isWaliMurid" class="hifi-select-white">
                <option value="" disabled>Pilih nama anak Anda...</option>
                <option v-for="siswa in listSiswa" :key="siswa.id_siswa" :value="siswa.id_siswa">
                  {{ siswa.nama }}
                </option>
              </select>
              <ChevronDown :size="20" class="hifi-chevron" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div class="flex flex-col gap-2">
              <label class="hifi-label">Jenis Surat</label>
              <div class="relative w-full h-[52px]">
                <select v-model="formData.id_template" required class="hifi-select-gradient">
                  <option value="" disabled class="bg-white text-black">Pilih Jenis Surat...</option>
                  <option v-for="t in listTemplate" :key="t.id_template" :value="t.id_template" class="bg-white text-black">
                    {{ t.nama_template }}
                  </option>
                </select>
                <ChevronDown :size="20" class="hifi-chevron-white" />
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <label class="hifi-label">Klasifikasi Surat</label>
              <div class="relative w-full h-[52px]">
                <select v-model="formData.klasifikasi" required class="hifi-select-gradient">
                  <option value="" disabled class="bg-white text-black">Pilih Klasifikasi...</option>
                  <option v-for="k in klasifikasiList" :key="k" :value="k" class="bg-white text-black">
                    {{ k }}
                  </option>
                </select>
                <ChevronDown :size="20" class="hifi-chevron-white" />
              </div>
            </div>
          </div>

          <div v-if="dynamicFields.length > 0" class="flex flex-col gap-6 mt-2 border-t pt-6 border-dashed border-[#CBD5E1]">
            <h3 class="font-bold text-[#185F3B]">Informasi Tambahan Surat</h3>
            <div v-for="field in dynamicFields" :key="field" class="flex flex-col gap-2">
              <label class="hifi-label">{{ formatLabel(field) }}</label>
              <input 
                type="text" 
                v-model="dynamicData[field]" 
                :placeholder="'Masukkan ' + formatLabel(field).toLowerCase()"
                required
                class="hifi-input-white" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            :disabled="isSubmitting" 
            class="hifi-btn-submit mt-4"
            @click.prevent="handleSubmit"
          >
            {{ isSubmitting ? 'Mengirim...' : 'Ajukan Surat' }}
          </button>
        </form>
      </div>
    </main>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/plugins/axios';
import { useAuthStore } from '@/stores/users/auth';
import DashboardLayout from '@/components/common/DashboardLayout.vue';
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue';
import { ChevronDown, Lock } from 'lucide-vue-next';
import { useSuratKeluarStore } from '@/stores/surat_keluar/index';

const authStore = useAuthStore();
const router = useRouter();

const currentRole = computed(() => String(authStore.role || '').toUpperCase());
const isWaliMurid = computed(() => currentRole.value === 'WALI_MURID');

interface Siswa { id_siswa: number; nama: string; }
interface TemplateSurat { 
  id_template: number; 
  nama_template: string; 
  parsed_variables: string[]; 
  allowed_roles: string[]; 
}
interface DynamicFormData { [key: string]: string; }

const listSiswa = ref<Siswa[]>([]);
const listTemplate = ref<TemplateSurat[]>([]);
const dynamicFields = ref<string[]>([]);
const dynamicData = reactive<DynamicFormData>({});
const isSubmitting = ref(false);
const klasifikasiList = ['Biasa', 'Penting', 'Rahasia'];

const formData = reactive({
  id_siswa: '' as string | number,
  id_template: '' as string | number,
  klasifikasi: '',
});

const suratKeluarStore = useSuratKeluarStore()

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const payload = {
      template: formData.id_template, 
      siswa: isWaliMurid.value ? Number(formData.id_siswa) : null,
      klasifikasi: formData.klasifikasi,
      form_data: { ...dynamicData } 
    };

    await api.post('/api/letters/requests', payload);
    
    suratKeluarStore.triggerAlert('Berhasil', 'Pengajuan berhasil!', 'success');
    router.push('/surat-keluar/riwayat');
  } catch (error: any) {
    if (error.response?.status === 400) {
      suratKeluarStore.triggerAlert('Gagal', 'Cek kembali isian form Anda.', 'error');
    }
  } finally {
    isSubmitting.value = false;
  }
};

watch(() => formData.id_template, (newId) => {
  dynamicFields.value = [];
  Object.keys(dynamicData).forEach(key => delete dynamicData[key]);
  
  if (newId) {
    const selected = listTemplate.value.find(t => Number(t.id_template) === Number(newId));
    if (selected && selected.parsed_variables) {
      dynamicFields.value = selected.parsed_variables;
      selected.parsed_variables.forEach(field => {
        dynamicData[field] = ''; 
      });
    }
  }
});

const formatLabel = (str: string) => str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const fetchInitialData = async () => {
  try {
    const templateRes = await api.get('/api/letter_templates/');

    if (isWaliMurid.value) {
      const siswaRes = await api.get('/api/siswa/');
      listSiswa.value = siswaRes?.data?.data || [];
    } else {
      listSiswa.value = [];
      formData.id_siswa = '';
    }

    listTemplate.value = templateRes?.data?.data || []; 

  } catch (error) {
    console.error("Gagal mengambil data awal:", error);
  }
};

onMounted(fetchInitialData);
</script>

<style scoped>
.main-content-wrapper { padding: 40px 60px; max-width: 1440px; }
.layout-bg {
  background: var(--Gradient-Primary-Background, linear-gradient(180deg, #FFF 0%, #EAF7EF 100%));
}

.hifi-label { font-weight: 700; font-size: 16px; color: #111827; }
.hifi-input-readonly { width: 100%; border-radius: 12px; background-color: #F8FAFC; border: 1.5px solid #CBD5E1; padding: 14px 16px; font-weight: 600; color: #9B9FA5; cursor: not-allowed; }
.hifi-input-white, .hifi-select-white { width: 100%; border-radius: 12px; background-color: white; border: 1.5px solid #CBD5E1; padding: 14px 16px; font-size: 16px; font-weight: 600; outline: none; }
.hifi-input-white:focus { border-color: #185F3B; }
.hifi-select-gradient { position: absolute; inset: 0; width: 100%; height: 100%; border-radius: 12px; color: white; font-weight: 700; padding: 0 16px; appearance: none; cursor: pointer; background: var(--gradient-gradient-10, linear-gradient(91deg, #3F9760 0%, #D1955F 100%)); z-index: 10; }
.hifi-chevron { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: #6B7280; pointer-events: none; }
.hifi-chevron-white { position: absolute; right: 16px; top: 50%; transform: translateY(-50%); color: white; pointer-events: none; z-index: 20; }
.hifi-btn-submit { width: 100%; height: 56px; border-radius: 20px; color: white; font-weight: 700; border: none; cursor: pointer; background: radial-gradient(77.91% 77.91% at 50% 100%, #3F9760 4.91%, #0C4923 100%); box-shadow: 0 -2px 0 0 rgba(0, 0, 0, 0.40) inset, 0 1px 0 0 rgba(248, 250, 252, 0.40) inset; transition: transform 0.1s; }
.hifi-btn-submit:active { transform: scale(0.98); }
</style>