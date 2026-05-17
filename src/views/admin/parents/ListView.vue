<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { useParentStore, type Parent } from '@/stores/parents'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import CreateParentModal from '@/components/admin/parents/CreateParentModal.vue'
import EditParentModal from '@/components/admin/parents/EditParentModal.vue'
import ConfirmationModal from '@/components/common/ConfirmationModal.vue'
import VButton from '@/components/common/VButton.vue'
import VActionButton from '@/components/common/VActionButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import VAlert from '@/components/common/VAlert.vue'
import VPagination from '@/components/common/VPagination.vue'
import VCard from '@/components/common/VCard.vue'
import VTable from '@/components/common/VTable.vue'

type AlertType = 'success' | 'error' | 'warning' | 'information'

const store = useParentStore()
const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const currentPage = ref(1)
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const selectedParentId = ref<number | null>(null)

const alert = reactive({
  visible: false,
  type: 'success' as AlertType,
  title: '',
  message: '',
})

const deleteModal = reactive({
  show: false,
  parentId: null as number | null,
  parentName: '',
  loading: false,
})

const parentColumns = [
  { key: 'no', label: 'No', nowrap: true },
  { key: 'nama', label: 'Nama' },
  { key: 'email', label: 'Email' },
  { key: 'no_hp', label: 'No. HP' },
  { key: 'tanggal_lahir', label: 'Tanggal Lahir' },
  { key: 'actions', label: 'Aksi', align: 'center' as const, nowrap: true },
]

const tableRows = computed(() => {
  return store.parents.map((parent, index) => ({
    ...parent,
    no: (store.pagination.currentPage - 1) * store.pagination.limit + index + 1,
  }))
})

onMounted(() => {
  if (route.query.success) {
    alert.visible = true
    alert.type = 'success'
    alert.title = 'Success Alert'
    alert.message = route.query.success as string
  }

  store.fetchParents(currentPage.value, searchQuery.value)
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    store.fetchParents(1, searchQuery.value)
  }, 400)
}

const changePage = (page: number) => {
  currentPage.value = page
  store.setParentPage(page)
}

const refreshCurrentPage = async () => {
  await store.fetchParents(currentPage.value, searchQuery.value)
}

watch(currentPage, async (page) => {
  if (page !== store.pagination.currentPage) {
    await store.fetchParents(page, searchQuery.value)
  }
})

const openCreateModal = () => {
  isCreateModalOpen.value = true
}

const openEditModal = (parentId: number) => {
  selectedParentId.value = parentId
  isEditModalOpen.value = true
}

const handleParentCreated = async (message: string) => {
  alert.visible = true
  alert.type = 'success'
  alert.title = 'Success Alert'
  alert.message = message
  await refreshCurrentPage()
}

const handleParentUpdated = async (message: string) => {
  alert.visible = true
  alert.type = 'success'
  alert.title = 'Success Alert'
  alert.message = message
  await refreshCurrentPage()
}

const openDeleteModal = (parent: Parent) => {
  deleteModal.parentId = parent.id
  deleteModal.parentName = parent.nama
  deleteModal.show = true
}

