<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Trash2, RotateCcw, Filter } from 'lucide-vue-next'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/users/auth'
import mailIcon from '@/assets/mail.png'
import studentIcon from '@/assets/Siswa SVG.svg'
import VActionButton from '@/components/common/VActionButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VButton from '@/components/common/VButton.vue'
import VPagination from '@/components/common/VPagination.vue'
import VAlert from '@/components/common/VAlert.vue'
import VModal from '@/components/common/VModal.vue'
import TemplatePreviewModal from '@/views/letter_templates/TemplatePreviewModal.vue'
import {
  useLetterTemplateStore,
  type LetterTemplateItem,
  type FetchTemplatesParams,
} from '@/stores/letter_templates'

const templateStore = useLetterTemplateStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const statusOptions = [
  { label: 'Semua', value: '' },
  { label: 'Aktif', value: 'true' },
  { label: 'Nonaktif', value: 'false' },
]

const jenisOptions = [
  { label: 'Semua', value: '' },
  { label: 'Keagamaan', value: 'KEAGAMAAN' },
  { label: 'Kesiswaan', value: 'KESISWAAN' },
  { label: 'Akademik', value: 'AKADEMIK' },
]

const sortOptions = [
  { label: 'Terbaru', value: 'created_at-desc' },
  { label: 'Terlama', value: 'created_at-asc' },
  { label: 'Nama A-Z', value: 'nama_template-asc' },
  { label: 'Nama Z-A', value: 'nama_template-desc' },
]

const MANAGE_TEMPLATE_ROLES = [
  'ADMIN',
  'BIDANG_AGAMA',
  'BIDANG_KESISWAAN',
  'BIDANG_AKADEMIK',
]

const SUCCESS_ALERT_DURATION = 3000

const search = ref('')
const statusFilter = ref('')
const jenisFilter = ref('')
const sortValue = ref('created_at-desc')
const currentPage = ref(1)
const limit = ref(4)

const generalError = ref('')
const successMessage = ref('')
const isPreviewModalOpen = ref(false)

const isDeleteModalOpen = ref(false)
const selectedTemplateIdToDelete = ref<number | null>(null)

const isToggleModalOpen = ref(false)
const selectedTemplateToToggle = ref<LetterTemplateItem | null>(null)

let successTimer: ReturnType<typeof setTimeout> | null = null

const templates = computed(() => templateStore.templates)
const pagination = computed(() => templateStore.pagination)
const previewTemplate = computed(() => templateStore.selectedTemplate)
const isLoading = computed(() => templateStore.isFetching)

