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
        <header class="mb-10">
          <div class="min-w-0">
            <h1
              class="
                m-0 text-[length:var(--app-page-title-font)]
                font-bold leading-[1.2] text-[var(--app-heading)]
              "
            >
              Form Pengajuan Surat Keluar
            </h1>

            <p
              class="
                mt-1 mb-0 text-[length:var(--app-page-subtitle-font)]
                font-medium leading-[1.45] text-[var(--app-muted)]
              "
            >
              Lengkapi form di bawah ini untuk mengajukan surat
            </p>
          </div>
        </header>

        <form
          class="flex w-full flex-col gap-6"
          @submit.prevent="handleSubmit"
        >
          <VInputField
            label="Pengaju Surat"
            :model-value="authStore.user?.nama || '-'"
            disabled
          />

          <div
            v-if="isWaliMurid"
            class="flex flex-col gap-2"
          >
            <label
              class="
                text-[length:var(--app-input-label-font)]
                font-semibold leading-[1.2] text-[var(--app-heading)]
              "
            >
              Nama Siswa (Anak)
            </label>

            <VDropdown
              v-model="formData.id_siswa"
              :options="siswaOptions"
              placeholder="Pilih nama anak Anda..."
            />
          </div>

          <div class="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label
                class="
                  text-[length:var(--app-input-label-font)]
                  font-semibold leading-[1.2] text-[var(--app-heading)]
                "
              >
                Jenis Surat
              </label>

              <VDropdown
                v-model="formData.id_template"
                :options="templateOptions"
                placeholder="Pilih Jenis Surat..."
              />
            </div>

            <div class="flex flex-col gap-2">
              <label
                class="
                  text-[length:var(--app-input-label-font)]
                  font-semibold leading-[1.2] text-[var(--app-heading)]
                "
              >
                Klasifikasi Surat
              </label>

              <VDropdown
                v-model="formData.klasifikasi"
                :options="klasifikasiOptions"
                placeholder="Pilih Klasifikasi..."
              />
            </div>
          </div>

          <section
            v-if="dynamicFields.length > 0"
            class="
              mt-2 flex flex-col gap-6 border-t border-dashed
              border-[var(--app-border)] pt-6
            "
          >
            <h2
              class="
                m-0 text-[length:var(--app-section-title-font)]
                font-bold leading-[1.2] text-[var(--app-accent)]
              "
            >
              Informasi Tambahan Surat
            </h2>

            <div
              v-for="field in dynamicFields"
              :key="field"
              class="flex flex-col gap-2"
            >
              <VInputField
                v-model="dynamicData[field]"
                :label="formatLabel(field)"
                :placeholder="'Masukkan ' + formatLabel(field).toLowerCase()"
              />
            </div>
          </section>

          <VButton
            type="submit"
            variant="primary"
            size="lg"
            class="mt-4 w-full"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Mengirim...' : 'Ajukan Surat' }}
          </VButton>
        </form>
      </div>
    </main>
  </DashboardLayout>
</template>