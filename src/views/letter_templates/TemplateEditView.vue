<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  FileText,
  PlusCircle,
  Settings,
  CircleHelp,
  LogOut,
  InfoIcon,
} from 'lucide-vue-next'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

import { useAuthStore } from '@/stores/users/auth'
import { useLetterTemplateStore, type TemplateMode } from '@/stores/letter_templates'
import { useTemplateForm } from '@/forms/useTemplateForm'

import VInputFile from '@/components/common/VInputFile.vue'
import VSidebar from '@/components/common/VSidebar.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VChip from '@/components/common/VChip.vue'
import VCard from '@/components/common/VCard.vue'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import VTooltip from '@/components/common/VTooltip.vue'

const route = useRoute()
const router = useRouter()
const templateStore = useLetterTemplateStore()
const authStore = useAuthStore()

const {
  form,
  fieldErrors,
  generalError,
  successMessage,
  isActiveString,
  clearErrors,
  applyTemplateDetail,
  toggleRole,
  handleFileChange,
  insertPlaceholder,
  handleTemplateModeChange,
  validateForm,
} = useTemplateForm()

function parseJsonSafely<T>(value: string | null): T | null {
  if (!value) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

const localUser = computed<Record<string, any> | null>(() => {
  return parseJsonSafely<Record<string, any>>(localStorage.getItem('user'))
})

const currentUser = computed<Record<string, any> | null>(() => {
  if (localUser.value) return localUser.value

  const authAny = authStore as unknown as Record<string, any>
  return authAny.user || authAny.currentUser || null
})

const userName = computed(() => {
  return (
    currentUser.value?.nama ||
    currentUser.value?.full_name ||
    currentUser.value?.name ||
    authStore.user?.nama ||
    'User'
  )
})

const userEmail = computed(() => {
  return currentUser.value?.email || authStore.user?.email || '-'
})

const placeholderNama = '{nama}'
const placeholderNis = '{nis}'
const placeholderKelas = '{kelas}'

const headerHtml = computed(() => templateStore.config?.header_html || '')
const isLoadingConfig = computed(() => templateStore.isFetchingConfig)
const isLoadingDetail = ref(false)

const quillRef = ref()
const fileInputRef = ref<InstanceType<typeof VInputFile> | null>(null)

const navItems = [
  {
    name: 'template-management',
    label: 'Manajemen Template Surat',
    path: '/letter_templates',
    icon: FileText,
  },
  {
    name: 'template-create',
    label: 'Tambah Template Surat',
    path: '/letter_templates/create',
    icon: PlusCircle,
  },
]

const bottomItems = [
  { name: 'settings', label: 'Settings', icon: Settings },
  { name: 'help', label: 'Help', icon: CircleHelp },
  { name: 'logout', label: 'Log Out', icon: LogOut },
]

const jenisOptions = [
  { label: 'Keagamaan', value: 'KEAGAMAAN' },
  { label: 'Kesiswaan', value: 'KESISWAAN' },
  { label: 'Akademik', value: 'AKADEMIK' },
]

const modeOptions = [
  { label: 'Upload DOCX', value: 'DOCX' },
  { label: 'Input Manual', value: 'MANUAL' },
]

const statusOptions = [
  { label: 'Aktif', value: 'true' },
  { label: 'Nonaktif', value: 'false' },
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

const editorToolbar = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['clean'],
]

watch(
  () => form.template_mode,
  (newMode) => handleTemplateModeChange(newMode as TemplateMode)
)

onMounted(() => {
  templateStore.fetchLetterConfig()
  fetchTemplateDetail()
})

async function fetchTemplateDetail() {
  const idTemplate = Number(route.params.id)

  if (!idTemplate) {
    generalError.value = 'ID template tidak valid.'
    return
  }

  try {
    isLoadingDetail.value = true
    generalError.value = ''

    const result = await templateStore.fetchTemplateDetail(idTemplate)

    if (!result.ok || !result.data) {
      generalError.value = result.error || 'Gagal mengambil detail template.'
      return
    }

    applyTemplateDetail(result.data)
  } finally {
    isLoadingDetail.value = false
  }
}

async function submitUpdate() {
  if (!validateForm({ requireDocxFile: false })) return

  clearErrors()

  const idTemplate = Number(route.params.id)

  const result = await templateStore.updateTemplate(idTemplate, {
    nama_template: form.nama_template,
    jenis: form.jenis,
    is_active: form.is_active,
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
        generalError.value = result.error || 'Gagal memperbarui template.'
      }
    } else {
      generalError.value = result.error || 'Gagal memperbarui template.'
    }
    return
  }

  successMessage.value = templateStore.successMessage || 'Template surat berhasil diperbarui.'
  await router.push('/letter_templates')
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,#fff,#eaf7ef)] flex font-sans">
    <VSidebar
      class="!h-auto !min-h-full self-stretch"
      :nav-items="navItems"
      :bottom-items="bottomItems"
      :user-name="userName"
      :user-email="userEmail"
    />

    <main class="flex-1 px-4 md:px-8 lg:px-10 py-8 overflow-y-auto">
      <div class="w-full">
        <section class="mb-6 flex flex-col gap-1">
          <h1 class="text-[28px] md:text-[32px] font-bold leading-[120%] text-[#111827]">
            Edit Template Surat
          </h1>
          <p class="text-[14px] md:text-[16px] leading-[150%] text-[#858a91]">
            Perbarui isi dan pengaturan template surat
          </p>
        </section>

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

        <section
          v-if="isLoadingDetail"
          class="rounded-[28px] border border-[#d9e2e7] bg-white/80 px-6 py-10 text-center text-[#858a91]"
        >
          Memuat detail template...
        </section>

        <div v-else class="flex w-full flex-col gap-4">
          <div class="relative z-30">
            <VCard padding-class="p-6 !overflow-visible">
              <div class="flex flex-col gap-5">
                <div class="flex flex-col gap-1">
                  <h2 class="text-[24px] font-semibold leading-[120%] text-[#111827]">
                    Informasi Template
                  </h2>
                  <p class="text-[14px] leading-[150%] text-[#858a91]">
                    Ubah identitas dan pengaturan dasar template
                  </p>
                </div>

                <div class="grid grid-cols-1 gap-4">
                  <VInputField
                    v-model="form.nama_template"
                    label="Nama Template"
                    placeholder="Masukkan nama template"
                    :state="fieldErrors.nama_template ? 'error' : 'default'"
                    :message="fieldErrors.nama_template"
                  />
                </div>

                <div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
                  <div class="relative z-40 flex flex-col gap-2">
                    <label class="text-[16px] font-semibold leading-[120%] text-[#111827]">
                      Jenis Template
                    </label>
                    <VDropdown
                      v-model="form.jenis"
                      :options="jenisOptions"
                      placeholder="Pilih jenis template"
                    />
                    <span v-if="fieldErrors.jenis" class="text-[12px] font-light text-[#A0453B]">
                      {{ fieldErrors.jenis }}
                    </span>
                  </div>

                  <div class="relative z-30 flex flex-col gap-2">
                    <label class="text-[16px] font-semibold leading-[120%] text-[#111827]">
                      Metode Template
                    </label>
                    <VDropdown
                      v-model="form.template_mode"
                      :options="modeOptions"
                      placeholder="Pilih metode template"
                    />
                    <span v-if="fieldErrors.template_mode" class="text-[12px] font-light text-[#A0453B]">
                      {{ fieldErrors.template_mode }}
                    </span>
                  </div>

                  <div class="relative z-20 flex flex-col gap-2">
                    <label class="text-[16px] font-semibold leading-[120%] text-[#111827]">
                      Status
                    </label>
                    <VDropdown
                      v-model="isActiveString"
                      :options="statusOptions"
                      placeholder="Pilih status"
                    />
                  </div>
                </div>
              </div>
            </VCard>
          </div>

          <VCard padding-class="p-6">
            <div class="flex flex-col gap-5">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <h2 class="text-[24px] font-semibold leading-[120%] text-[#111827]">
                    Kontrol Akses
                  </h2>

                  <VTooltip
                    type="large"
                    title="Kontrol Akses"
                    text="Pilih role mana yang dapat melihat atau menggunakan template ini."
                  >
                    <button type="button" class="text-[#858a91] transition hover:text-[#111827]">
                      <InfoIcon class="h-5 w-5" />
                    </button>
                  </VTooltip>
                </div>

                <p class="text-[14px] leading-[150%] text-[#858a91]">
                  Tentukan role mana yang dapat mengakses template ini
                </p>
              </div>

              <div class="flex flex-wrap gap-3">
                <button
                  v-for="role in roleOptions"
                  :key="role.value"
                  type="button"
                  class="transition-transform active:scale-95"
                  @click="toggleRole(role.value)"
                >
                  <VChip
                    :label="role.label"
                    :variant="form.allowed_roles.includes(role.value) ? 'deep' : 'tertiary'"
                  />
                </button>
              </div>

              <span v-if="fieldErrors.allowed_roles" class="text-[12px] font-light text-[#A0453B]">
                {{ fieldErrors.allowed_roles }}
              </span>
            </div>
          </VCard>

          <VCard v-if="form.template_mode === 'DOCX'" padding-class="p-6">
            <div class="flex flex-col gap-5">
              <div class="flex flex-col gap-1">
                <h2 class="text-[24px] font-semibold leading-[120%] text-[#111827]">
                  Ganti File Template DOCX
                </h2>
                <p class="text-[14px] leading-[150%] text-[#858a91]">
                  Kosongkan jika tidak ingin mengganti file. Jika ingin mengganti, unggah file .docx baru.
                </p>
              </div>

              <VInputFile
                ref="fileInputRef"
                accept=".docx"
                file-types-text=".docx file"
                :max-size-mb="10"
                @update:modelValue="handleFileChange"
              />

              <p v-if="fieldErrors.file_template" class="text-[12px] font-light text-[#A0453B]">
                {{ fieldErrors.file_template }}
              </p>
            </div>
          </VCard>

          <VCard v-else padding-class="p-6">
            <div class="flex flex-col gap-5">
              <div class="flex flex-col gap-1">
                <h2 class="text-[24px] font-semibold leading-[120%] text-[#111827]">
                  Isi Konten Template
                </h2>
                <p class="text-[14px] leading-[150%] text-[#858a91]">
                  Header surat sudah disediakan sistem. Anda hanya perlu mengisi konten utama surat.
                </p>
              </div>

              <div class="overflow-hidden rounded-[20px] border border-[#d9e2e7] bg-white">
                <div class="border-b border-[#e5e7eb] bg-[#f8fafc] px-6 py-5">
                  <div
                    v-if="!isLoadingConfig"
                    class="prose max-w-none text-[#111827]"
                    v-html="headerHtml"
                  />
                  <div v-else class="text-sm text-[#858a91]">
                    Memuat header surat...
                  </div>
                </div>

                <div class="px-6 py-5">
                  <label class="mb-3 block text-[16px] font-semibold leading-[120%] text-[#111827]">
                    Konten Template
                  </label>

                  <div class="mb-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      class="rounded-full border border-[#d9e2e7] bg-white px-3 py-1.5 text-sm text-[#111827] hover:bg-[#f8fafc]"
                      @click="insertPlaceholder('{nama}')"
                    >
                      Masukkan {nama}
                    </button>
                    <button
                      type="button"
                      class="rounded-full border border-[#d9e2e7] bg-white px-3 py-1.5 text-sm text-[#111827] hover:bg-[#f8fafc]"
                      @click="insertPlaceholder('{nis}')"
                    >
                      Masukkan {nis}
                    </button>
                    <button
                      type="button"
                      class="rounded-full border border-[#d9e2e7] bg-white px-3 py-1.5 text-sm text-[#111827] hover:bg-[#f8fafc]"
                      @click="insertPlaceholder('{kelas}')"
                    >
                      Masukkan {kelas}
                    </button>
                    <button
                      type="button"
                      class="rounded-full border border-[#d9e2e7] bg-white px-3 py-1.5 text-sm text-[#111827] hover:bg-[#f8fafc]"
                      @click="insertPlaceholder('{tanggal}')"
                    >
                      Masukkan {tanggal}
                    </button>
                    <button
                      type="button"
                      class="rounded-full border border-[#d9e2e7] bg-white px-3 py-1.5 text-sm text-[#111827] hover:bg-[#f8fafc]"
                      @click="insertPlaceholder('{keperluan}')"
                    >
                      Masukkan {keperluan}
                    </button>
                  </div>

                  <div
                    class="overflow-hidden rounded-[16px] border"
                    :class="fieldErrors.konten_template ? 'border-[#A0453B]' : 'border-[#d9e2e7]'"
                  >
                    <QuillEditor
                      ref="quillRef"
                      v-model:content="form.konten_template"
                      contentType="html"
                      theme="snow"
                      :toolbar="editorToolbar"
                      class="min-h-[260px]"
                    />
                  </div>

                  <p v-if="fieldErrors.konten_template" class="mt-2 text-[12px] font-light text-[#A0453B]">
                    {{ fieldErrors.konten_template }}
                  </p>
                </div>
              </div>
            </div>
          </VCard>

          <div class="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            <VButton variant="secondary" class="!w-full" @click="goBack">
              Batal
            </VButton>

            <VButton
              variant="primary"
              class="!w-full"
              :disabled="templateStore.isSubmitting"
              @click="submitUpdate"
            >
              {{ templateStore.isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </VButton>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
:deep(.ql-toolbar.ql-snow) {
  border: none;
  border-bottom: 1px solid #e5e7eb;
}

:deep(.ql-container.ql-snow) {
  border: none;
  min-height: 220px;
  font-size: 14px;
  color: #111827;
}

:deep(.ql-editor) {
  min-height: 220px;
  line-height: 1.6;
}
</style>