function parseJsonSafely<T>(value: string | null): T | null {
  if (!value) return null

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

interface CurrentUser {
  id?: number
  nama?: string
  full_name?: string
  name?: string
  email?: string
  role?: string
}

const localUser = computed<CurrentUser | null>(() => {
  return parseJsonSafely<CurrentUser>(localStorage.getItem('user'))
})

const currentUser = computed<CurrentUser | null>(() => {
  if (localUser.value) return localUser.value

  return authStore.user || null
})

const canManageTemplate = computed(() => {
  const role = currentUser.value?.role || authStore.role || ''

  return MANAGE_TEMPLATE_ROLES.includes(role)
})

const currentUserId = computed<number | null>(() => {
  const possibleId =
    currentUser.value?.id ??
    parseJsonSafely<{ id?: number }>(localStorage.getItem('user_data'))?.id

  if (typeof possibleId === 'number') {
    return possibleId
  }

  return null
})

const currentUserName = computed(() => {
  return (
    currentUser.value?.nama ||
    currentUser.value?.full_name ||
    currentUser.value?.name ||
    ''
  )
    .trim()
    .toLowerCase()
})

function canManageTemplateItem(item: LetterTemplateItem) {
  const role = (currentUser.value?.role || authStore.role || '').toUpperCase()

  if (role === 'ADMIN') {
    return true
  }

  if (!MANAGE_TEMPLATE_ROLES.includes(role)) {
    return false
  }

  if (currentUserId.value !== null && Number(item.created_by) === currentUserId.value) {
    return true
  }

  const ownerName = (item.created_by_name || '').trim().toLowerCase()
  return Boolean(ownerName && ownerName === currentUserName.value)
}

const totalTemplates = computed(() => {
  return pagination.value?.total_data || templates.value.length
})

const totalTemplatesByRole = computed(() => {
  return totalTemplates.value
})

function clearSuccessTimer() {
  if (successTimer) {
    clearTimeout(successTimer)
    successTimer = null
  }
}

function showSuccessMessage(message: string) {
  successMessage.value = message

  clearSuccessTimer()

  successTimer = setTimeout(() => {
    successMessage.value = ''
    successTimer = null
  }, SUCCESS_ALERT_DURATION)
}

function clearSuccessMessage() {
  successMessage.value = ''
  clearSuccessTimer()
}

function handleRouteSuccessMessage() {
  const success = route.query.success

  if (typeof success !== 'string' || !success.trim()) return

  showSuccessMessage(success)

  const nextQuery = { ...route.query }
  delete nextQuery.success

  router.replace({
    path: route.path,
    query: nextQuery,
  })
}

function buildParams(): FetchTemplatesParams {
  const [sort_by, order] = sortValue.value.split('-') as [
    'created_at' | 'nama_template',
    'asc' | 'desc',
  ]

  return {
    q: search.value.trim() || undefined,
    jenis: jenisFilter.value || undefined,
    is_active: statusFilter.value
      ? (statusFilter.value as 'true' | 'false')
      : undefined,
    page: currentPage.value,
    limit: limit.value,
    sort_by,
    order,
  }
}

function formatJenis(jenis: string) {
  if (jenis === 'KEAGAMAAN') return 'Keagamaan'
  if (jenis === 'KESISWAAN') return 'Kesiswaan'
  if (jenis === 'AKADEMIK') return 'Akademik'
  return jenis
}

function formatDate(value?: string) {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })
}

function stripHtml(html: string | null | undefined) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}


function getTemplateDescription(item: LetterTemplateItem) {
  stripHtml(item.konten_template)

  if (item.template_mode === 'MANUAL') {
    return `Template ${formatJenis(item.jenis).toLowerCase()} dengan variabel dinamis.`
  }

  if (item.template_mode === 'DOCX') {
    return `Template ${formatJenis(item.jenis).toLowerCase()} dalam format DOCX siap digunakan.`
  }

  return 'Template surat siap digunakan.'
}

function getCreatedByLabel(item: LetterTemplateItem) {
  if (item.created_by_name && item.created_by_name.trim()) {
    return item.created_by_name
  }

  if (!item.created_by) {
    return 'Admin'
  }

  return `User #${item.created_by}`
}

async function fetchData() {
  generalError.value = ''

  const result = await templateStore.fetchTemplates(buildParams())

  if (!result.ok) {
    generalError.value = result.error || 'Gagal mengambil daftar template.'
  }
}

function handleApplyFilter() {
  currentPage.value = 1
  fetchData()
}

function handleResetFilter() {
  search.value = ''
  statusFilter.value = ''
  jenisFilter.value = ''
  sortValue.value = 'created_at-desc'
  currentPage.value = 1
  fetchData()
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchData()
}

async function handlePreview(item: LetterTemplateItem) {
  generalError.value = ''
  templateStore.clearSelectedTemplate()
  isPreviewModalOpen.value = true

  const result = await templateStore.fetchTemplateDetail(item.id_template)

  if (!result.ok) {
    generalError.value = result.error || 'Gagal mengambil detail template.'
  }
}

function handleDelete(id: number) {
  selectedTemplateIdToDelete.value = id
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
  selectedTemplateIdToDelete.value = null
}

async function confirmDeleteTemplate() {
  if (!selectedTemplateIdToDelete.value) return

  generalError.value = ''
  clearSuccessMessage()

  const result = await templateStore.deleteTemplate(selectedTemplateIdToDelete.value)

  if (!result.ok) {
    generalError.value = result.error || 'Gagal menghapus template.'
    closeDeleteModal()
    return
  }

  showSuccessMessage(result.message || 'Template surat berhasil dihapus.')
  closeDeleteModal()

  if (templates.value.length === 0 && currentPage.value > 1) {
    currentPage.value -= 1
  }

  await fetchData()
}

