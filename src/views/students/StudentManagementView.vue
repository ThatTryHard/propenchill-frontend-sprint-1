<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import {
  Plus,
  Pencil,
  Trash2,
  Filter,
  RotateCcw,
  UserRound,
  ListOrdered,
  Search,
  Mail,
} from 'lucide-vue-next'

import { useStudentStore, type Student } from '@/stores/students'
import { useAuthStore } from '@/stores/users/auth'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import StudentSidebar from '@/components/admin/StudentSidebar.vue'
import VButton from '@/components/common/VButton.vue'
import VCard from '@/components/common/VCard.vue'
import VTable from '@/components/common/VTable.vue'
import VPagination from '@/components/common/VPagination.vue'
import CreateStudentModal from '@/components/admin/CreateStudentModal.vue'
import EditStudentModal from '@/components/admin/EditStudentModal.vue'
import DeleteConfirmationModal from '@/components/admin/DeleteConfirmationModal.vue'

import databaseIcon from '@/assets/Database_Logo SVG.svg'
import studentIcon from '@/assets/Siswa SVG.svg'
import staffIcon from '@/assets/PC SVG.svg'

const studentStore = useStudentStore()
const authStore = useAuthStore()

const search = ref('')
const kelas = ref('')
const nomorInduk = ref('')
const namaFilter = ref('')
const currentPage = ref(1)
const limit = ref(10)

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedStudent = ref<Student | null>(null)
const selectedStudentId = ref<number | null>(null)
const selectedStudentName = ref('')

const combinedQuery = computed(() => {
  return search.value || namaFilter.value || nomorInduk.value
})

const loadStudents = async () => {
  await studentStore.fetchStudents(
    currentPage.value,
    limit.value,
    combinedQuery.value,
    kelas.value
  )
}

const openCreateModal = () => {
  isCreateModalOpen.value = true
}

const openEditModal = (student: Student) => {
  selectedStudent.value = student
  isEditModalOpen.value = true
}

const openDeleteModal = (id: number, name: string) => {
  selectedStudentId.value = id
  selectedStudentName.value = name
  isDeleteModalOpen.value = true
}

const handleStudentCreated = async () => {
  await loadStudents()
}

const handleStudentUpdated = async () => {
  await loadStudents()
}

const handleStudentDeleted = async () => {
  if (studentStore.students.length === 1 && currentPage.value > 1) {
    currentPage.value--
  }

  await loadStudents()
}

const resetFilter = async () => {
  search.value = ''
  kelas.value = ''
  nomorInduk.value = ''
  namaFilter.value = ''
  currentPage.value = 1
  await loadStudents()
}

const totalData = computed(() => studentStore.pagination.total_data)
const totalSiswa = computed(() => studentStore.pagination.total_data)
const totalStaf = computed(() => 0)

const tableColumns = [
  { key: 'nomor', label: 'Nomor' },
  { key: 'nama', label: 'Nama' },
  { key: 'nisn', label: 'NISN' },
  { key: 'nis', label: 'NIS' },
  { key: 'email', label: 'Email' },
  { key: 'kelas', label: 'Kelas' },
  { key: 'jenis_kelamin_label', label: 'Jenis Kelamin' },
  { key: 'aksi', label: 'Aksi' },
]

const tableRows = computed(() => {
  return studentStore.students.map((student, index) => ({
    ...student,
    nomor:
      (studentStore.pagination.halaman_sekarang - 1) *
        studentStore.pagination.limit +
      index +
      1,
    jenis_kelamin_label:
      student.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan',
  }))
})

watch([search, kelas, namaFilter, nomorInduk], async () => {
  currentPage.value = 1
  await loadStudents()
})

watch(currentPage, async () => {
  await loadStudents()
})

