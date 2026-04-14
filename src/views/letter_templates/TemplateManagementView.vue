<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import {
  FileText,
  PlusCircle,
  Settings,
  CircleHelp,
  LogOut,
  Trash2,
  Search,
  RotateCcw,
  Filter,
} from 'lucide-vue-next'

import { useAuthStore } from '@/stores/users/auth'
import mailIcon from '@/assets/mail.png'
import studentIcon from '@/assets/Siswa SVG.svg'
import VSidebar from '@/components/common/VSidebar.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VButton from '@/components/common/VButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import TemplatePreviewModal from '@/views/letter_templates/TemplatePreviewModal.vue'
import { useLetterTemplateStore, type TemplateItem } from '@/stores/letter_templates'

const templateStore = useLetterTemplateStore()
const authStore = useAuthStore()

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

const search = ref('')
const statusFilter = ref('true')
const jenisFilter = ref('')
const sortValue = ref('created_at-desc')
const currentPage = ref(1)
const limit = ref(4)

const generalError = ref('')
const successMessage = ref('')
const isPreviewModalOpen = ref(false)

const templates = computed(() => templateStore.templates)
const pagination = computed(() => templateStore.pagination)
const previewTemplate = computed(() => templateStore.selectedTemplate)

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

  return (
    authAny.user ||
    authAny.currentUser ||
    null
  )
})

const currentUserId = computed<number | null>(() => {
  const rawId =
    currentUser.value?.id ??
    currentUser.value?.id_user ??
    currentUser.value?.user_id ??
    currentUser.value?.id_usersimp ??
    null

  if (rawId === null || rawId === undefined || rawId === '') return null

  const parsed = Number(rawId)
  return Number.isNaN(parsed) ? null : parsed
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
  return (
    currentUser.value?.email ||
    authStore.user?.email ||
    '-'
  )
})

const totalTemplates = computed(() => {
  return templateStore.pagination?.total_data || templates.value.length
})

const totalTemplatesByRole = computed(() => {
  return templateStore.pagination?.total_data || templates.value.length
})

const canManageTemplate = computed(() => {
  const allowedRoles = ['ADMIN', 'BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK']
  return allowedRoles.includes(authStore.role || currentUser.value?.role || '')
})

function normalizeSearchValue(value: string) {
  return value.trim()
}

function getSortParams() {
  const [sort_by, order] = sortValue.value.split('-') as [
    'created_at' | 'nama_template',
    'asc' | 'desc',
  ]

  return { sort_by, order }
}

async function fetchData() {
  generalError.value = ''
  successMessage.value = ''

  const { sort_by, order } = getSortParams()
  const normalizedSearch = normalizeSearchValue(search.value)

  const result = await templateStore.fetchTemplates({
    q: normalizedSearch || undefined,
    is_active: statusFilter.value ? (statusFilter.value as 'true' | 'false') : undefined,
    jenis: jenisFilter.value || undefined,
    page: currentPage.value,
    limit: limit.value,
    sort_by,
    order,
  })

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
  statusFilter.value = 'true'
  jenisFilter.value = ''
  sortValue.value = 'created_at-desc'
  currentPage.value = 1
  fetchData()
}

function goToPreviousPage() {
  if (!pagination.value || pagination.value.page <= 1) return
  currentPage.value -= 1
  fetchData()
}

function goToNextPage() {
  if (!pagination.value || pagination.value.page >= pagination.value.total_pages) return
  currentPage.value += 1
  fetchData()
}

function formatJenis(jenis: string) {
  if (jenis === 'KEAGAMAAN') return 'Keagamaan'
  if (jenis === 'KESISWAAN') return 'Kesiswaan'
  if (jenis === 'AKADEMIK') return 'Akademik'
  return jenis
}

function formatDate(value: string) {
  if (!value) return '-'

  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  })
}

function stripHtml(html: string | null) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

function getTemplateDescription(item: TemplateItem) {
  const text = stripHtml(item.konten_template)

  if (text) return text

  if (item.template_mode === 'DOCX') {
    return `Template ${formatJenis(item.jenis).toLowerCase()} dalam format DOCX siap digunakan.`
  }

  return 'Template surat siap digunakan.'
}

function getCreatedByLabel(item: TemplateItem) {
  if (!item.created_by) {
    return 'Admin'
  }

  if (currentUserId.value && Number(item.created_by) === currentUserId.value) {
    return userName.value
  }

  return `User #${item.created_by}`
}

async function handlePreview(item: TemplateItem) {
  generalError.value = ''
  templateStore.clearSelectedTemplate()
  isPreviewModalOpen.value = true

  const result = await templateStore.fetchTemplateDetail(item.id_template)

  if (!result.ok) {
    generalError.value = result.error || 'Gagal mengambil detail template.'
  }
}