function openToggleModal(item: LetterTemplateItem) {
  selectedTemplateToToggle.value = item
  isToggleModalOpen.value = true
}

function closeToggleModal() {
  isToggleModalOpen.value = false
  selectedTemplateToToggle.value = null
}

async function confirmToggleTemplate() {
  if (!selectedTemplateToToggle.value) return

  generalError.value = ''
  clearSuccessMessage()

  const nextStatus = !selectedTemplateToToggle.value.is_active
  const result = await templateStore.toggleTemplateStatus(
    selectedTemplateToToggle.value.id_template,
    nextStatus
  )

  if (!result.ok) {
    generalError.value = result.error || 'Gagal mengubah status template.'
    closeToggleModal()
    return
  }

  showSuccessMessage(
    nextStatus
      ? 'Template berhasil diaktifkan.'
      : 'Template berhasil dinonaktifkan.'
  )

  closeToggleModal()
  await fetchData()
}

function goToEdit(idTemplate: number) {
  router.push(`/letter_templates/${idTemplate}/edit`)
}

function handleClosePreviewModal(value: boolean) {
  isPreviewModalOpen.value = value

  if (!value) {
    templateStore.clearSelectedTemplate()
  }
}

const toggleModalTitle = computed(() => {
  return selectedTemplateToToggle.value?.is_active ? 'Nonaktifkan Template' : 'Aktifkan Template'
})

const toggleModalDescription = computed(() => {
  return selectedTemplateToToggle.value?.is_active
    ? 'Apakah Anda yakin ingin menonaktifkan template ini? Template nonaktif tidak dapat digunakan.'
    : 'Apakah Anda yakin ingin mengaktifkan template ini? Template akan kembali dapat digunakan.'
})

onMounted(() => {
  handleRouteSuccessMessage()
  fetchData()
})
</script>

