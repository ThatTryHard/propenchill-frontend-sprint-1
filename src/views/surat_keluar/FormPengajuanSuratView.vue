<template>
  <form @submit.prevent="submitForm" class="flex flex-col gap-6">
    <div class="flex flex-col gap-2">
      <label class="font-bold text-[16px] text-[#111827]">Pengaju Surat</label>
      <div class="relative w-full">
        <input type="text" :value="authStore.user?.nama" readonly class="w-full rounded-[12px] bg-[#F8FAFC] border-[1.5px] border-[#CBD5E1] py-[14px] px-[16px] text-[#9B9FA5] font-semibold outline-none cursor-not-allowed" />
        <Lock :size="20" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#9B9FA5]" />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <label class="font-bold text-[16px] text-[#111827]">Nama Siswa (Anak)</label>
      <div class="relative w-full">
        <select v-model="formData.siswa_id" required class="w-full rounded-[12px] bg-white border-[1.5px] border-[#CBD5E1] py-[14px] px-[16px] appearance-none outline-none focus:border-[#185F3B] font-semibold">
          <option value="" disabled>Pilih nama anak Anda...</option>
          <option v-for="siswa in listSiswa" :key="siswa.id_siswa" :value="siswa.id_siswa">{{ siswa.nama }}</option>
        </select>
        <ChevronDown :size="20" class="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] pointer-events-none" />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <div class="flex flex-col gap-2">
        <label class="font-bold text-[16px] text-[#111827]">Jenis Surat</label>
        <div class="relative w-full h-[52px]">
          <select v-model="formData.template_id" required class="absolute inset-0 w-full h-full rounded-[12px] text-white font-bold px-[16px] appearance-none outline-none cursor-pointer z-10 bg-transparent border-none" style="background: radial-gradient(77.91% 77.91% at 50% 100%, #3F9760 4.91%, #0C4923 100%);">
            <option value="" disabled class="bg-white text-black">Pilih Jenis Surat...</option>
            <option v-for="t in listTemplate" :key="t.id_template" :value="t.id_template" class="bg-white text-black">{{ t.nama_template }}</option>
          </select>
          <ChevronDown :size="20" class="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none z-20" />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label class="font-bold text-[16px] text-[#111827]">Klasifikasi Surat</label>
        <div class="relative w-full h-[52px]">
          <select v-model="formData.klasifikasi" required class="absolute inset-0 w-full h-full rounded-[12px] text-white font-bold px-[16px] appearance-none outline-none cursor-pointer z-10 bg-transparent border-none" style="background: radial-gradient(77.91% 77.91% at 50% 100%, #3F9760 4.91%, #0C4923 100%);">
            <option value="" disabled class="bg-white text-black">Pilih Klasifikasi...</option>
            <option v-for="k in klasifikasiList" :key="k" :value="k" class="bg-white text-black">{{ k }}</option>
          </select>
          <ChevronDown :size="20" class="absolute right-4 top-1/2 -translate-y-1/2 text-white pointer-events-none z-20" />
        </div>
      </div>
    </div>

    <div v-if="dynamicFields.length > 0" class="flex flex-col gap-6 mt-2 w-full">
      <div v-for="field in dynamicFields" :key="field" class="flex flex-col gap-2">
        <label class="font-bold text-[16px] text-[#111827]">{{ formatLabel(field) }}</label>
        <input type="text" v-model="dynamicData[field]" :placeholder="'Masukkan ' + formatLabel(field).toLowerCase()" required class="w-full rounded-[12px] bg-white border-[1.5px] border-[#CBD5E1] py-[14px] px-[16px] text-[16px] font-semibold outline-none focus:border-[#185F3B]" />
      </div>
    </div>

    <button type="submit" :disabled="isSubmitting" class="mt-4 w-full h-[56px] rounded-[20px] text-white font-bold text-[16px] flex items-center justify-center transition-transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed" style="background: radial-gradient(77.91% 77.91% at 50% 100%, #3F9760 4.91%, #0C4923 100%); box-shadow: 0 -2px 0 0 rgba(0, 0, 0, 0.40) inset, 0 1px 0 0 rgba(248, 250, 252, 0.40) inset;">
      {{ isSubmitting ? 'Mengirim...' : 'Ajukan Surat' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/plugins/axios';
import { useAuthStore } from '@/stores/users/auth';
import VSidebar from '@/components/common/VSidebar.vue';
import { LayoutGrid, Mail, Settings, HelpCircle, LogOut, ChevronDown, Lock, PlusCircle } from 'lucide-vue-next';

interface Siswa {
  id_siswa: number; 
  nama: string;
}

interface TemplateSurat {
  id_template: number; 
  nama_template: string;
  parsed_variables: string[];
}

interface DynamicFormData {
  [key: string]: string; 
}

const authStore = useAuthStore();
const router = useRouter();

const navItems = [
  { name: 'surat-keluar', label: 'Daftar Pengajuan Surat Keluar', path: '/surat-keluar/riwayat', icon: LayoutGrid },
  { name: 'buat-pengajuan', label: 'Buat Pengajuan Surat', path: '/surat-keluar/pengajuan', icon: PlusCircle },
];

const handleLogout = () => { authStore.logout(); router.push('/login'); };
const bottomItems = [
  { name: 'settings', label: 'Settings', icon: Settings },
  { name: 'help', label: 'Help', icon: HelpCircle },
  { name: 'logout', label: 'Log Out', icon: LogOut, action: handleLogout }
];

const isSubmitting = ref(false);
const klasifikasiList = ['Biasa', 'Penting', 'Rahasia'];

const listSiswa = ref<Siswa[]>([]); 
const listTemplate = ref<TemplateSurat[]>([]);
const dynamicFields = ref<string[]>([]);
const dynamicData = reactive<DynamicFormData>({});

const formData = reactive({
  siswa_id: '' as string | number, 
  template_id: '' as string | number,
  klasifikasi: '',
});

watch(() => formData.template_id, (newId) => {
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

const formatLabel = (str: string) => {
  return str.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const fetchInitialData = async () => {
  try {
    const [siswaRes, templateRes] = await Promise.all([
      api.get('/api/siswa/'),
      api.get('/api/letter_templates/')
    ]);
    listSiswa.value = siswaRes?.data?.data || [];
    listTemplate.value = templateRes?.data || [];
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  } finally {
    if (listSiswa.value.length === 1) {
      formData.siswa_id = listSiswa.value[0]?.id_siswa ?? ''; 
    }
  }
};

const submitForm = async () => {
  isSubmitting.value = true;
  try {
    const payload = {
      id_template: formData.template_id,
      form_data: {
        id_siswa: formData.siswa_id,
        klasifikasi: formData.klasifikasi,
        ...dynamicData
      }
    };
    await api.post('/api/letters/requests/', payload);
    alert('Pengajuan berhasil!');
    router.push('/surat-keluar/riwayat');
  } catch (error: any) { 
    alert(error?.response?.data?.error || 'Gagal mengirim pengajuan.');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(fetchInitialData);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
</style>