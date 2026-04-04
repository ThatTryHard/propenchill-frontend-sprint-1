<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useGlobalAlert } from '@/composables/useGlobalAlert'
import { useAuthStore } from '@/stores/users/auth'
import {
  useSuratMasukStore,
  type Pengirim,
  type SuratMasukPayload,
} from '@/stores/surat-masuk'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import DepartmentTeacherSidebar from '@/components/department_teachers/DepartmentTeacherSidebar.vue'
import VInputField from '@/components/common/VInputField.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'
import { Building2, LoaderCircle } from 'lucide-vue-next'

interface FormState {
  nomor_surat_pengirim: string
  tanggal_surat: string
  tanggal_terima: string
  perihal: string
  jenis_surat: string
  nama_instansi: string
  alamat: string
  kontak: string
}

const authStore = useAuthStore()
const suratMasukStore = useSuratMasukStore()
const { showAlert } = useGlobalAlert()

const form = reactive<FormState>({
  nomor_surat_pengirim: '',
  tanggal_surat: '',
  tanggal_terima: '',
  perihal: '',
  jenis_surat: '',
  nama_instansi: '',
  alamat: '',
  kontak: '',
})

const errors = ref<Record<string, string>>({})
const formError = ref('')
const selectedPengirimId = ref<number | null>(null)
const autocompleteOpen = ref(false)
const autocompleteRef = ref<HTMLElement | null>(null)

const filteredPengirim = computed(() => {
  const keyword = form.nama_instansi.trim().toLowerCase()
  const source = suratMasukStore.pengirimList

  if (!keyword) {
    return source.slice(0, 8)
  }

  return source
    .filter((item) => item.nama_instansi.toLowerCase().includes(keyword))
    .slice(0, 8)
})

