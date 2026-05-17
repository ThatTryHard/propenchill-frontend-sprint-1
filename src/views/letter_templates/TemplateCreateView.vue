<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { InfoIcon } from 'lucide-vue-next'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

import { useLetterTemplateStore } from '@/stores/letter_templates'
import { useTemplateForm } from '@/forms/useTemplateForm'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VInputFile from '@/components/common/VInputFile.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VChip from '@/components/common/VChip.vue'
import VCard from '@/components/common/VCard.vue'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import VTooltip from '@/components/common/VTooltip.vue'

const router = useRouter()
const templateStore = useLetterTemplateStore()

const {
  form,
  fieldErrors,
  generalError,
  successMessage,
  clearErrors,
  resetForm,
  toggleRole,
  handleFileChange,
  insertPlaceholder,
  normalizeNamaTemplate,
  handleTemplateModeChange,
  validateForm,
  validateManualContent,
  validateNamaTemplate,
} = useTemplateForm()

const placeholderNama = '{nama}'
const placeholderNis = '{nis}'
const placeholderKelas = '{kelas}'

const quillRef = ref()
const fileInputRef = ref<InstanceType<typeof VInputFile> | null>(null)

const headerHtml = computed(() => templateStore.config?.header_html || '')
const isLoadingConfig = computed(() => templateStore.isFetchingConfig)

const jenisOptions = [
  { label: 'Keagamaan', value: 'KEAGAMAAN' },
  { label: 'Kesiswaan', value: 'KESISWAAN' },
  { label: 'Akademik', value: 'AKADEMIK' },
]

const modeOptions = [
  { label: 'Upload DOCX', value: 'DOCX' },
  { label: 'Input Manual', value: 'MANUAL' },
]

const roleOptions = [
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Guru', value: 'GURU' },
  { label: 'Wali Murid', value: 'WALI_MURID' },
  { label: 'Kepala Sekolah', value: 'KEPSEK' },
  { label: 'Bidang Akademik', value: 'BIDANG_AKADEMIK' },
  { label: 'Bidang Keagamaan', value: 'BIDANG_AGAMA' },
  { label: 'Bidang Kesiswaan', value: 'BIDANG_KESISWAAN' },
]

const placeholderOptions = [
  '{nama}',
  '{nis}',
  '{kelas}',
  '{tanggal}',
  '{keperluan}',
]

const editorToolbar = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['clean'],
]

watch(
  () => form.template_mode,
  (newMode) => handleTemplateModeChange(newMode),
)

onMounted(() => {
  templateStore.fetchLetterConfig()
})

async function submitTemplate() {
  if (!validateForm({ requireDocxFile: true })) return

  clearErrors()

  const result = await templateStore.createTemplate({
    nama_template: form.nama_template,
    jenis: form.jenis,
    template_mode: form.template_mode,
    konten_template: form.konten_template,
    allowed_roles: form.allowed_roles,
    file_template: form.file_template,
  })

  if (!result.ok) {
    if (result.details && typeof result.details === 'object' && !Array.isArray(result.details)) {
      Object.entries(result.details).forEach(([key, value]) => {
        fieldErrors[key] = Array.isArray(value) ? String(value[0]) : String(value)
      })

      if (!Object.keys(fieldErrors).length) {
        generalError.value = result.error || 'Gagal membuat template.'
      }
    } else {
      generalError.value = result.error || 'Gagal membuat template.'
    }

    return
  }

  resetForm()

  router.push({
    path: '/letter_templates',
    query: {
      success: templateStore.successMessage || 'Template surat berhasil dibuat.',
    },
  })
}

