<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGlobalAlert } from '@/composables/useGlobalAlert'
import {
  useSuratMasukStore,
  type Pengirim,
  type SuratMasukPayload,
} from '@/stores/surat-masuk'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VCard from '@/components/common/VCard.vue'
import VInputField from '@/components/common/VInputField.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'
import VInputFile from '@/components/common/VInputFile.vue'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'

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

const suratMasukStore = useSuratMasukStore()
const { showAlert } = useGlobalAlert()
const router = useRouter()

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
const lampiranFile = ref<File | null>(null)

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
  lampiranFile.value = null
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
      id_pengirim: selectedPengirimId.value ?? undefined,
      nama_instansi: form.nama_instansi.trim(),
      alamat: form.alamat.trim(),
      kontak: form.kontak.trim(),
    },
    file_lampiran: lampiranFile.value,
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
    await router.push('/department-teachers/surat-masuk')
  } catch (apiErrors: unknown) {
    const payload =
      typeof apiErrors === 'object' && apiErrors !== null
        ? (apiErrors as Record<string, unknown>)
        : {}

    errors.value = {
      ...errors.value,
      ...(payload as Record<string, string>),
    }

    formError.value =
      typeof payload.general === 'string' ? payload.general : 'Gagal menyimpan data Surat Masuk.'

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
      <SIMPSidebar />
    </template>

    <main class="surat-masuk-create-page">
      <section class="surat-masuk-create-header">
        <h1 class="surat-masuk-create-title">
          Form Pengajuan Surat Masuk
        </h1>

        <p class="surat-masuk-create-subtitle">
          Lengkapi form di bawah ini untuk mengajukan surat masuk.
        </p>
      </section>

      <VCard
        class="surat-masuk-create-card"
        paddingClass="p-6 md:p-8"
        overflowClass="overflow-visible"
      >
        <form
          class="surat-masuk-create-form"
          @submit.prevent="handleSubmit"
        >
          <VInputField
            :modelValue="form.nomor_surat_pengirim"
            label="Nomor Surat"
            placeholder="Masukkan nomor surat pengirim"
            :state="errors.nomor_surat_pengirim ? 'error' : 'default'"
            :message="errors.nomor_surat_pengirim"
            @update:modelValue="form.nomor_surat_pengirim = String($event || '')"
          />

          <div class="surat-masuk-create-grid">
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

          <div
            ref="autocompleteRef"
            class="pengirim-field"
          >
            <label class="pengirim-label">
              Pengirim (Instansi)
            </label>

            <div class="pengirim-autocomplete">
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
                class="pengirim-dropdown"
              >
                <ul class="pengirim-list">
                  <li
                    v-for="item in filteredPengirim"
                    :key="item.id_pengirim || item.nama_instansi"
                    class="pengirim-option"
                    @mousedown.prevent="selectPengirim(item)"
                  >
                    <div class="pengirim-option-title">
                      <Building2 :size="16" />
                      <span>{{ item.nama_instansi }}</span>
                    </div>

                    <p
                      v-if="item.alamat || item.kontak"
                      class="pengirim-option-meta"
                    >
                      {{ item.alamat || '-' }}
                      <span v-if="item.kontak"> | {{ item.kontak }}</span>
                    </p>
                  </li>
                </ul>
              </div>
            </div>

            <p
              v-if="suratMasukStore.loadingPengirim"
              class="pengirim-helper"
            >
              Memuat data pengirim...
            </p>

            <p
              v-else-if="
                !suratMasukStore.loadingPengirim &&
                !filteredPengirim.length &&
                form.nama_instansi.trim()
              "
              class="pengirim-helper"
            >
              Instansi belum ditemukan, data baru akan dibuat saat submit.
            </p>

            <p
              v-if="selectedPengirimId"
              class="pengirim-success"
            >
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

          <div class="lampiran-field">
            <label class="lampiran-label">
              Lampiran Surat (Opsional)
            </label>

            <VInputFile
              accept=".pdf,.doc,.docx"
              file-types-text="PDF, DOC, DOCX"
              :max-size-mb="10"
              @update:modelValue="lampiranFile = ($event as File) || null"
            />
          </div>

          <VAlert
            v-if="formError"
            :visible="Boolean(formError)"
            type="error"
            title="Gagal Menyimpan"
            :message="formError"
            @close="formError = ''"
          />

          <div class="surat-masuk-create-actions">
            <VButton
              type="submit"
              variant="primary"
              class="surat-masuk-create-submit"
              :disabled="suratMasukStore.submitting"
            >
              <template
                v-if="suratMasukStore.submitting"
                #leftIcon
              >
                <LoaderCircle
                  class="surat-masuk-create-loader"
                  :size="18"
                />
              </template>

              {{ suratMasukStore.submitting ? 'Mengajukan Surat...' : 'Ajukan Surat' }}
            </VButton>
          </div>
        </form>
      </VCard>
    </main>
  </DashboardLayout>
</template>

<style scoped>
.surat-masuk-create-page {
  display: flex;
  width: 100%;
  min-height: 100vh;
  flex-direction: column;
  gap: 24px;
  background: var(--app-bg);
  color: var(--app-text);
  font-family: var(--font-sans);
  padding: 32px;
}

.surat-masuk-create-header {
  display: flex;
  max-width: 1120px;
  flex-direction: column;
  gap: 4px;
}

.surat-masuk-create-title {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-page-title-font);
  font-weight: 800;
  line-height: 1.2;
}