const validateForm = () => {
  const nextErrors: Record<string, string> = {}

  if (!form.nomor_surat_pengirim.trim()) {
    nextErrors.nomor_surat_pengirim = 'Nomor surat wajib diisi.'
  }

  if (!form.tanggal_surat) {
    nextErrors.tanggal_surat = 'Tanggal surat wajib diisi.'
  }

  if (!form.tanggal_terima) {
    nextErrors.tanggal_terima = 'Tanggal terima wajib diisi.'
  }

  if (form.tanggal_surat && form.tanggal_terima && form.tanggal_terima < form.tanggal_surat) {
    nextErrors.tanggal_terima = 'Tanggal terima harus sama atau setelah tanggal surat.'
  }

  if (!form.perihal.trim()) {
    nextErrors.perihal = 'Perihal wajib diisi.'
  }

  if (!form.nama_instansi.trim()) {
    nextErrors.nama_instansi = 'Nama instansi wajib diisi.'
  }

  errors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

const clearForm = () => {
  form.nomor_surat_pengirim = ''
  form.tanggal_surat = ''
  form.tanggal_terima = ''
  form.perihal = ''
  form.jenis_surat = ''
  form.nama_instansi = ''
  form.alamat = ''
  form.kontak = ''
  selectedPengirimId.value = null
  autocompleteOpen.value = false
  errors.value = {}
  formError.value = ''
}

const selectPengirim = (pengirim: Pengirim) => {
  form.nama_instansi = pengirim.nama_instansi
  form.alamat = pengirim.alamat || ''
  form.kontak = pengirim.kontak || ''
  selectedPengirimId.value = pengirim.id_pengirim ?? null
  errors.value.nama_instansi = ''
  autocompleteOpen.value = false
}

const handleNamaInstansiInput = (value: string) => {
  form.nama_instansi = value
  selectedPengirimId.value = null
  autocompleteOpen.value = true

  if (errors.value.nama_instansi) {
    errors.value.nama_instansi = ''
  }
}

const handleClickOutsideAutocomplete = (event: MouseEvent) => {
  if (autocompleteRef.value && !autocompleteRef.value.contains(event.target as Node)) {
    autocompleteOpen.value = false
  }
}

const handleSubmit = async () => {
  formError.value = ''

  if (!validateForm()) {
    showAlert('warning', 'Lengkapi seluruh field wajib terlebih dahulu.', 'Validasi Form')
    return
  }

  const payload: SuratMasukPayload = {
    nomor_surat_pengirim: form.nomor_surat_pengirim.trim(),
    tanggal_surat: form.tanggal_surat,
    tanggal_terima: form.tanggal_terima,
    perihal: form.perihal.trim(),
    jenis_surat: form.jenis_surat.trim(),
    pengirim: {
      nama_instansi: form.nama_instansi.trim(),
      alamat: form.alamat.trim(),
      kontak: form.kontak.trim(),
    },
  }

  if (!payload.jenis_surat) {
    delete payload.jenis_surat
  }

  if (!payload.pengirim.alamat) {
    delete payload.pengirim.alamat
  }

  if (!payload.pengirim.kontak) {
    delete payload.pengirim.kontak
  }

  try {
    const result = await suratMasukStore.createSuratMasuk(payload)
    showAlert('success', result.message || 'Data Surat Masuk berhasil dibuat.', 'Berhasil')

    const createdPengirim = result.data?.pengirim
    const alreadyKnown = suratMasukStore.pengirimList.some(
      (item) =>
        item.nama_instansi.trim().toLowerCase() ===
        (createdPengirim?.nama_instansi || '').trim().toLowerCase(),
    )

    if (createdPengirim && !alreadyKnown) {
      suratMasukStore.pengirimList.unshift(createdPengirim)
    }

    clearForm()
  } catch (apiErrors: any) {
    errors.value = {
      ...errors.value,
      ...(apiErrors || {}),
    }

    formError.value = apiErrors?.general || 'Gagal menyimpan data Surat Masuk.'
    showAlert('error', formError.value, 'Gagal Menyimpan')
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutsideAutocomplete)
  await suratMasukStore.fetchPengirim()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideAutocomplete)
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <DepartmentTeacherSidebar
        :userName="authStore.user?.nama"
        :userEmail="authStore.user?.email"
      />
    </template>

    <div class="w-full min-h-screen bg-white">
      <div class="w-full max-w-[1120px] mx-auto px-8 py-8 max-[768px]:px-4">
        <section class="mb-6">
          <h1 class="m-0 text-[28px] leading-[120%] font-extrabold text-[#111827]">
          Form Pengajuan Surat Masuk
          </h1>
          <p class="mt-1 mb-0 text-[16px] leading-[140%] text-[#71757b]">
          Lengkapi form di bawah ini untuk mengajukan surat masuk
          </p>
        </section>

        <div class="bg-white border border-[#e2e8f0] rounded-[28px] p-6 md:p-8">
        <form class="flex flex-col gap-5" @submit.prevent="handleSubmit">
          <VInputField
            :modelValue="form.nomor_surat_pengirim"
            label="Nomor Surat"
            placeholder="Masukkan nomor surat pengirim"
            :state="errors.nomor_surat_pengirim ? 'error' : 'default'"
            :message="errors.nomor_surat_pengirim"
            @update:modelValue="form.nomor_surat_pengirim = String($event || '')"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <VInputField
              :modelValue="form.tanggal_surat"
              type="date"
              label="Tanggal Surat"
              :state="errors.tanggal_surat ? 'error' : 'default'"
              :message="errors.tanggal_surat"
              @update:modelValue="form.tanggal_surat = String($event || '')"
            />

            <VInputField
              :modelValue="form.tanggal_terima"
              type="date"
              label="Tanggal Terima"
              :state="errors.tanggal_terima ? 'error' : 'default'"
              :message="errors.tanggal_terima"
              @update:modelValue="form.tanggal_terima = String($event || '')"
            />
          </div>

          <VTextareaField
            :modelValue="form.perihal"
            label="Perihal Surat"
            placeholder="Masukkan perihal surat"
            :rows="4"
            :state="errors.perihal ? 'error' : 'default'"
            :message="errors.perihal"
            @update:modelValue="form.perihal = String($event || '')"
          />

          <VInputField
            :modelValue="form.jenis_surat"
            label="Jenis Surat"
            placeholder="Masukkan jenis surat (opsional)"
            @update:modelValue="form.jenis_surat = String($event || '')"
          />

          <div class="flex flex-col gap-2 w-full font-sans" ref="autocompleteRef">
            <label class="text-[16px] font-semibold leading-[120%] text-[#111827]">
              Pengirim (Instansi)
            </label>

            <div class="relative">
              <VInputField
                :modelValue="form.nama_instansi"
                placeholder="Cari atau masukkan nama instansi"
                :state="errors.nama_instansi ? 'error' : 'default'"
                :message="errors.nama_instansi"
                @update:modelValue="handleNamaInstansiInput(String($event || ''))"
                @focusin="autocompleteOpen = true"
              />

              <div
                v-if="autocompleteOpen && filteredPengirim.length > 0"
                class="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-[#e2e3e5] rounded-[12px] shadow-lg z-20 overflow-hidden"
              >
                <ul class="m-0 p-0 list-none max-h-[240px] overflow-auto">
                  <li
                    v-for="item in filteredPengirim"
                    :key="item.id_pengirim || item.nama_instansi"
                    class="px-4 py-3 cursor-pointer text-[14px] text-[#111827] hover:bg-[#f3f3f4] transition-colors"
                    @mousedown.prevent="selectPengirim(item)"
                  >
                    <div class="flex items-center gap-2 font-semibold">
                      <Building2 :size="16" />
                      <span>{{ item.nama_instansi }}</span>
                    </div>
                    <p v-if="item.alamat || item.kontak" class="m-0 mt-1 text-[12px] text-[#71757b]">
                      {{ item.alamat || '-' }}
                      <span v-if="item.kontak"> | {{ item.kontak }}</span>
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            <p v-if="suratMasukStore.loadingPengirim" class="m-0 text-[12px] text-[#71757b]">
              Memuat data pengirim...
            </p>
            <p
              v-else-if="!suratMasukStore.loadingPengirim && !filteredPengirim.length && form.nama_instansi.trim()"
              class="m-0 text-[12px] text-[#71757b]"
            >
              Instansi belum ditemukan, data baru akan dibuat saat submit.
            </p>
            <p v-if="selectedPengirimId" class="m-0 text-[12px] text-[#3f9760]">
              Instansi terpilih dari data existing.
            </p>
          </div>

          <VInputField
            :modelValue="form.alamat"
            label="Alamat Pengirim"
            placeholder="Masukkan alamat instansi (opsional)"
            :state="errors.alamat ? 'error' : 'default'"
            :message="errors.alamat"
            @update:modelValue="form.alamat = String($event || '')"
          />

          <VInputField
            :modelValue="form.kontak"
            label="Kontak Pengirim"
            placeholder="No. telepon atau email pengirim (opsional)"
            :state="errors.kontak ? 'error' : 'default'"
            :message="errors.kontak"
            @update:modelValue="form.kontak = String($event || '')"
          />

          <p v-if="formError" class="m-0 text-[14px] font-semibold text-[#A0453B]">
            {{ formError }}
          </p>

          <div class="pt-2">
            <button
              type="submit"
              class="w-full h-[40px] rounded-[20px] bg-[linear-gradient(180deg,#2f8a50_0%,#0f5b2b_100%)] text-white text-[16px] font-semibold leading-[120%] transition-opacity duration-200 disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="suratMasukStore.submitting"
            >
              <span class="inline-flex items-center gap-2 justify-center">
                <LoaderCircle v-if="suratMasukStore.submitting" class="animate-spin" :size="18" />
              {{ suratMasukStore.submitting ? 'Mengajukan Surat...' : 'Ajukan Surat' }}
              </span>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
