<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <div class="layout-bg min-h-full">
      <div class="main-content-wrapper">
        <div class="header-section mb-10">
          <div class="title-group">
            <h1 class="text-[24px] md:text-[28px] font-bold leading-[120%] text-[var(--app-heading)]">
              Form Pengajuan Surat Keluar
            </h1>
            <p class="text-[13px] md:text-[14px] leading-[145%] text-[var(--app-muted)] mt-1">
              Lengkapi form di bawah ini untuk mengajukan surat
            </p>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-6 w-full">
          <VInputField label="Pengaju Surat" :model-value="authStore.user?.nama || '-'" disabled />

          <div v-if="isWaliMurid" class="flex flex-col gap-2">
            <label class="hifi-label">Nama Siswa (Anak)</label>
            <VDropdown
              v-model="formData.id_siswa"
              :options="siswaOptions"
              placeholder="Pilih nama anak Anda..."
            />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div class="flex flex-col gap-2">
              <label class="hifi-label">Jenis Surat</label>
              <VDropdown
                v-model="formData.id_template"
                :options="templateOptions"
                placeholder="Pilih Jenis Surat..."
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="hifi-label">Klasifikasi Surat</label>
              <VDropdown
                v-model="formData.klasifikasi"
                :options="klasifikasiOptions"
                placeholder="Pilih Klasifikasi..."
              />
            </div>
          </div>

          <div
            v-if="dynamicFields.length > 0"
            class="flex flex-col gap-6 mt-2 border-t pt-6 border-dashed border-[var(--app-border)]"
          >
            <h3 class="font-bold text-[var(--app-accent)]">Informasi Tambahan Surat</h3>
            <div v-for="field in dynamicFields" :key="field" class="flex flex-col gap-2">
              <VInputField
                v-model="dynamicData[field]"
                :label="formatLabel(field)"
                :placeholder="'Masukkan ' + formatLabel(field).toLowerCase()"
              />
            </div>
          </div>

          <VButton class="hifi-btn-submit mt-4" :disabled="isSubmitting">
            {{ isSubmitting ? 'Mengirim...' : 'Ajukan Surat' }}
          </VButton>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/plugins/axios'
import type { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/users/auth'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VButton from '@/components/common/VButton.vue'
import { useSuratKeluarStore } from '@/stores/surat_keluar/index'

const authStore = useAuthStore()
const router = useRouter()

const currentRole = computed(() => String(authStore.role || '').toUpperCase())
const isWaliMurid = computed(() => currentRole.value === 'WALI_MURID')

interface Siswa {
  id_siswa: number
  nama: string
}
interface TemplateSurat {
  id_template: number
  nama_template: string
  parsed_variables: string[]
  allowed_roles: string[]
}
interface DynamicFormData {
  [key: string]: string
}

const listSiswa = ref<Siswa[]>([])
const listTemplate = ref<TemplateSurat[]>([])
const dynamicFields = ref<string[]>([])
const dynamicData = reactive<DynamicFormData>({})
const isSubmitting = ref(false)
const klasifikasiList = ['Biasa', 'Penting', 'Rahasia']

const formData = reactive({
  id_siswa: '' as string | number,
  id_template: '' as string | number,
  klasifikasi: '',
})

const suratKeluarStore = useSuratKeluarStore()

const siswaOptions = computed(() =>
  listSiswa.value.map((siswa) => ({
    label: siswa.nama,
    value: siswa.id_siswa,
  })),
)

const templateOptions = computed(() =>
  listTemplate.value.map((t) => ({
    label: t.nama_template,
    value: t.id_template,
  })),
)

const klasifikasiOptions = computed(() =>
  klasifikasiList.map((k) => ({
    label: k,
    value: k,
  })),
)

const hasEmptyDynamicField = computed(() =>
  dynamicFields.value.some((field) => !String(dynamicData[field] ?? '').trim()),
)

const handleSubmit = async () => {
  if (
    !formData.id_template ||
    !formData.klasifikasi ||
    (isWaliMurid.value && !formData.id_siswa) ||
    hasEmptyDynamicField.value
  ) {
    suratKeluarStore.triggerAlert('Gagal', 'Mohon lengkapi semua field wajib.', 'error')
    return
  }

  isSubmitting.value = true
  try {
    const payload = {
      template: Number(formData.id_template),
      siswa: isWaliMurid.value ? Number(formData.id_siswa) : null,
      klasifikasi: formData.klasifikasi,
      form_data: { ...dynamicData },
    }

    await api.post('/api/letters/requests', payload)

    suratKeluarStore.triggerAlert('Berhasil', 'Pengajuan berhasil!', 'success')
    router.push('/surat-keluar/riwayat')
  } catch (error: unknown) {
    const apiError = error as AxiosError
    if (apiError.response?.status === 400) {
      suratKeluarStore.triggerAlert('Gagal', 'Cek kembali isian form Anda.', 'error')
    }
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => formData.id_template,
  (newId) => {
    dynamicFields.value = []
    Object.keys(dynamicData).forEach((key) => delete dynamicData[key])

    if (newId) {
      const selected = listTemplate.value.find((t) => Number(t.id_template) === Number(newId))
      if (selected && selected.parsed_variables) {
        dynamicFields.value = selected.parsed_variables
        selected.parsed_variables.forEach((field) => {
          dynamicData[field] = ''
        })
      }
    }
  },
)

const formatLabel = (str: string) =>
  str
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const fetchInitialData = async () => {
  try {
    const templateRes = await api.get('/api/letter_templates/')

    if (isWaliMurid.value) {
      const siswaRes = await api.get('/api/siswa/')
      listSiswa.value = siswaRes?.data?.data || []
    } else {
      listSiswa.value = []
      formData.id_siswa = ''
    }

    listTemplate.value = templateRes?.data?.data || []
  } catch (error) {
    console.error('Gagal mengambil data awal:', error)
  }
}

onMounted(fetchInitialData)
</script>

<style scoped>
.main-content-wrapper {
  padding: 40px 60px;
  max-width: 1440px;
}

.layout-bg {
  background: var(--app-bg);
  color: var(--app-text);
}

.hifi-label {
  font-weight: 700;
  font-size: 16px;
  color: var(--app-heading);
}

.hifi-input-readonly {
  width: 100%;
  border-radius: 12px;
  background-color: var(--app-input-disabled-bg);
  border: 1.5px solid var(--app-input-border);
  padding: 14px 16px;
  font-weight: 600;
  color: var(--app-muted);
  cursor: not-allowed;
}

.hifi-input-white,
.hifi-select-white {
  width: 100%;
  border-radius: 12px;
  background-color: var(--app-input-bg);
  border: 1.5px solid var(--app-input-border);
  padding: 14px 16px;
  font-size: 16px;
  font-weight: 600;
  color: var(--app-text);
  outline: none;
}

.hifi-input-white:focus {
  border-color: var(--app-input-focus-border);
}

.hifi-select-gradient {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  color: var(--app-text-inverse);
  font-weight: 700;
  padding: 0 16px;
  appearance: none;
  cursor: pointer;
  background: var(--app-accent);
  z-index: 10;
}

.hifi-chevron {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--app-muted);
  pointer-events: none;
}

.hifi-chevron-white {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--app-text-inverse);
  pointer-events: none;
  z-index: 20;
}

.hifi-btn-submit {
  width: 100%;
  height: 56px;
  border-radius: 20px;
  color: var(--app-text-inverse);
  font-weight: 700;
  border: none;
  cursor: pointer;
  background: var(--app-accent);
  transition: transform 0.1s;
}

.hifi-btn-submit:active {
  transform: scale(0.98);
}
</style>