<template>
  <DashboardLayout>
      <template #sidebar>
        <SIMPSidebar />
      </template>

    <main class="flex-1 px-4 py-8 overflow-y-auto md:px-8 lg:px-10">
      <section class="mb-6 flex flex-col gap-2">
        <h1 class="text-[24px] font-bold leading-[120%] text-[#111827] md:text-[28px]">
          Manajemen Template Surat
        </h1>
        <p class="text-[13px] leading-[145%] text-[#858a91] md:text-[14px]">
          Pilih template surat sesuai kebutuhan Anda
        </p>

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
          @close="clearSuccessMessage"
        />
      </section>

      <section class="mb-8">
        <div class="rounded-[24px] border border-[#d9e2e7] bg-white/80 px-5 py-5 shadow-sm">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <Filter class="h-6 w-6 text-[#111827]" />
              <h2 class="text-[18px] font-bold leading-[120%] text-[#111827]">
                Filter Template
              </h2>
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[13px] font-semibold leading-[120%] text-[#111827]">
                Pencarian
              </label>
              <VInputField
                v-model="search"
                state="search"
                placeholder="Cari template berdasarkan nama"
                @keydown.enter="handleApplyFilter"
              />
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div class="flex flex-col gap-2">
                <label class="text-[13px] font-semibold leading-[120%] text-[#111827]">
                  Jenis
                </label>
                <VDropdown
                  v-model="jenisFilter"
                  :options="jenisOptions"
                  placeholder="Pilih jenis"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-[13px] font-semibold leading-[120%] text-[#111827]">
                  Status
                </label>
                <VDropdown
                  v-model="statusFilter"
                  :options="statusOptions"
                  placeholder="Pilih status"
                />
              </div>

              <div class="flex flex-col gap-2">
                <label class="text-[13px] font-semibold leading-[120%] text-[#111827]">
                  Urutkan
                </label>
                <VDropdown
                  v-model="sortValue"
                  :options="sortOptions"
                  placeholder="Pilih urutan"
                />
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-end gap-3">
              <VButton
                variant="primary"
                class="!h-[42px] !rounded-full !px-5 !text-[14px]"
                @click="handleApplyFilter"
              >
                Terapkan Filter
              </VButton>

              <VButton
                variant="secondary"
                class="!h-[42px] !rounded-full !px-5 !text-[14px]"
                @click="handleResetFilter"
              >
                <template #leftIcon>
                  <RotateCcw class="h-4 w-4" />
                </template>
                Reset
              </VButton>
            </div>
          </div>
        </div>
      </section>

      <section class="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div
          class="relative h-[128px] overflow-hidden rounded-[28px] border border-[#d9e2e7] bg-[#eef5f0] shadow-sm"
        >
          <div class="absolute bottom-0 left-0 opacity-90">
            <img
              :src="mailIcon"
              alt="Mail Icon"
              class="h-[78px] w-[78px] object-contain translate-x-[-10px] translate-y-[10px]"
            />
          </div>

          <div class="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
            <p class="text-[14px] font-semibold text-[#111827]">
              Total Semua Template
            </p>
            <h2 class="mt-4 text-[24px] font-bold text-[#111827]">
              {{ totalTemplates }}
            </h2>
          </div>
        </div>

        <div
          class="relative h-[128px] overflow-hidden rounded-[28px] border border-[#d9e2e7] bg-[#eef5f0] shadow-sm"
        >
          <div class="absolute bottom-0 left-0 opacity-70">
            <img
              :src="studentIcon"
              alt="Student Icon"
              class="h-[78px] w-[78px] object-contain translate-x-[-10px] translate-y-[10px]"
            />
          </div>

          <div class="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
            <p class="text-[14px] font-semibold text-[#111827]">
              Total Template Sesuai Role
            </p>
            <h2 class="mt-4 text-[24px] font-bold text-[#111827]">
              {{ totalTemplatesByRole }}
            </h2>
          </div>
        </div>
      </section>

      <section class="mb-4">
        <h2 class="text-[20px] font-bold leading-[120%] text-[#111827] md:text-[18px]">
          Daftar Template Surat
        </h2>
      </section>

      <section
        v-if="isLoading"
        class="rounded-[28px] border border-[#d9e2e7] bg-white/80 px-6 py-10 text-center text-[#858a91]"
      >
        Memuat data template...
      </section>

      <section
        v-else-if="templates.length === 0"
        class="rounded-[28px] border border-[#d9e2e7] bg-white/80 px-6 py-10 text-center text-[#858a91]"
      >
        Belum ada template surat.
      </section>

      <section
        v-else
        class="rounded-[28px] border border-[#e5ece7] bg-white/60 p-4 md:p-5"
      >
        <div class="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <article
            v-for="item in templates"
            :key="item.id_template"
            class="relative min-h-[220px] rounded-[28px] border border-[#d9e2e7] bg-[#eef5f0] px-5 py-4 shadow-[0px_2px_10px_rgba(17,24,39,0.06)] transition hover:-translate-y-[2px] hover:shadow-[0px_6px_18px_rgba(17,24,39,0.08)]"
          >
            <button
              v-if="canManageTemplateItem(item)"
              type="button"
              class="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#7b8087] transition hover:bg-[#fef3f2] hover:text-[#b42318]"
              @click="handleDelete(item.id_template)"
            >
              <Trash2 class="h-4 w-4" />
            </button>

            <div class="mb-4">
              <span
                class="inline-flex rounded-full bg-[#4a8b50] px-3 py-[5px] text-[12px] font-semibold leading-none text-white shadow-[0px_1px_2px_rgba(0,0,0,0.08)]"
              >
                {{ formatJenis(item.jenis) }}
              </span>
            </div>

            <div class="pr-10">
              <h3 class="line-clamp-2 text-[18px] font-bold leading-[125%] text-[#111827]">
                {{ item.nama_template }}
              </h3>

              <p class="mt-4 line-clamp-3 text-[14px] leading-[155%] text-[#2f3743]">
                {{ getTemplateDescription(item) }}
              </p>
            </div>

            <div class="mt-5 flex flex-col gap-[2px] text-[12px] leading-[155%] text-[#9ba3ad]">
              <p>Dibuat oleh: {{ getCreatedByLabel(item) }}</p>
              <p>Terakhir diubah: {{ formatDate(item.updated_at || item.created_at) }}</p>
            </div>

            <div class="mt-6 flex flex-wrap items-center gap-3">
              <VActionButton
                variant="secondary"
                @click="handlePreview(item)"
              >
                Lihat Template
              </VActionButton>

              <VActionButton
                v-if="canManageTemplateItem(item)"
                variant="primary"
                @click="goToEdit(item.id_template)"
              >
                Edit
              </VActionButton>

              <div v-if="canManageTemplateItem(item)" class="flex items-center gap-2">
                <button
                  type="button"
                  :title="item.is_active ? 'Nonaktifkan template' : 'Aktifkan template'"
                  :class="[
                    'relative h-[40px] rounded-full border border-[#d9e2e7] shadow-sm transition-all duration-300',
                    item.is_active ? 'w-[95px] bg-[#4A8B50]' : 'w-[125px] bg-[#F3F4F6]',
                  ]"
                  @click.stop="openToggleModal(item)"
                >
                  <span
                    class="absolute top-1/2 -translate-y-1/2 text-[12px] font-semibold transition-all duration-300"
                    :class="
                      item.is_active
                        ? 'left-[18px] text-[#F8FAFC]'
                        : 'right-[16px] text-[#111827]'
                    "
                  >
                    {{ item.is_active ? 'Aktif' : 'Non-Aktif' }}
                  </span>

                  <span
                    class="absolute top-[3px] h-[32px] w-[32px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition-all duration-300"
                    :class="item.is_active ? 'right-[4px]' : 'left-[4px]'"
                  />
                </button>
              </div>

              <span class="text-[12px] font-medium text-[#9aa1a9]">
                {{ item.template_mode }}
              </span>
            </div>
          </article>
        </div>
      </section>

      <section class="mt-6">
        <div class="flex flex-col gap-3 px-2 md:flex-row md:items-center md:justify-between">
          <span class="text-sm text-[#858a91]">
            Menampilkan halaman {{ pagination?.page || 1 }} dari {{ pagination?.total_pages || 1 }}
          </span>

          <VPagination
            v-model:current-page="currentPage"
            :total-pages="pagination?.total_pages || 1"
            @update:current-page="handlePageChange"
          />
        </div>
      </section>
    </main>

    <TemplatePreviewModal
      :isOpen="isPreviewModalOpen"
      :template="previewTemplate"
      :isLoading="templateStore.isFetchingDetail"
      @update:isOpen="handleClosePreviewModal"
    />

    <VModal
      v-model:isOpen="isDeleteModalOpen"
      title="Hapus Template"
      description="Apakah Anda yakin ingin menghapus template ini? Template yang dihapus tidak akan tampil lagi pada daftar template."
      :maxWidthClass="'max-w-[420px]'"
      :buttons="[
        {
          label: 'Batal',
          variant: 'secondary',
          action: closeDeleteModal,
        },
        {
          label: 'Hapus',
          variant: 'primary',
          action: confirmDeleteTemplate,
        },
      ]"
    >
      <template #icon>
        <div class="flex items-center justify-center w-[72px] h-[72px] rounded-full bg-[#f9dede]">
          <Trash2 class="w-[32px] h-[32px] text-[#d92d20]" />
        </div>
      </template>
    </VModal>

    <VModal
      v-model:isOpen="isToggleModalOpen"
      :title="toggleModalTitle"
      :description="toggleModalDescription"
      :maxWidthClass="'max-w-[420px]'"
      :buttons="[
        {
          label: 'Batal',
          variant: 'secondary',
          action: closeToggleModal,
        },
        {
          label: selectedTemplateToToggle?.is_active ? 'Nonaktifkan' : 'Aktifkan',
          variant: 'primary',
          action: confirmToggleTemplate,
        },
      ]"
    />
  </DashboardLayout>
</template>