async function handleDelete(idTemplate: number) {
  const confirmed = window.confirm('Apakah Anda yakin ingin menghapus template ini?')
  if (!confirmed) return

  generalError.value = ''
  successMessage.value = ''

  const result = await templateStore.deleteTemplate(idTemplate)

  if (!result.ok) {
    generalError.value = result.error || 'Gagal menghapus template.'
    return
  }

  successMessage.value = result.message || 'Template surat berhasil dihapus.'
  await fetchData()
}

function handleClosePreviewModal(value: boolean) {
  isPreviewModalOpen.value = value
  if (!value) {
    templateStore.clearSelectedTemplate()
  }
}

onMounted(() => {
  fetchData()
})
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
      <section class="mb-6 flex flex-col gap-2">
        <h1 class="text-[24px] md:text-[28px] font-bold leading-[120%] text-[#111827]">
          Manajemen Template Surat
        </h1>
        <p class="text-[13px] md:text-[14px] leading-[145%] text-[#858a91]">
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
          @close="successMessage = ''"
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

              <div class="relative">
                <Search
                  class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b2b5ba]"
                />
                <input
                  v-model="search"
                  type="text"
                  placeholder="Cari template berdasarkan nama"
                  class="h-[46px] w-full rounded-[14px] border border-[#d9e2e7] bg-white pl-12 pr-4 text-[16px] text-[#111827] outline-none transition placeholder:text-[#b2b5ba] focus:border-[#3f9760]"
                  @keyup.enter="handleApplyFilter"
                />
              </div>
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
        <div class="relative h-[128px] overflow-hidden rounded-[28px] border border-[#d9e2e7] bg-[#eef5f0] shadow-sm">
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

        <div class="relative h-[128px] overflow-hidden rounded-[28px] border border-[#d9e2e7] bg-[#eef5f0] shadow-sm">
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
        <h2 class="text-[20px] md:text-[18px] font-bold leading-[120%] text-[#111827]">
          Daftar Template Surat
        </h2>
      </section>

      <section
        v-if="templateStore.isFetchingTemplates"
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
              v-if="canManageTemplate"
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
              <h3 class="text-[18px] font-bold leading-[125%] text-[#111827] line-clamp-2">
                {{ item.nama_template }}
              </h3>

              <p class="mt-4 text-[14px] leading-[155%] text-[#2f3743] line-clamp-3">
                {{ getTemplateDescription(item) }}
              </p>
            </div>

            <div class="mt-5 flex flex-col gap-[2px] text-[12px] leading-[155%] text-[#9ba3ad]">
              <p>Dibuat oleh: {{ getCreatedByLabel(item) }}</p>
              <p>Terakhir diubah: {{ formatDate(item.created_at) }}</p>
            </div>

            <div class="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="rounded-full border border-[#dde3e8] bg-white px-3 py-[8px] text-[13px] font-medium text-[#111827] transition hover:bg-[#f8fafc]"
                @click="handlePreview(item)"
              >
                Lihat Template
              </button>

              <span
                class="inline-flex rounded-full px-2.5 py-[5px] text-[11px] font-semibold leading-none"
                :class="
                  item.is_active
                    ? 'bg-[#dff3e5] text-[#2f7a4b]'
                    : 'bg-[#fef2f2] text-[#b42318]'
                "
              >
                {{ item.is_active ? 'Aktif' : 'Nonaktif' }}
              </span>

              <span class="text-[12px] font-medium text-[#9aa1a9]">
                {{ item.template_mode }}
              </span>
            </div>
          </article>
        </div>
      </section>

      <section class="mt-6">
        <div class="mt-3 flex items-center justify-between px-2 text-sm text-[#858a91]">
          <span>
            Menampilkan halaman {{ pagination?.page || 1 }} dari {{ pagination?.total_pages || 1 }}
          </span>

          <div class="flex items-center gap-4">
            <button
              type="button"
              class="disabled:opacity-50"
              :disabled="!pagination || pagination.page <= 1"
              @click="goToPreviousPage"
            >
              Sebelumnya
            </button>
            <span class="font-semibold text-[#111827]">{{ pagination?.page || 1 }}</span>
            <button
              type="button"
              class="disabled:opacity-50"
              :disabled="!pagination || pagination.page >= pagination.total_pages"
              @click="goToNextPage"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </section>
    </main>

    <TemplatePreviewModal
      :isOpen="isPreviewModalOpen"
      :template="previewTemplate"
      :isLoading="templateStore.isFetchingDetail"
      @update:isOpen="handleClosePreviewModal"
    />
  </div>
</template>