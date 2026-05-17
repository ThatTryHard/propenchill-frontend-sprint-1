<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Trash2, RotateCcw, Filter } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VActionButton from '@/components/common/VActionButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VButton from '@/components/common/VButton.vue'
import VPagination from '@/components/common/VPagination.vue'
import VAlert from '@/components/common/VAlert.vue'
import VModal from '@/components/common/VModal.vue'
import VCard from '@/components/common/VCard.vue'
import VChip from '@/components/common/VChip.vue'
import TemplatePreviewModal from '@/views/letter_templates/TemplatePreviewModal.vue'

import { useAuthStore } from '@/stores/users/auth'
import {
  useLetterTemplateStore,
  type LetterTemplateItem,
  type FetchTemplatesParams,
} from '@/stores/letter_templates'

import mailIcon from '@/assets/mail.png'
import studentIcon from '@/assets/Siswa SVG.svg'

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

const MANAGE_TEMPLATE_ROLES = ['ADMIN', 'BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK']

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

const currentUserId = computed<number | null>(() => {
  const possibleId =
    currentUser.value?.id ?? parseJsonSafely<{ id?: number }>(localStorage.getItem('user_data'))?.id

  if (typeof possibleId === 'number') {
    return possibleId
  }

  return null
})

const currentUserName = computed(() => {
  return (currentUser.value?.nama || currentUser.value?.full_name || currentUser.value?.name || '')
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
  const sortParts = sortValue.value.split('-')
  const sort_by = sortParts[0] as 'created_at' | 'nama_template'
  const order = sortParts[1] as 'asc' | 'desc'

  return {
    q: search.value.trim() || undefined,
    jenis: jenisFilter.value || undefined,
    is_active: statusFilter.value ? (statusFilter.value as 'true' | 'false') : undefined,
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

function getTemplateDescription(item: LetterTemplateItem) {
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
    nextStatus,
  )

  if (!result.ok) {
    generalError.value = result.error || 'Gagal mengubah status template.'
    closeToggleModal()
    return
  }

  showSuccessMessage(
    nextStatus ? 'Template berhasil diaktifkan.' : 'Template berhasil dinonaktifkan.',
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

    <main
      class="flex-1 overflow-y-auto bg-[var(--app-bg)] px-4 py-7 font-[var(--font-sans)] text-[var(--app-text)] md:px-8 lg:px-10"
    >
      <section class="mb-5 flex flex-col gap-1">
        <h1
          class="m-0 text-[length:var(--app-page-title-font)] font-bold leading-[1.2] text-[var(--app-heading)]"
        >
          Manajemen Template Surat
        </h1>

        <p
          class="m-0 text-[length:var(--app-page-subtitle-font)] leading-[1.45] text-[var(--app-muted)]"
        >
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

      <section class="mb-6">
        <VCard padding-class="p-4" class="relative z-30 overflow-visible">
          <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <Filter class="h-5 w-5 text-[var(--app-heading)]" />

              <h2
                class="m-0 text-[length:var(--app-font-lg)] font-bold leading-[1.2] text-[var(--app-heading)]"
              >
                Filter Template
              </h2>
            </div>

            <div class="flex flex-col gap-2">
              <label
                class="text-[length:var(--app-input-label-font)] font-semibold leading-[1.2] text-[var(--app-heading)]"
              >
                Pencarian
              </label>

              <VInputField
                v-model="search"
                state="search"
                placeholder="Cari template berdasarkan nama"
                @keydown.enter="handleApplyFilter"
              />
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div class="relative z-30 flex flex-col gap-2">
                <label
                  class="text-[length:var(--app-input-label-font)] font-semibold leading-[1.2] text-[var(--app-heading)]"
                >
                  Jenis
                </label>

                <VDropdown
                  v-model="jenisFilter"
                  :options="jenisOptions"
                  placeholder="Pilih jenis"
                />
              </div>

              <div class="relative z-20 flex flex-col gap-2">
                <label
                  class="text-[length:var(--app-input-label-font)] font-semibold leading-[1.2] text-[var(--app-heading)]"
                >
                  Status
                </label>

                <VDropdown
                  v-model="statusFilter"
                  :options="statusOptions"
                  placeholder="Pilih status"
                />
              </div>

              <div class="relative z-10 flex flex-col gap-2">
                <label
                  class="text-[length:var(--app-input-label-font)] font-semibold leading-[1.2] text-[var(--app-heading)]"
                >
                  Urutkan
                </label>

                <VDropdown v-model="sortValue" :options="sortOptions" placeholder="Pilih urutan" />
              </div>
            </div>

            <div class="flex flex-wrap items-center justify-end gap-3">
              <VButton variant="primary" size="sm" @click="handleApplyFilter">
                Terapkan Filter
              </VButton>

              <VButton variant="secondary" size="sm" @click="handleResetFilter">
                <template #leftIcon>
                  <RotateCcw class="h-4 w-4" />
                </template>

                Reset
              </VButton>
            </div>
          </div>
        </VCard>
      </section>

      <section class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <VCard padding-class="p-0" class="relative h-[104px] overflow-hidden">
          <div class="absolute bottom-0 left-0 opacity-90">
            <img
              :src="mailIcon"
              alt="Mail Icon"
              class="h-[58px] w-[58px] translate-x-[-8px] translate-y-[8px] object-contain"
            />
          </div>

          <div
            class="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
          >
            <p
              class="m-0 text-[length:var(--app-font-xs)] font-semibold leading-[1.3] text-[var(--app-heading)]"
            >
              Total Semua Template
            </p>

            <h2
              class="mt-2 mb-0 text-[length:var(--app-font-xl)] font-bold leading-[1.2] text-[var(--app-heading)]"
            >
              {{ totalTemplates }}
            </h2>
          </div>
        </VCard>

        <VCard padding-class="p-0" class="relative h-[104px] overflow-hidden">
          <div class="absolute bottom-0 left-0 opacity-70">
            <img
              :src="studentIcon"
              alt="Student Icon"
              class="h-[58px] w-[58px] translate-x-[-8px] translate-y-[8px] object-contain"
            />
          </div>

          <div
            class="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
          >
            <p
              class="m-0 text-[length:var(--app-font-xs)] font-semibold leading-[1.3] text-[var(--app-heading)]"
            >
              Total Template Sesuai Role
            </p>

            <h2
              class="mt-2 mb-0 text-[length:var(--app-font-xl)] font-bold leading-[1.2] text-[var(--app-heading)]"
            >
              {{ totalTemplatesByRole }}
            </h2>
          </div>
        </VCard>
      </section>

      <section class="mb-3">
        <h2
          class="m-0 text-[length:var(--app-font-lg)] font-bold leading-[1.2] text-[var(--app-heading)]"
        >
          Daftar Template Surat
        </h2>
      </section>

      <section v-if="isLoading">
        <VCard padding-class="px-6 py-8">
          <p
            class="m-0 text-center text-[length:var(--app-table-state-font)] leading-[1.5] text-[var(--app-muted)]"
          >
            Memuat data template...
          </p>
        </VCard>
      </section>

      <section v-else-if="templates.length === 0">
        <VCard padding-class="px-6 py-8">
          <p
            class="m-0 text-center text-[length:var(--app-table-state-font)] leading-[1.5] text-[var(--app-muted)]"
          >
            Belum ada template surat.
          </p>
        </VCard>
      </section>

      <section v-else>
        <VCard padding-class="p-3 md:p-4">
          <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <VCard
              v-for="item in templates"
              :key="item.id_template"
              padding-class="px-4 py-3"
              class="relative min-h-[168px] transition hover:-translate-y-[2px]"
            >
              <button
                v-if="canManageTemplateItem(item)"
                type="button"
                class="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-[var(--app-muted)] transition-colors duration-200 ease-in-out hover:bg-[var(--app-danger-bg)] hover:text-[var(--app-danger)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]"
                @click="handleDelete(item.id_template)"
              >
                <Trash2 class="h-4 w-4" />
              </button>

              <div class="mb-3">
                <VChip :label="formatJenis(item.jenis)" variant="primary" />
              </div>

              <div class="pr-9">
                <h3
                  class="line-clamp-2 text-[length:var(--app-font-base)] font-bold leading-[1.25] text-[var(--app-heading)]"
                >
                  {{ item.nama_template }}
                </h3>

                <p
                  class="mt-3 mb-0 line-clamp-2 text-[length:var(--app-font-sm)] leading-[1.5] text-[var(--app-text)]"
                >
                  {{ getTemplateDescription(item) }}
                </p>
              </div>

              <div
                class="mt-3 flex flex-col gap-[2px] text-[length:var(--app-font-xs)] leading-[1.45] text-[var(--app-muted)]"
              >
                <p class="m-0">Dibuat oleh: {{ getCreatedByLabel(item) }}</p>
                <p class="m-0">
                  Terakhir diubah: {{ formatDate(item.updated_at || item.created_at) }}
                </p>
              </div>

              <div class="mt-4 flex flex-wrap items-center gap-2">
                <VActionButton variant="secondary" @click="handlePreview(item)">
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
                      'relative h-[34px] rounded-full border border-[var(--app-card-border)] shadow-sm transition-all duration-300',
                      'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-accent)]',
                      item.is_active
                        ? 'w-[84px] bg-[var(--app-accent)]'
                        : 'w-[108px] bg-[var(--app-card)]',
                    ]"
                    @click.stop="openToggleModal(item)"
                  >
                    <span
                      :class="[
                        'absolute top-1/2 -translate-y-1/2 text-[length:var(--app-font-caption)] font-semibold transition-all duration-300',
                        item.is_active
                          ? 'left-[14px] text-[var(--app-text-inverse)]'
                          : 'right-[12px] text-[var(--app-heading)]',
                      ]"
                    >
                      {{ item.is_active ? 'Aktif' : 'Non-Aktif' }}
                    </span>

                    <span
                      :class="[
                        'absolute top-[3px] h-[28px] w-[28px] rounded-full bg-[var(--app-bg)] shadow-sm transition-all duration-300',
                        item.is_active ? 'right-[3px]' : 'left-[3px]',
                      ]"
                    />
                  </button>
                </div>

                <VChip
                  v-else
                  :label="item.is_active ? 'Aktif' : 'Nonaktif'"
                  :variant="item.is_active ? 'primary' : 'tertiary'"
                />

                <VChip :label="item.template_mode" variant="tertiary" />
              </div>
            </VCard>
          </div>
        </VCard>
      </section>

      <section class="mt-5">
        <div class="flex flex-col gap-3 px-2 md:flex-row md:items-center md:justify-between">
          <span class="text-[length:var(--app-font-sm)] leading-[1.4] text-[var(--app-muted)]">
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
        <div
          class="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[var(--app-danger-bg)]"
        >
          <Trash2 class="h-[32px] w-[32px] text-[var(--app-danger)]" />
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
