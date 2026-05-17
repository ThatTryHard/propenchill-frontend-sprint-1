<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Plus, Pencil, Trash2, UserPlus, UserCheck, UserX } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VModal from '@/components/common/VModal.vue'
import VAlert from '@/components/common/VAlert.vue'
import VTable from '@/components/common/VTable.vue'
import VChip from '@/components/common/VChip.vue'
import VActionButton from '@/components/common/VActionButton.vue'

interface AdminListItem {
  id: number
  nama: string
  email: string
  role: string
}

type AlertType = 'success' | 'error' | 'warning' | 'information'

const adminStore = useAdminStore()
const searchQuery = ref('')
const isEdit = ref(false)
const selectedId = ref<number | null>(null)

const alert = reactive({
  visible: false,
  type: 'success' as AlertType,
  title: '',
  message: '',
})

const formModal = reactive({ show: false, loading: false })
const deleteModal = reactive({ show: false, adminName: '', loading: false })

const adminColumns = [
  { key: 'no', label: 'No', nowrap: true },
  { key: 'nama', label: 'Nama' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', nowrap: true },
  { key: 'actions', label: 'Aksi', align: 'center' as const, nowrap: true },
]

const roleOptions = [
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'BIDANG AGAMA', value: 'BIDANG_AGAMA' },
  { label: 'BIDANG KESISWAAN', value: 'BIDANG_KESISWAAN' },
  { label: 'BIDANG AKADEMIK', value: 'BIDANG_AKADEMIK' },
  { label: 'KEPALA SEKOLAH', value: 'KEPSEK' },
]

const form = ref({ nama: '', email: '', role: 'ADMIN' })
const errors = ref<Record<string, string>>({})

onMounted(() => adminStore.fetchAdmins())

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    adminStore.fetchAdmins(searchQuery.value)
  }, 400)
}

const openDeleteConfirm = (admin: AdminListItem) => {
  selectedId.value = admin.id
  deleteModal.adminName = admin.nama
  deleteModal.show = true
}

const openDeleteConfirmFromRow = (row: any) => {
  openDeleteConfirm(row as AdminListItem)
}

const handleDelete = async () => {
  if (!selectedId.value) return

  deleteModal.loading = true

  try {
    await adminStore.deleteAdmin(selectedId.value)
    showAlert('success', 'Terhapus!', 'Akun berhasil dinonaktifkan.')
    deleteModal.show = false
  } catch {
    showAlert('error', 'Gagal!', 'Tidak bisa menghapus akun sendiri.')
    deleteModal.show = false
  } finally {
    deleteModal.loading = false
  }
}

const showAlert = (type: AlertType, title: string, message: string) => {
  alert.visible = true
  alert.type = type
  alert.title = title
  alert.message = message
}

const handleSave = async () => {
  errors.value = {}

  if (!form.value.nama.trim()) {
    errors.value.nama = 'Nama wajib diisi!'
    return
  }

  if (!form.value.email.trim()) {
    errors.value.email = 'Email wajib diisi!'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'Format email tidak valid! (contoh: user@mail.com)'
    return
  }

  formModal.loading = true

  try {
    if (isEdit.value && selectedId.value) {
      await adminStore.updateAdmin(selectedId.value, form.value)
      showAlert('success', 'Berhasil!', 'Data admin berhasil diperbarui.')
    } else {
      await adminStore.addAdmin(form.value)
      showAlert('success', 'Berhasil!', 'Admin baru berhasil didaftarkan.')
    }

    closeModal()
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'data' in err) {
      const apiError = err as { data?: Record<string, string> }

      if (apiError.data) {
        errors.value = apiError.data
      }
    } else {
      errors.value.email = 'Format email tidak valid!'
    }
  } finally {
    formModal.loading = false
  }
}

const closeModal = () => {
  formModal.show = false
  errors.value = {}
  form.value = { nama: '', email: '', role: 'ADMIN' }
}

const formButtons = computed(
  (): Array<{ label: string; variant: 'primary' | 'secondary'; action: () => void }> => [
    {
      label: formModal.loading
        ? 'Memproses...'
        : isEdit.value
          ? 'Simpan Perubahan'
          : 'Tambah Admin',
      variant: 'primary',
      action: () => {
        if (!formModal.loading) handleSave()
      },
    },
    {
      label: 'Batal',
      variant: 'secondary',
      action: () => {
        closeModal()
      },
    },
  ],
)