function goBack() {
  router.back()
}
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main
      class="
        flex-1 overflow-y-auto bg-[var(--app-bg)]
        px-4 py-8 font-[var(--font-sans)] text-[var(--app-text)]
        md:px-8 lg:px-10
      "
    >
      <div class="w-full">
        <section class="mb-6 flex flex-col gap-1">
          <h1
            class="
              m-0 text-[length:var(--app-page-title-font)]
              font-bold leading-[1.2] text-[var(--app-heading)]
            "
          >
            Tambah Template Surat Baru
          </h1>

          <p
            class="
              m-0 text-[length:var(--app-page-subtitle-font)]
              leading-[1.4] text-[var(--app-muted)]
            "
          >
            Buat template surat baru untuk digunakan pengguna
          </p>
        </section>

        <div class="flex flex-col gap-4">
          <VAlert
            v-if="generalError"
            type="error"
            title="Gagal"
            :message="generalError"
            @close="generalError = ''"
          />

          <VAlert
            v-if="successMessage"
            type="success"
            title="Berhasil"
            :message="successMessage"
            @close="successMessage = ''"
          />

          <VCard
            padding-class="p-6"
            class="relative z-30 overflow-visible"
          >
            <div class="flex flex-col gap-5">
              <div>
                <h2
                  class="
                    m-0 text-[length:var(--app-section-title-font)]
                    font-semibold leading-[1.25] text-[var(--app-heading)]
                  "
                >
                  Informasi Template
                </h2>

                <p
                  class="
                    mt-1 mb-0 text-[length:var(--app-font-sm)]
                    leading-[1.4] text-[var(--app-muted)]
                  "
                >
                  Isi identitas dasar template surat terlebih dahulu
                </p>
              </div>

              <VInputField
                v-model="form.nama_template"
                label="Nama Template"
                placeholder="Masukkan nama template"
                :state="fieldErrors.nama_template ? 'error' : 'default'"
                :message="fieldErrors.nama_template"
                @blur="normalizeNamaTemplate"
                @update:modelValue="validateNamaTemplate()"
              />

              <div class="grid gap-4 lg:grid-cols-2">
                <div class="flex flex-col gap-2">
                  <label
                    class="
                      text-[length:var(--app-input-label-font)]
                      font-semibold leading-[1.2] text-[var(--app-text)]
                    "
                  >
                    Jenis Template
                  </label>

                  <VDropdown
                    v-model="form.jenis"
                    :options="jenisOptions"
                    placeholder="Pilih jenis template"
                  />

                  <span
                    v-if="fieldErrors.jenis"
                    class="
                      text-[length:var(--app-input-helper-font)]
                      leading-[1.4] text-[var(--app-danger)]
                    "
                  >
                    {{ fieldErrors.jenis }}
                  </span>
                </div>

                <div class="flex flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <label
                      class="
                        text-[length:var(--app-input-label-font)]
                        font-semibold leading-[1.2] text-[var(--app-text)]
                      "
                    >
                      Metode Template
                    </label>

                    <VTooltip
                      type="small"
                      text="Pilih Upload DOCX atau Input Manual"
                    >
                      <button
                        type="button"
                        class="
                          inline-flex items-center justify-center text-[var(--app-muted)]
                          transition-colors duration-200 ease-in-out
                          hover:text-[var(--app-text)]
                          focus:outline-none focus-visible:outline focus-visible:outline-2
                          focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]
                        "
                      >
                        <InfoIcon class="h-4 w-4" />
                      </button>
                    </VTooltip>
                  </div>

                  <VDropdown
                    v-model="form.template_mode"
                    :options="modeOptions"
                    placeholder="Pilih metode template"
                  />

                  <span
                    v-if="fieldErrors.template_mode"
                    class="
                      text-[length:var(--app-input-helper-font)]
                      leading-[1.4] text-[var(--app-danger)]
                    "
                  >
                    {{ fieldErrors.template_mode }}
                  </span>
                </div>
              </div>
            </div>
          </VCard>

          <VCard padding-class="p-6">
            <div class="flex flex-col gap-5">
              <div>
                <div class="flex items-center gap-2">
                  <h2
                    class="
                      m-0 text-[length:var(--app-section-title-font)]
                      font-semibold leading-[1.25] text-[var(--app-heading)]
                    "
                  >
                    Kontrol Akses
                  </h2>

                  <VTooltip
                    type="large"
                    title="Kontrol Akses"
                    text="Pilih role mana yang dapat melihat atau menggunakan template ini."
                  >
                    <button
                      type="button"
                      class="
                        inline-flex items-center justify-center text-[var(--app-muted)]
                        transition-colors duration-200 ease-in-out
                        hover:text-[var(--app-text)]
                        focus:outline-none focus-visible:outline focus-visible:outline-2
                        focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]
                      "
                    >
                      <InfoIcon class="h-5 w-5" />
                    </button>
                  </VTooltip>
                </div>

                <p
                  class="
                    mt-1 mb-0 text-[length:var(--app-font-sm)]
                    leading-[1.4] text-[var(--app-muted)]
                  "
                >
                  Tentukan role mana yang dapat mengakses template ini
                </p>
              </div>

              <div class="flex flex-wrap gap-3">
                <button
                  v-for="role in roleOptions"
                  :key="role.value"
                  type="button"
                  class="
                    rounded-full transition-transform duration-200 ease-in-out
                    hover:scale-[1.01] active:scale-[0.98]
                    focus:outline-none focus-visible:outline focus-visible:outline-2
                    focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]
                  "
                  @click="toggleRole(role.value)"
                >
                  <VChip
                    :label="role.label"
                    :variant="form.allowed_roles.includes(role.value) ? 'primary' : 'tertiary'"
                  />
                </button>
              </div>

              <span
                v-if="fieldErrors.allowed_roles"
                class="
                  text-[length:var(--app-input-helper-font)]
                  leading-[1.4] text-[var(--app-danger)]
                "
              >
                {{ fieldErrors.allowed_roles }}
              </span>
            </div>
          </VCard>

          <VCard
            v-if="form.template_mode === 'DOCX'"
            padding-class="p-6"
          >
            <div class="flex flex-col gap-5">
              <div>
                <h2
                  class="
                    m-0 text-[length:var(--app-section-title-font)]
                    font-semibold leading-[1.25] text-[var(--app-heading)]
                  "
                >
                  Unggah Template Surat
                </h2>

                <p
                  class="
                    mt-1 mb-0 text-[length:var(--app-font-sm)]
                    leading-[1.4] text-[var(--app-muted)]
                  "
                >
                  Unggah file .docx yang berisi placeholder seperti
                  <span class="font-semibold text-[var(--app-heading)]">
                    {{ placeholderNama }}
                  </span>
                  ,
                  <span class="font-semibold text-[var(--app-heading)]">
                    {{ placeholderNis }}
                  </span>
                  , dan
                  <span class="font-semibold text-[var(--app-heading)]">
                    {{ placeholderKelas }}
                  </span>
                  .
                </p>
              </div>

              <VInputFile
                ref="fileInputRef"
                accept=".docx"
                file-types-text=".docx file"
                :max-size-mb="10"
                @update:modelValue="(file) => handleFileChange(file)"
              />

              <p
                v-if="fieldErrors.file_template"
                class="
                  m-0 text-[length:var(--app-input-helper-font)]
                  leading-[1.4] text-[var(--app-danger)]
                "
              >
                {{ fieldErrors.file_template }}
              </p>
            </div>
          </VCard>

          <VCard
            v-else
            padding-class="p-6"
          >
            <div class="flex flex-col gap-5">
              <div>
                <h2
                  class="
                    m-0 text-[length:var(--app-section-title-font)]
                    font-semibold leading-[1.25] text-[var(--app-heading)]
                  "
                >
                  Isi Konten Template
                </h2>

                <p
                  class="
                    mt-1 mb-0 text-[length:var(--app-font-sm)]
                    leading-[1.4] text-[var(--app-muted)]
                  "
                >
                  Header surat sudah disediakan sistem. Anda hanya perlu mengisi konten utama surat.
                </p>
              </div>

              <div
                class="
                  overflow-hidden rounded-[20px] border border-[var(--app-card-border)]
                  bg-[var(--app-card)] text-[var(--app-text)]
                "
              >
                <div
                  class="
                    border-b border-[var(--app-card-border)]
                    bg-[var(--app-table-head-bg)] px-6 py-5
                  "
                >
                  <div
                    v-if="!isLoadingConfig"
                    class="template-preview-header-html max-w-none text-[var(--app-text)]"
                    v-html="headerHtml"
                  />

                  <div
                    v-else
                    class="
                      text-[length:var(--app-font-sm)]
                      leading-[1.4] text-[var(--app-muted)]
                    "
                  >
                    Memuat header surat...
                  </div>
                </div>

                <div class="px-6 py-5">
                  <label
                    class="
                      mb-3 block text-[length:var(--app-input-label-font)]
                      font-semibold leading-[1.2] text-[var(--app-text)]
                    "
                  >
                    Konten Template
                  </label>

                  <div class="mb-3 flex flex-wrap gap-2">
                    <VButton
                      v-for="placeholder in placeholderOptions"
                      :key="placeholder"
                      variant="tertiary"
                      size="sm"
                      @click="insertPlaceholder(placeholder)"
                    >
                      Masukkan {{ placeholder }}
                    </VButton>
                  </div>

                  <div
                    :class="[
                      'rounded-[16px] border bg-[var(--app-input-bg)] text-[var(--app-text)]',
                      fieldErrors.konten_template
                        ? 'border-[var(--app-danger)]'
                        : 'border-[var(--app-card-border)]',
                    ]"
                  >
                    <QuillEditor
                      ref="quillRef"
                      v-model:content="form.konten_template"
                      contentType="html"
                      theme="snow"
                      :toolbar="editorToolbar"
                      class="min-h-[260px]"
                      @update:content="validateManualContent()"
                    />
                  </div>

                  <p
                    v-if="fieldErrors.konten_template"
                    class="
                      mt-2 mb-0 text-[length:var(--app-input-helper-font)]
                      leading-[1.4] text-[var(--app-danger)]
                    "
                  >
                    {{ fieldErrors.konten_template }}
                  </p>
                </div>
              </div>
            </div>
          </VCard>

          <div class="grid gap-4 md:grid-cols-2">
            <VButton
              variant="secondary"
              class="w-full"
              @click="goBack"
            >
              Batal
            </VButton>

            <VButton
              variant="primary"
              class="w-full"
              :disabled="templateStore.isSubmitting"
              @click="submitTemplate"
            >
              {{ templateStore.isSubmitting ? 'Menyimpan...' : 'Ajukan Template' }}
            </VButton>
          </div>
        </div>
      </div>
    </main>
  </DashboardLayout>