onMounted(async () => {
  await loadStudents()
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <StudentSidebar
        :userName="authStore.user?.name"
        :userEmail="authStore.user?.email"
      />
    </template>

    <div class="w-full max-w-[1180px] mx-auto px-10 py-[34px] flex flex-col gap-[22px] max-[768px]:px-4 max-[768px]:py-6">
      <section class="flex justify-between items-start gap-5 max-[1200px]:flex-col max-[1200px]:items-start">
        <div>
          <h1 class="m-0 text-[31px] leading-[120%] font-extrabold text-[#111827]">
            Manajemen Basis Data Siswa dan Staf
          </h1>
          <p class="mt-[6px] mb-0 text-[18px] leading-[120%] text-[#7d8188]">
            Lihat dan kelola basis data siswa dan staf
          </p>
        </div>

        <VButton
          variant="primary"
          class="min-w-[208px] h-[42px] !px-5 !py-0 !rounded-[18px] !text-[15px]"
          @click="openCreateModal"
        >
          <template #leftIcon>
            <Plus :size="18" />
          </template>
          Tambah Data
        </VButton>
      </section>

      <section class="grid grid-cols-3 gap-5 max-[1200px]:grid-cols-1">
        <VCard paddingClass="p-0">
          <div class="relative h-[186px] overflow-hidden">
            <div class="absolute top-[48px] left-1/2 -translate-x-1/2 w-[218px] flex flex-col items-center gap-[14px] z-[2]">
              <b class="w-full text-center text-[32px] leading-[120%] text-[#111827]">Total Data</b>
              <b class="w-full text-center text-[32px] leading-[120%] bg-[radial-gradient(77.91%_77.91%_at_50%_100%,#3f9760_4.91%,#0c4923)] bg-clip-text text-transparent">
                {{ totalData }}
              </b>
            </div>
            <img
              :src="databaseIcon"
              alt="Database Icon"
              class="absolute left-[-14px] bottom-[-6px] w-[100px] h-[100px] object-contain z-[1]"
            />
          </div>
        </VCard>

        <VCard paddingClass="p-0">
          <div class="relative h-[186px] overflow-hidden">
            <div class="absolute top-[48px] left-1/2 -translate-x-1/2 w-[218px] flex flex-col items-center gap-[14px] z-[2]">
              <b class="w-full text-center text-[32px] leading-[120%] text-[#111827]">Siswa</b>
              <b class="w-full text-center text-[32px] leading-[120%] bg-[radial-gradient(77.91%_77.91%_at_50%_100%,#3f9760_4.91%,#0c4923)] bg-clip-text text-transparent">
                {{ totalSiswa }}
              </b>
            </div>
            <img
              :src="studentIcon"
              alt="Student Icon"
              class="absolute left-[-14px] bottom-[-6px] w-[100px] h-[100px] object-contain z-[1]"
            />
          </div>
        </VCard>

        <VCard paddingClass="p-0">
          <div class="relative h-[186px] overflow-hidden">
            <div class="absolute top-[48px] left-1/2 -translate-x-1/2 w-[218px] flex flex-col items-center gap-[14px] z-[2]">
              <b class="w-full text-center text-[32px] leading-[120%] text-[#111827]">Staf</b>
              <b class="w-full text-center text-[32px] leading-[120%] bg-[radial-gradient(77.91%_77.91%_at_50%_100%,#3f9760_4.91%,#0c4923)] bg-clip-text text-transparent">
                {{ totalStaf }}
              </b>
            </div>
            <img
              :src="staffIcon"
              alt="Staff Icon"
              class="absolute left-[-14px] bottom-[-6px] w-[100px] h-[100px] object-contain z-[1]"
            />
          </div>
        </VCard>
      </section>

      <VCard paddingClass="px-4 py-[34px]">
        <div class="flex flex-col gap-5 w-full">
          <div class="flex items-center gap-[10px]">
            <Filter class="w-10 h-10 text-[#111827]" />
            <b class="text-[24px] leading-[120%] text-[#111827] font-bold">
              Filter Data
            </b>
          </div>

          <div
            class="w-full flex items-center justify-end gap-[10px] text-[20px] max-[1100px]:flex-wrap max-[1100px]:justify-start"
          >
            <div class="flex items-center gap-[10px]">
              <div class="text-[20px] leading-[120%] font-semibold text-[#111827]">
                Nama
              </div>

              <div
                class="rounded-[10px] border-2 border-transparent bg-[linear-gradient(#f8fafc,#f8fafc)_padding-box,linear-gradient(90.74deg,#3f9760,#d1955f)_border-box] overflow-hidden px-4 py-[10px]"
              >
                <div class="flex items-center gap-[10px]">
                  <div class="w-[109px] flex items-center justify-center">
                    <input
                      v-model="namaFilter"
                      type="text"
                      placeholder="Masukkan nama"
                      class="w-full bg-transparent outline-none text-[16px] leading-[120%] font-semibold text-[#111827] placeholder:text-[#858a91]"
                    />
                  </div>
                  <UserRound class="w-6 h-6 text-[#858a91]" />
                </div>
              </div>
            </div>

            <div class="flex items-center gap-[10px]">
              <div class="text-[20px] leading-[120%] font-semibold text-[#111827]">
                Nomor Induk
              </div>

              <div
                class="rounded-[10px] border-2 border-transparent bg-[linear-gradient(#f8fafc,#f8fafc)_padding-box,linear-gradient(90.74deg,#3f9760,#d1955f)_border-box] overflow-hidden px-4 py-[10px]"
              >
                <div class="flex items-center gap-[10px]">
                  <div class="w-[109px] flex items-center justify-center">
                    <input
                      v-model="nomorInduk"
                      type="text"
                      placeholder="NIS / NISN"
                      class="w-full bg-transparent outline-none text-[16px] leading-[120%] font-semibold text-[#111827] placeholder:text-[#858a91]"
                    />
                  </div>
                  <ListOrdered class="w-6 h-6 text-[#858a91]" />
                </div>
              </div>
            </div>

            <div class="flex items-center gap-[10px]">
              <div class="text-[20px] leading-[120%] font-semibold text-[#111827]">
                Kelas
              </div>

              <div
                class="rounded-[10px] border-2 border-transparent bg-[linear-gradient(#f8fafc,#f8fafc)_padding-box,linear-gradient(90.74deg,#3f9760,#d1955f)_border-box] overflow-hidden px-4 py-[10px]"
              >
                <div class="flex items-center gap-[10px]">
                  <div class="w-[109px] flex items-center justify-center">
                    <input
                      v-model="kelas"
                      type="text"
                      placeholder="Masukkan kelas"
                      class="w-full bg-transparent outline-none text-[16px] leading-[120%] font-semibold text-[#111827] placeholder:text-[#858a91]"
                    />
                  </div>
                  <UserRound class="w-6 h-6 text-[#858a91]" />
                </div>
              </div>
            </div>

            <button
              @click="resetFilter"
              type="button"
              class="h-[44px] w-[56px] rounded-[10px] border-2 border-transparent bg-[linear-gradient(#f8fafc,#f8fafc)_padding-box,linear-gradient(90.74deg,#3f9760,#d1955f)_border-box] flex items-center justify-center"
            >
              <RotateCcw class="w-6 h-6 text-[#111827]" />
            </button>
          </div>

          <div
            class="w-full rounded-[12px] border-2 border-[#b2b5ba] bg-[rgba(243,243,244,0.5)] px-[19px] py-[14px] flex items-center gap-[10px]"
          >
            <Search class="w-6 h-6 text-[#b2b5ba]" />
            <input
              v-model="search"
              type="text"
              placeholder="Cari nama, email, NIS, atau NISN"
              class="w-full bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 shadow-none text-[16px] leading-[150%] text-[#111827] placeholder:text-[#b2b5ba]"
            />
          </div>
        </div>
      </VCard>

      <div
        v-if="studentStore.error && !studentStore.loading"
        class="bg-white rounded-[14px] px-[26px] py-[22px] text-[14px] font-semibold text-[#b42318]"
      >
        {{ studentStore.error }}
      </div>

      <div class="flex flex-col gap-4">
        <VTable
          :columns="tableColumns"
          :rows="tableRows"
          :isLoading="studentStore.loading"
        >
          <template #cell-nomor="{ value }">
            <div class="text-center text-[14px] text-[#202632]">
              {{ value }}
            </div>
          </template>

          <template #cell-nama="{ value }">
            <div class="text-center text-[14px] text-[#202632] font-medium">
              {{ value }}
            </div>
          </template>

          <template #cell-nisn="{ value }">
            <div class="text-center text-[14px] text-[#202632]">
              {{ value }}
            </div>
          </template>

          <template #cell-nis="{ value }">
            <div class="text-center text-[14px] text-[#202632]">
              {{ value }}
            </div>
          </template>

          <template #cell-email="{ value }">
            <div class="text-center text-[14px] text-[#202632] break-all">
              {{ value }}
            </div>
          </template>

          <template #cell-kelas="{ value }">
            <div class="text-center text-[14px] text-[#202632]">
              {{ value }}
            </div>
          </template>

          <template #cell-jenis_kelamin_label="{ value }">
            <div class="text-center text-[14px] text-[#202632]">
              {{ value }}
            </div>
          </template>

          <template #cell-aksi="{ row }">
            <div class="flex justify-center gap-2">
              <VButton
                variant="secondary"
                class="!h-[26px] !min-w-[58px] !px-[10px] !py-0 !rounded-[8px] !text-[12px] !font-medium"
                @click="openEditModal(row)"
              >
                <template #leftIcon>
                  <Pencil :size="12" />
                </template>
                Edit
              </VButton>

              <VButton
                variant="primary"
                class="!h-[26px] !min-w-[64px] !px-[10px] !py-0 !rounded-[8px] !text-[12px] !font-medium"
                @click="openDeleteModal(row.id_siswa, row.nama)"
              >
                <template #leftIcon>
                  <Trash2 :size="12" />
                </template>
                Hapus
              </VButton>
            </div>
          </template>
        </VTable>

        <div class="flex justify-between items-center">
          <div class="text-[16px] font-semibold text-[#8b9098]">Show All</div>

          <VPagination
            v-model:currentPage="currentPage"
            :totalPages="studentStore.pagination.total_halaman"
            @page-change="loadStudents"
          />
        </div>
      </div>
    </div>

    <CreateStudentModal
      :isOpen="isCreateModalOpen"
      @update:isOpen="isCreateModalOpen = $event"
      @created="handleStudentCreated"
    />

    <EditStudentModal
      :isOpen="isEditModalOpen"
      :student="selectedStudent"
      @update:isOpen="isEditModalOpen = $event"
      @updated="handleStudentUpdated"
    />

    <DeleteConfirmationModal
      :isOpen="isDeleteModalOpen"
      :studentId="selectedStudentId"
      :studentName="selectedStudentName"
      @update:isOpen="isDeleteModalOpen = $event"
      @confirmed="handleStudentDeleted"
    />
  </DashboardLayout>
</template>