.surat-masuk-create-subtitle {
  margin: 0;
  color: var(--app-subtext);
  font-size: var(--app-page-subtitle-font);
  line-height: 1.4;
}

.surat-masuk-create-card {
  width: 100%;
  max-width: 1120px;
  border-color: var(--app-card-border);
  background: var(--app-card);
  color: var(--app-text);
  box-shadow: var(--app-card-shadow);
}

.surat-masuk-create-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.surat-masuk-create-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.pengirim-field,
.lampiran-field {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 8px;
}

.pengirim-label,
.lampiran-label {
  color: var(--app-heading);
  font-family: var(--font-sans);
  font-size: var(--app-input-label-font);
  font-weight: 600;
  line-height: 1.2;
}

.pengirim-autocomplete {
  position: relative;
  width: 100%;
}

.pengirim-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 30;
  width: 100%;
  overflow: hidden;
  border: 1px solid var(--app-border);
  border-radius: 12px;
  background: var(--app-card);
  color: var(--app-text);
  box-shadow: var(--app-card-shadow);
}

.pengirim-list {
  max-height: 240px;
  overflow: auto;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pengirim-option {
  cursor: pointer;
  padding: 12px 16px;
  color: var(--app-text);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.pengirim-option:hover {
  background: var(--app-table-row-hover);
}

.pengirim-option-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--app-heading);
  font-size: var(--app-font-sm);
  font-weight: 700;
  line-height: 1.35;
}

.pengirim-option-meta {
  margin: 4px 0 0;
  color: var(--app-muted);
  font-size: var(--app-font-xs);
  line-height: 1.4;
}

.pengirim-helper {
  margin: 0;
  color: var(--app-muted);
  font-size: var(--app-input-helper-font);
  line-height: 1.5;
}

.pengirim-success {
  margin: 0;
  color: var(--app-success);
  font-size: var(--app-input-helper-font);
  line-height: 1.5;
}

.surat-masuk-create-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}

.surat-masuk-create-submit {
  width: 100%;
}

.surat-masuk-create-loader {
  animation: surat-masuk-create-spin 0.8s linear infinite;
}

@keyframes surat-masuk-create-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .surat-masuk-create-page {
    padding: 24px 16px;
  }

  .surat-masuk-create-grid {
    grid-template-columns: 1fr;
  }
}
</style>