</template>

<style scoped>
:deep(.ql-toolbar.ql-snow) {
  border: none;
  border-bottom: 1px solid var(--app-card-border);
  background: var(--app-table-head-bg);
  color: var(--app-text);
}

:deep(.ql-container.ql-snow) {
  border: none;
  min-height: 220px;
  font-size: var(--app-font-sm);
  color: var(--app-text);
  background: var(--app-input-bg);
  font-family: var(--font-sans);
}

:deep(.ql-editor) {
  min-height: 220px;
  line-height: 1.6;
  color: var(--app-text);
}

:deep(.ql-editor.ql-blank::before) {
  color: var(--app-muted);
}

:deep(.ql-snow .ql-stroke) {
  stroke: var(--app-text);
}

:deep(.ql-snow .ql-fill) {
  fill: var(--app-text);
}

:deep(.ql-snow .ql-picker) {
  color: var(--app-text);
}

:deep(.template-preview-header-html) {
  font-family: 'Times New Roman', serif;
  font-size: 12pt;
  line-height: 1.3;
  color: var(--app-text);
}

:deep(.template-preview-header-html table) {
  width: 100% !important;
}

:deep(.template-preview-header-html img) {
  width: auto !important;
  max-width: 100%;
  max-height: 86px;
  object-fit: contain;
}
</style>