const handleDelete = async () => {
  if (!deleteModal.parentId) return

  deleteModal.loading = true

  try {
    const data = await store.deleteParent(deleteModal.parentId)

    alert.visible = true
    alert.type = 'success'
    alert.title = 'Success Alert'
    alert.message = data.message || 'Akun wali murid berhasil dihapus.'

    deleteModal.show = false
    await refreshCurrentPage()
  } catch (error) {
    const errorMessage = (error as Error).message || 'Gagal menghapus wali murid.'

    deleteModal.show = false
    await router.replace({ name: 'admin-parents' })

    alert.visible = true
    alert.type = 'error'
    alert.title = 'Tidak Bisa Menghapus Akun'
    alert.message = errorMessage
  } finally {
    deleteModal.loading = false
  }
}
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main class="parents-page">
      <header class="parents-header">
        <div class="parents-heading-group">
          <h1 class="parents-title">
            Kelola Wali Murid
          </h1>

          <p class="parents-subtitle">
            Daftar akun wali murid yang terdaftar
          </p>
        </div>

        <VButton
          variant="primary"
          class="parents-add-button"
          @click="openCreateModal"
        >
          <template #leftIcon>
            <Plus :size="16" />
          </template>

          Tambah Wali Murid
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

      <VCard
        class="parents-list-card"
        paddingClass="p-5"
      >
        <div class="parents-toolbar">
          <div class="parents-search-wrapper">
            <VInputField
              v-model="searchQuery"
              state="search"
              placeholder="Cari nama wali murid..."
              @update:modelValue="debouncedSearch"
            />
          </div>
        </div>

        <VTable
          :columns="parentColumns"
          :rows="tableRows"
          :is-loading="store.isLoading"
          loading-message="Memuat data wali murid..."
          empty-message="Tidak ada data wali murid"
        >
          <template #loading>
            Memuat data wali murid...
          </template>

          <template #empty>
            Tidak ada data wali murid
          </template>

          <template #cell-no="{ row }">
            <span class="parents-table-text">
              {{ row.no }}
            </span>
          </template>

          <template #cell-nama="{ row }">
            <span class="parents-table-name">
              {{ row.nama }}
            </span>
          </template>

          <template #cell-email="{ row }">
            <span class="parents-table-text">
              {{ row.email }}
            </span>
          </template>

          <template #cell-no_hp="{ row }">
            <span class="parents-table-text">
              {{ row.no_hp || '-' }}
            </span>
          </template>

          <template #cell-tanggal_lahir="{ row }">
            <span class="parents-table-text">
              {{ row.tanggal_lahir || '-' }}
            </span>
          </template>

          <template #cell-actions="{ row }">
            <div class="parents-action-group">
              <VActionButton
                variant="secondary"
                class="parents-action-button parents-action-button-edit"
                title="Edit"
                @click="openEditModal(row.id)"
              >
                <Pencil :size="14" />
                <span>Edit</span>
              </VActionButton>

              <VActionButton
                variant="primary"
                class="parents-action-button parents-action-button-delete"
                title="Hapus"
                @click="openDeleteModal(row)"
              >
                <Trash2 :size="14" />
                <span>Hapus</span>
              </VActionButton>
            </div>
          </template>
        </VTable>

        <div class="parents-pagination-wrapper">
          <span class="parents-pagination-text">
            Halaman {{ store.pagination.currentPage }} dari {{ store.pagination.totalPages }}
            ({{ store.pagination.totalData }} data)
          </span>

          <VPagination
            v-model:currentPage="currentPage"
            :totalPages="store.pagination.totalPages"
            @page-change="changePage"
          />
        </div>
      </VCard>

      <ConfirmationModal
        :isOpen="deleteModal.show"
        title="Hapus Wali Murid"
        :description="`Apakah Anda yakin ingin menghapus akun ${deleteModal.parentName}? Tindakan ini tidak dapat dibatalkan.`"
        confirmText="Hapus"
        :loading="deleteModal.loading"
        @update:isOpen="deleteModal.show = $event"
        @confirm="handleDelete"
      />

      <CreateParentModal
        :isOpen="isCreateModalOpen"
        @update:isOpen="isCreateModalOpen = $event"
        @created="handleParentCreated"
      />

      <EditParentModal
        :isOpen="isEditModalOpen"
        :parentId="selectedParentId"
        @update:isOpen="isEditModalOpen = $event"
        @updated="handleParentUpdated"
      />
    </main>
  </DashboardLayout>
</template>

<style scoped>
.parents-page {
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

.parents-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.parents-heading-group {
  min-width: 0;
}

.parents-title {
  margin: 0;
  color: var(--app-heading);
  font-size: var(--app-page-title-font);
  font-weight: 800;
  line-height: 1.2;
}

.parents-subtitle {
  margin: 4px 0 0;
  color: var(--app-subtext);
  font-size: var(--app-page-subtitle-font);
  line-height: 1.4;
}

.parents-add-button {
  flex-shrink: 0;
}

.parents-list-card {
  border-color: var(--app-card-border);
  background: var(--app-card);
  color: var(--app-text);
  box-shadow: var(--app-card-shadow);
}

.parents-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.parents-search-wrapper {
  width: 100%;
  max-width: 420px;
}

.parents-list-card :deep(.v-table-wrapper) {
  background: transparent;
  box-shadow: none;
}

.parents-table-name {
  color: var(--app-heading);
  font-size: var(--app-table-cell-font);
  font-weight: 700;
  line-height: 1.35;
}

.parents-table-text {
  color: var(--app-subtext);
  font-size: var(--app-table-cell-font);
  line-height: 1.35;
}

.parents-action-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.parents-action-button {
  min-height: 32px;
  padding-inline: 12px;
}

.parents-action-button :deep(.v-button-content) {
  gap: 6px;
}

.parents-pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--app-card-border);
}

.parents-pagination-text {
  color: var(--app-subtext);
  font-size: var(--app-font-xs);
  line-height: 1.4;
}

@media (max-width: 900px) {
  .parents-page {
    padding: 24px;
  }

  .parents-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .parents-add-button {
    width: 100%;
  }

  .parents-search-wrapper {
    max-width: 100%;
  }

  .parents-pagination-wrapper {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .parents-page {
    gap: 18px;
    padding: 18px;
  }

  .parents-action-group {
    align-items: stretch;
    flex-direction: column;
  }

  .parents-action-button {
    width: 100%;
  }
}
</style>