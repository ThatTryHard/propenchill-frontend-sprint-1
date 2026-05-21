<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  Bell,
  FileText,
  HelpCircle,
  InfoIcon,
  LogOut,
  Mail,
  Plus,
  Save,
  Settings,
  Shield,
  Trash2,
  User,
  Users,
} from 'lucide-vue-next'

import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import LogoutConfirmationModal from '@/components/common/LogoutConfirmationModal.vue'
import StatCard from '@/components/common/StatCard.vue'
import VAccordion from '@/components/common/VAccordion.vue'
import VActionButton from '@/components/common/VActionButton.vue'
import VAlert from '@/components/common/VAlert.vue'
import VButton from '@/components/common/VButton.vue'
import VCard from '@/components/common/VCard.vue'
import VChip from '@/components/common/VChip.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VInputField from '@/components/common/VInputField.vue'
import VInputFile from '@/components/common/VInputFile.vue'
import VModal from '@/components/common/VModal.vue'
import VOTPInput from '@/components/common/VOTPInput.vue'
import VPagination from '@/components/common/VPagination.vue'
import VSidebar from '@/components/common/VSidebar.vue'
import VSteps from '@/components/common/VSteps.vue'
import VTab from '@/components/common/VTab.vue'
import VTable from '@/components/common/VTable.vue'
import VTextareaField from '@/components/common/VTextareaField.vue'
import VToast from '@/components/common/VToast.vue'
import VTooltip from '@/components/common/VTooltip.vue'

import simpLogo from '@/assets/SIMP_logo.png'

const selectedDropdown = ref('profile')
const selectedDisabledDropdown = ref('')
const selectedTab = ref('preference')
const currentPage = ref(1)

const showModal = ref(false)
const showConfirmModal = ref(false)
const showLogoutModal = ref(false)

const inputDefault = ref('')
const inputPassword = ref('')
const inputSuccess = ref('Choco Addict')
const inputError = ref('Matcha Addict')
const inputSearch = ref('')

const textareaDefault = ref('')
const textareaSuccess = ref('Data berhasil divalidasi.')
const textareaError = ref('Data belum sesuai format.')

const otpValue = ref('')
const uploadedFile = ref<File | null>(null)

const alertVisible = ref(false)
const alertType = ref<'success' | 'error' | 'warning' | 'information'>('success')
const alertTitle = ref('Success Alert')
const alertMessage = ref('You have successfully updated your profile.')

const dropdownOptions = [
  { label: 'Profil', value: 'profile' },
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'Kelola Staff', value: 'staff' },
  { label: 'Pengajuan Surat', value: 'letter' },
  { label: 'Settings', value: 'settings' },
  { label: 'Log Aktivitas', value: 'log' },
  { label: 'Bantuan', value: 'help' },
]

const tabOptions = [
  { label: 'Preference', value: 'preference' },
  { label: 'Security', value: 'security' },
  { label: 'Notification', value: 'notification' },
  { label: 'Account', value: 'account' },
  { label: 'Access', value: 'access' },
  { label: 'History', value: 'history' },
  { label: 'Help', value: 'help' },
]