const deleteButtons = computed(
  (): Array<{ label: string; variant: 'primary' | 'secondary'; action: () => void }> => [
    {
      label: deleteModal.loading ? 'Menghapus...' : 'Hapus',
      variant: 'primary',
      action: () => {
        if (!deleteModal.loading) handleDelete()
      },
    },
    {
      label: 'Batal',
      variant: 'secondary',
      action: () => {
        deleteModal.show = false
      },
    },
  ],
)
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main
      class="
        min-h-full bg-[var(--app-bg)] px-6 pb-[18px] pt-5
        font-[var(--font-sans)] text-[var(--app-text)]
        max-[768px]:p-[18px]
      "
    >
      <div
        class="
          mx-auto flex w-full max-w-[1120px] flex-col gap-[14px]
          max-[1024px]:max-w-none
        "
      >
        <header
          class="
            flex items-start justify-between gap-[18px]
            max-[768px]:flex-col max-[768px]:items-stretch
          "
        >
          <div class="min-w-0">
            <h1
              class="
                m-0 text-[length:calc(var(--app-page-title-font)*0.88)]
                font-bold leading-[1.2] text-[var(--app-heading)]
              "
            >
              Kelola Akun Staff
            </h1>

            <p
              class="
                mt-[3px] mb-0 text-[length:calc(var(--app-page-subtitle-font)*0.88)]
                font-medium leading-[1.4] text-[var(--app-subtext)]
              "
            >
              Daftar akun pengelola sistem yang terdaftar
            </p>
          </div>

          <VButton
            variant="primary"
            class="
              min-h-[34px] shrink-0 rounded-full px-5 py-2
              text-[length:calc(var(--app-button-font)*0.9)]
              max-[768px]:w-full
            "
            @click="$router.push('/admin/management/create')"
          >
            <template #leftIcon>
              <Plus :size="16" />
            </template>

            Tambah Staff
          </VButton>
        </header>

        <VAlert
          v-if="alert.visible"
          :visible="alert.visible"
          :type="alert.type"
          :title="alert.title"
          :message="alert.message"
          @close="alert.visible = false"
        />

        <div class="flex items-center justify-between">
          <div
            class="
              w-full max-w-[320px]
              [&_.v-input-wrapper]:rounded-[11px]
              [&_.v-input]:py-2
              [&_.v-input]:text-[length:calc(var(--app-input-font)*0.9)]
              [&_.v-input--with-left-icon]:pl-[42px]
              [&_.v-input-left-icon]:left-[14px]
              [&_.v-input-icon]:h-5
              [&_.v-input-icon]:w-5
              max-[768px]:max-w-none
            "
          >
            <VInputField
              v-model="searchQuery"
              state="search"
              placeholder="Cari nama staff..."
              @update:modelValue="debouncedSearch"
            />
          </div>
        </div>

        <VTable
          class="
            w-full
            [&_.v-table-wrapper]:rounded-[14px]
            [&_.v-table-wrapper]:border-[var(--app-card-border)]
            [&_.v-table-wrapper]:bg-[var(--app-card)]
            [&_.v-table-head-cell]:px-[18px]
            [&_.v-table-head-cell]:py-[10px]
            [&_.v-table-head-cell]:text-[length:calc(var(--app-table-head-font)*0.92)]
            [&_.v-table-head-cell]:font-bold
            [&_.v-table-head-cell]:tracking-[0.05em]
            [&_.v-table-head-cell]:text-[var(--app-muted)]
            [&_.v-table-cell]:px-[18px]
            [&_.v-table-cell]:py-[10px]
            [&_.v-table-cell]:text-[length:calc(var(--app-table-cell-font)*0.9)]
            [&_.v-table-cell]:leading-[1.35]
            [&_.v-table-cell]:text-[var(--app-subtext)]
            [&_.v-table-state-cell]:px-[18px]
            [&_.v-table-state-cell]:py-7
            [&_.v-table-state-cell]:text-[length:calc(var(--app-table-cell-font)*0.9)]
            [&_.v-table-state-cell]:text-[var(--app-muted)]
          "
          :columns="adminColumns"
          :rows="adminStore.admins"
          :is-loading="adminStore.isLoading"
          loading-message="Memuat data admin..."
          empty-message="Data tidak tersedia"
        >
          <template #loading>
            Memuat data admin...
          </template>

          <template #empty>
            Data tidak tersedia
          </template>

          <template #cell-no="{ index }">
            <span class="text-inherit leading-[1.35] text-[var(--app-subtext)]">
              {{ index + 1 }}
            </span>
          </template>

          <template #cell-nama="{ row }">
            <span class="text-inherit font-semibold leading-[1.35] text-[var(--app-heading)]">
              {{ row.nama }}
            </span>
          </template>

          <template #cell-email="{ row }">
            <span class="text-inherit leading-[1.35] text-[var(--app-subtext)]">
              {{ row.email }}
            </span>
          </template>

          <template #cell-role="{ row }">
            <VChip
              :label="row.role"
              variant="tertiary"
              class="
                rounded-[6px] px-[7px] py-0.5
                text-[length:calc(var(--app-font-xs)*0.88)]
                font-bold uppercase
              "
            />
          </template>

          <template #cell-actions="{ row }">
            <div
              class="
                flex items-center justify-center gap-[6px]
                max-[768px]:justify-start
              "
            >
              <VActionButton
                variant="secondary"
                class="
                  min-h-7 rounded-[9px] px-[10px] py-[6px]
                  text-[length:calc(var(--app-font-xs)*0.9)]
                  font-semibold text-[var(--app-button-secondary-text)]
                  [&_*]:text-[var(--app-button-secondary-text)]
                  [&_.v-button-content]:gap-[5px]
                "
                title="Edit"
                @click="$router.push('/admin/management/edit/' + row.id)"
              >
                <Pencil :size="14" />
                <span>Edit</span>
              </VActionButton>

              <VActionButton
                variant="primary"
                class="
                  min-h-7 rounded-[9px] px-[10px] py-[6px]
                  text-[length:calc(var(--app-font-xs)*0.9)]
                  font-semibold text-[var(--app-text-inverse)]
                  [&_.v-button-content]:gap-[5px]
                "
                title="Hapus"
                @click="openDeleteConfirmFromRow(row)"
              >
                <Trash2 :size="14" />
                <span>Hapus</span>
              </VActionButton>
            </div>
          </template>
        </VTable>

        <VModal
          v-model:is-open="formModal.show"
          :title="isEdit ? 'Edit Informasi Admin' : 'Tambah Admin Baru'"
          :description="
            isEdit
              ? 'Perbarui data pengelola sistem agar tetap akurat.'
              : 'Daftarkan akun admin baru untuk mengelola sistem SIMP.'
          "
          :buttons="formButtons"
        >
          <template #icon>
            <component
              :is="isEdit ? UserCheck : UserPlus"
              class="h-10 w-10 text-[var(--app-accent)]"
            />
          </template>

          <div class="mt-[14px] flex w-full flex-col gap-[14px] text-left">
            <VInputField
              v-model="form.nama"
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap admin"
              :state="errors.nama ? 'error' : 'default'"
              :message="errors.nama"
              :disabled="formModal.loading"
            />

            <VInputField
              v-model="form.email"
              label="Alamat Email"
              type="email"
              placeholder="contoh: admin@simp.com"
              :state="errors.email ? 'error' : 'default'"
              :message="errors.email"
              :disabled="formModal.loading"
            />

            <div class="flex flex-col gap-2">
              <label
                class="
                  text-[length:var(--app-input-label-font)]
                  font-semibold leading-[1.2] text-[var(--app-text)]
                "
              >
                Role Akses
              </label>

              <VDropdown
                v-model="form.role"
                :options="roleOptions"
                placeholder="Pilih Role"
                :disabled="formModal.loading"
              />
            </div>
          </div>
        </VModal>

        <VModal
          v-model:is-open="deleteModal.show"
          title="Nonaktifkan Akun"
          :description="`Apakah Anda yakin ingin menonaktifkan akun ${deleteModal.adminName}? Akses ke sistem akan segera dicabut.`"
          :buttons="deleteButtons"
        >
          <template #icon>
            <UserX class="h-10 w-10 text-[var(--app-danger)]" />
          </template>
        </VModal>
      </div>
    </main>
  </DashboardLayout>
</template>