const tableColumns = [
  { key: 'no', label: 'No' },
  { key: 'nama', label: 'Nama' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Aksi', align: 'center' as const },
]

const tableRows = [
  {
    id: 1,
    no: 1,
    nama: 'Kepala Sekolah',
    email: 'kepsek@gmail.com',
    role: 'KEPSEK',
    status: 'Aktif',
  },
  {
    id: 2,
    no: 2,
    nama: 'Wakil Bidang Kesiswaan',
    email: 'kesiswaan@gmail.com',
    role: 'BIDANG_KESISWAAN',
    status: 'Aktif',
  },
  {
    id: 3,
    no: 3,
    nama: 'Admin SIMP',
    email: 'admin@simp.sch.id',
    role: 'ADMIN',
    status: 'Menunggu',
  },
]

const stepItems = [
  {
    label: 'Diajukan',
    timestamp: '10.00',
    subtitle: 'Surat dibuat',
    status: 'completed' as const,
  },
  {
    label: 'Review',
    timestamp: '10.20',
    subtitle: 'Diproses staff',
    status: 'completed' as const,
  },
  {
    label: 'Approval',
    timestamp: '11.00',
    subtitle: 'Menunggu kepsek',
    status: 'current' as const,
  },
  {
    label: 'Selesai',
    timestamp: '-',
    subtitle: 'Belum selesai',
    status: 'upcoming' as const,
  },
]

const sidebarNavItems = [
  {
    name: 'parents',
    label: 'Kelola Wali Murid',
    path: '/admin/parents',
    icon: Users,
  },
  {
    name: 'staff',
    label: 'Kelola Akun Staff',
    path: '/admin/staff',
    icon: Shield,
  },
  {
    name: 'letters',
    label: 'Pengajuan Surat',
    path: '/admin/letters',
    icon: FileText,
  },
]

const sidebarBottomItems = [
  {
    name: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
  {
    name: 'logout',
    label: 'Log Out',
    icon: LogOut,
    action: () => {
      showLogoutModal.value = true
    },
  },
]

const modalButtons = computed(
  (): Array<{ label: string; variant: 'primary' | 'secondary' | 'tertiary'; action: () => void }> => [
    {
      label: 'Simpan',
      variant: 'primary',
      action: () => {
        showModal.value = false
      },
    },
    {
      label: 'Batal',
      variant: 'secondary',
      action: () => {
        showModal.value = false
      },
    },
  ],
)

const showAlert = (type: 'success' | 'error' | 'warning' | 'information') => {
  alertType.value = type
  alertVisible.value = true

  if (type === 'success') {
    alertTitle.value = 'Success Alert'
    alertMessage.value = 'You have successfully updated your profile.'
  }

  if (type === 'error') {
    alertTitle.value = 'Error Alert'
    alertMessage.value = 'Something went wrong with your profile.'
  }

  if (type === 'warning') {
    alertTitle.value = 'Warning Alert'
    alertMessage.value = 'Please update your profile with cautious.'
  }

  if (type === 'information') {
    alertTitle.value = 'Information Alert'
    alertMessage.value = 'You can update your profile every 48 hours.'
  }
}
</script>

<template>
  <div class="playground-page">
    <header class="playground-header">
      <div>
        <p class="playground-eyebrow">Design System Preview</p>
        <h1 class="playground-title">Common Components Playground</h1>
        <p class="playground-subtitle">
          Halaman ini dipakai untuk mengetes reusable components terhadap light mode, dark mode,
          dan text size preference.
        </p>
      </div>

      <VButton variant="primary" @click="showAlert('success')">
        <template #leftIcon>
          <Settings :size="18" />
        </template>
        Test Alert
      </VButton>
    </header>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Button</h2>
        <p>VButton primary, secondary, tertiary, icon, dan disabled state.</p>
      </div>

      <div class="component-row">
        <VButton variant="primary">
          <template #leftIcon>
            <Plus :size="18" />
          </template>
          Primary
        </VButton>

        <VButton variant="secondary">
          <template #leftIcon>
            <Save :size="18" />
          </template>
          Secondary
        </VButton>

        <VButton variant="tertiary">Tertiary</VButton>

        <VButton variant="primary" disabled>Disabled</VButton>
      </div>
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Action Button</h2>
        <p>VActionButton memakai style dasar dari VButton, tetapi ukurannya lebih kecil.</p>
      </div>

      <div class="component-row">
        <VActionButton variant="primary">
          Primary Action
        </VActionButton>

        <VActionButton variant="secondary">
          Secondary Action
        </VActionButton>

        <VActionButton variant="primary" disabled>
          Disabled Action
        </VActionButton>
      </div>
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Chip</h2>
        <p>Variant chip untuk status dan kategori.</p>
      </div>

      <div class="component-row">
        <VChip label="Primary" variant="primary" />
        <VChip label="Secondary" variant="secondary" />
        <VChip label="Tertiary" variant="tertiary" />
        <VChip label="Warning" variant="warning" />
        <VChip label="Deep" variant="secondary">
          <template #icon>
            <InfoIcon :size="16" />
          </template>
        </VChip>
      </div>
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Card & Stat Card</h2>
        <p>VCard default, VCard dengan actions, dan StatCard.</p>
      </div>

      <div class="card-grid">
        <VCard>
          <div class="custom-card-content">
            <h3>Custom VCard</h3>
            <p>
              Ini contoh VCard sebagai wrapper bebas. Text dan warna mengikuti main.css.
            </p>
          </div>
        </VCard>

        <VCard
          title="Structured VCard"
          description="Card ini memakai props title, description, dan button action."
          :show-asset="false"
          primary-button-text="Primary"
          secondary-button-text="Secondary"
        />

        <StatCard
          title="Total"
          value="128"
          :icon-src="simpLogo"
          icon-alt="SIMP"
        />
      </div>
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Dropdown</h2>
        <p>Dropdown normal, empty state, dan disabled state.</p>
      </div>

      <div class="component-grid">
        <VDropdown
          v-model="selectedDropdown"
          :options="dropdownOptions"
          placeholder="Pilih halaman"
        />

        <VDropdown
          :options="[]"
          placeholder="Dropdown kosong"
        />

        <VDropdown
          v-model="selectedDisabledDropdown"
          :options="dropdownOptions"
          placeholder="Dropdown disabled"
          disabled
        />
      </div>
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Input Field</h2>
        <p>Default, password, search, disabled, error, dan success state.</p>
      </div>

      <div class="component-grid">
        <VInputField
          v-model="inputDefault"
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
        />

        <VInputField
          v-model="inputPassword"
          label="Kata Sandi"
          type="password"
          placeholder="Masukkan kata sandi"
        />

        <VInputField
          v-model="inputSearch"
          state="search"
          placeholder="Cari nama staff..."
        />

        <VInputField
          label="Disabled Input"
          placeholder="Input tidak aktif"
          disabled
        />

        <VInputField
          v-model="inputError"
          label="Username Error"
          placeholder="Matcha Addict"
          state="error"
          message="No User Found"
        />

        <VInputField
          v-model="inputSuccess"
          label="Username Success"
          placeholder="Choco Addict"
          state="success"
          message="Confirmed Username"
        />
      </div>
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Textarea Field</h2>
        <p>Default, disabled, error, dan success state.</p>
      </div>

      <div class="component-grid">
        <VTextareaField
          v-model="textareaDefault"
          label="Catatan"
          placeholder="Tulis catatan di sini..."
        />

        <VTextareaField
          label="Catatan Disabled"
          placeholder="Tidak dapat diisi"
          disabled
        />

        <VTextareaField
          v-model="textareaError"
          label="Catatan Error"
          state="error"
          message="Catatan belum sesuai format."
        />

        <VTextareaField
          v-model="textareaSuccess"
          label="Catatan Success"
          state="success"
          message="Catatan berhasil divalidasi."
        />
      </div>
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Input File & OTP</h2>
        <p>Upload file, loading upload, validation state, dan OTP input.</p>
      </div>

      <div class="component-grid">
        <VInputFile
          accept=".pdf,.doc,.docx,image/*"
          file-types-text="PDF, DOCX, or image"
          :max-size-mb="5"
          @update:modelValue="uploadedFile = $event"
        />

        <div class="otp-card">
          <VOTPInput v-model="otpValue" />

          <VOTPInput
            model-value="123456"
            disabled
          />
        </div>
      </div>
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Tabs</h2>
        <p>Test tab dengan tujuh pilihan dan horizontal scroll bila ruang tidak cukup.</p>
      </div>

      <VTab v-model="selectedTab" :options="tabOptions" />
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Accordion</h2>
        <p>Accordion default, hover, dan selected/open state bisa dites dengan klik.</p>
      </div>

      <div class="accordion-stack">
        <VAccordion
          title="What?"
          content="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
        />

        <VAccordion title="How does it work?">
          Komponen ini tetap memakai slot default, jadi kontennya bisa diisi dari parent.
        </VAccordion>
      </div>
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Steps</h2>
        <p>Completed, current, dan upcoming state.</p>
      </div>

      <VSteps :steps="stepItems" />
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Tooltip</h2>
        <p>Small dan large tooltip.</p>
      </div>

      <div class="component-row">
        <VTooltip text="Ini tooltip kecil" type="small">
          <VButton variant="tertiary">Hover Small Tooltip</VButton>
        </VTooltip>

        <VTooltip
          title="Tooltip Title"
          text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut dui orci ac egestas."
          type="large"
        >
          <VButton variant="secondary">Hover Large Tooltip</VButton>
        </VTooltip>
      </div>
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Alert</h2>
        <p>Floating alert untuk success, error, warning, dan information.</p>
      </div>

      <div class="component-row">
        <VButton variant="primary" @click="showAlert('success')">Success Alert</VButton>
        <VButton variant="secondary" @click="showAlert('error')">Error Alert</VButton>
        <VButton variant="tertiary" @click="showAlert('warning')">Warning Alert</VButton>
        <VButton variant="tertiary" @click="showAlert('information')">Info Alert</VButton>
      </div>

      <VAlert
        v-if="alertVisible"
        :type="alertType"
        :title="alertTitle"
        :message="alertMessage"
        @close="alertVisible = false"
      />
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Toast</h2>
        <p>Preview toast success, error, dan loading.</p>
      </div>

      <div class="toast-preview-grid">
        <VToast type="success" message="Success message" />
        <VToast type="error" message="Error message" />
        <VToast type="loading" message="Loading" />
      </div>
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Table & Pagination</h2>
        <p>VTable normal, empty state, loading state, dan pagination.</p>
      </div>

      <div class="table-stack">
        <VTable
          :columns="tableColumns"
          :rows="tableRows"
          :is-loading="false"
          empty-message="Tidak ada data."
        >
          <template #cell-nama="{ row }">
            <span class="table-name">{{ row.nama }}</span>
          </template>

          <template #cell-role="{ row }">
            <VChip :label="row.role" variant="tertiary" />
          </template>

          <template #cell-status="{ row }">
            <VChip
              :label="row.status"
              :variant="row.status === 'Aktif' ? 'primary' : 'warning'"
            />
          </template>

          <template #cell-actions>
            <div class="table-actions">
              <VActionButton variant="secondary">
                Detail
              </VActionButton>

              <VActionButton variant="primary">
                Hapus
              </VActionButton>
            </div>
          </template>
        </VTable>

        <VTable
          :columns="tableColumns"
          :rows="[]"
          empty-message="Tidak ada data."
        />

        <VTable
          :columns="tableColumns"
          :rows="[]"
          :is-loading="true"
          loading-message="Memuat data..."
        />
      </div>

      <div class="pagination-wrapper">
        <VPagination
          v-model:currentPage="currentPage"
          :total-pages="10"
          :sibling-count="1"
        />
      </div>
    </section>

    <section class="playground-section">
      <div class="section-heading">
        <h2>Modal</h2>
        <p>VModal, ConfirmationModal, dan LogoutConfirmationModal.</p>
      </div>

      <div class="component-row">
        <VButton variant="primary" @click="showModal = true">
          Open VModal
        </VButton>

        <VButton variant="secondary" @click="showConfirmModal = true">
          Open Confirmation
        </VButton>

        <VButton variant="tertiary" @click="showLogoutModal = true">
          Open Logout Modal
        </VButton>
      </div>
    </section>

    <section class="playground-section playground-dashboard-section">
      <div class="section-heading">
        <h2>DashboardLayout & Sidebar</h2>
        <p>Preview DashboardLayout dengan VSidebar, active item, bottom item, dan profile card.</p>
      </div>

      <div class="dashboard-preview-shell">
        <DashboardLayout>
          <template #sidebar>
            <VSidebar
              :nav-items="sidebarNavItems"
              :bottom-items="sidebarBottomItems"
              user-name="Propenchill"
              user-email="propenchill@gmail.com"
            />
          </template>

          <div class="dashboard-preview-content">
            <h3>Dashboard Content</h3>
            <p>
              Area ini hanya preview untuk memastikan layout, warna, sidebar, dan text preference
              tetap mengikuti main.css.
            </p>

            <div class="dashboard-preview-cards">
              <StatCard title="Aktif" value="32" />
              <StatCard title="Menunggu" value="12" />
            </div>
          </div>
        </DashboardLayout>
      </div>
    </section>

    <VModal
      v-model:is-open="showModal"
      title="Contoh Modal"
      description="Ini contoh modal untuk mengecek tampilan berdasarkan light mode, dark mode, dan text size."
      :buttons="modalButtons"
      max-width-class="max-w-[520px]"
    >
      <template #icon>
        <Mail class="modal-preview-icon" />
      </template>

      <div class="modal-preview-content">
        <VInputField
          label="Email"
          placeholder="nama@email.com"
        />
      </div>
    </VModal>

    <ConfirmationModal
      v-model:is-open="showConfirmModal"
      title="Hapus Data"
      description="Apakah Anda yakin ingin menghapus data ini?"
      confirm-text="Hapus"
      cancel-text="Batal"
    />

    <LogoutConfirmationModal
      v-model:is-open="showLogoutModal"
    />
  </div>
</template>

<style scoped>
.playground-page {
  min-height: 100vh;
  padding: 32px;
  background: var(--app-bg);
  color: var(--app-text);
  font-family: var(--font-sans);
}

.playground-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.playground-eyebrow {
  margin: 0 0 6px;
  color: var(--app-accent);
  font-size: var(--app-font-xs);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.playground-title {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-page-title-font);
  font-weight: 800;
  line-height: 1.2;
}

.playground-subtitle {
  max-width: 720px;
  margin: 8px 0 0;
  color: var(--app-subtext);
  font-size: var(--app-page-subtitle-font);
  line-height: 1.5;
}

.playground-section {
  margin-bottom: 24px;
  padding: 24px;
  border: 1px solid var(--app-card-border);
  border-radius: 18px;
  background: var(--app-card);
  color: var(--app-text);
}

.section-heading {
  margin-bottom: 18px;
}

.section-heading h2 {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-section-title-font);
  font-weight: 700;
}

.section-heading p {
  margin: 4px 0 0;
  color: var(--app-subtext);
  font-size: var(--app-font-sm);
  line-height: 1.5;
}

.component-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.component-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.custom-card-content h3 {
  margin: 0 0 8px;
  color: var(--app-heading);
  font-size: var(--app-card-title-font);
  font-weight: 700;
}

.custom-card-content p {
  margin: 0;
  color: var(--app-subtext);
  font-size: var(--app-card-desc-font);
  line-height: 1.5;
}

.otp-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  justify-content: center;
  padding: 24px;
  border: 1px solid var(--app-card-border);
  border-radius: 18px;
  background: var(--app-soft-card);
}

.accordion-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast-preview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  align-items: center;
}

.table-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-name {
  color: var(--app-heading);
  font-weight: 600;
}

.table-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.modal-preview-icon {
  width: 40px;
  height: 40px;
  color: var(--app-accent);
}

.modal-preview-content {
  margin-top: 16px;
}

.dashboard-preview-shell {
  height: 520px;
  overflow: hidden;
  border: 1px solid var(--app-card-border);
  border-radius: 18px;
  background: var(--app-bg);
}

.dashboard-preview-content {
  padding: 32px;
  color: var(--app-text);
}

.dashboard-preview-content h3 {
  margin: 0 0 8px;
  color: var(--app-heading);
  font-size: var(--app-section-title-font);
  font-weight: 700;
}

.dashboard-preview-content p {
  max-width: 720px;
  margin: 0 0 24px;
  color: var(--app-subtext);
  font-size: var(--app-font-sm);
  line-height: 1.5;
}

.dashboard-preview-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 260px));
  gap: 16px;
}

@media (max-width: 1024px) {
  .card-grid,
  .toast-preview-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-preview-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .playground-page {
    padding: 20px;
  }

  .playground-header {
    flex-direction: column;
  }

  .component-grid {
    grid-template-columns: 1fr;
  }
}
</style>