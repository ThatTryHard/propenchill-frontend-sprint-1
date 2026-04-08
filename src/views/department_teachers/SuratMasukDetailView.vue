<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import { useGlobalAlert } from '@/composables/useGlobalAlert'
import { useSuratMasukStore } from '@/stores/surat-masuk'

import DashboardLayout from '@/components/common/DashboardLayout.vue'
import DepartmentTeacherSidebar from '@/components/department_teachers/DepartmentTeacherSidebar.vue'

// REUSABLE COMPONENTS
import VCard from '@/components/common/VCard.vue'
import VButton from '@/components/common/VButton.vue'
import VChip from '@/components/common/VChip.vue'
import { ArrowLeftIcon, FileTextIcon, UserIcon, Building2Icon } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const suratMasukStore = useSuratMasukStore()
const { showAlert } = useGlobalAlert()

const idSurat = route.params.id as string

// FETCH DETAIL DATA
const fetchDetail = async () => {
  try {
    await suratMasukStore.fetchSuratMasukDetail(idSurat)
  } catch (error) {
    showAlert('error', 'Gagal memuat detail surat.', 'Error')
    router.push('/department-teachers/surat-masuk')
  }
}

// FORMATTER TANGGAL (Ex: 20 Februari 2026)
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// BUKA FILE LAMPIRAN
const openFile = () => {
  if (suratMasukStore.suratDetail?.file_lampiran) {
    window.open(suratMasukStore.suratDetail.file_lampiran, '_blank')
  } else {
    showAlert('warning', 'File lampiran tidak tersedia.', 'Perhatian')
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <DepartmentTeacherSidebar
        :userName="authStore.user?.nama"
        :userEmail="authStore.user?.email"
      />
    </template>

    <div class="w-full min-h-screen bg-transparent">
      <div class="w-full max-w-[1120px] mx-auto px-8 py-8 max-[768px]:px-4 flex flex-col gap-6">
        <button
          @click="router.back()"
          class="flex items-center gap-2 text-[#71757b] hover:text-[#3f9760] transition-colors w-fit font-semibold"
        >
          <ArrowLeftIcon :size="20" />
          <span>Kembali ke Daftar Surat</span>
        </button>

        <div v-if="suratMasukStore.loadingDetail" class="flex justify-center py-20">
          <p class="text-[#71757b] animate-pulse font-semibold">Memuat Detail Surat...</p>
        </div>

        <div v-else-if="suratMasukStore.suratDetail" class="flex flex-col gap-6">
          <div>
            <h1 class="m-0 text-[28px] leading-[120%] font-extrabold text-[#111827]">
              Detail Surat Masuk
            </h1>
            <p class="mt-1 mb-0 text-[16px] leading-[140%] text-[#71757b]">
              Berikut detail informasi surat masuk.
            </p>
          </div>

          <VCard paddingClass="p-8" class="bg-[rgba(243,243,244,0.5)] border-none shadow-none">
            <div class="flex flex-col gap-8">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                  <div
                    class="w-[60px] h-[60px] rounded-[10px] bg-[#e2e8f0] flex items-center justify-center text-[#718096]"
                  >
                    <UserIcon :size="32" />
                  </div>
                  <div class="flex flex-col gap-1">
                    <h2 class="text-[24px] font-bold text-[#111827] leading-none">
                      Informasi Pencatatan
                    </h2>
                    <p class="text-[20px] font-semibold text-[#b2b5ba] leading-none m-0">
                      Sistem Admin
                    </p>
                  </div>
                </div>
                <VChip
                  :label="suratMasukStore.suratDetail.nomor_surat_pengirim"
                  variant="primary"
                  class="!bg-[#15803d] !text-white !text-[20px] !px-5 !py-2 !shadow-none"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                <div class="flex flex-col gap-1">
                  <span class="text-[16px] text-[#71757b]">Nomor Agenda</span>
                  <span class="text-[20px] font-semibold text-[#111827]">
                    {{ suratMasukStore.suratDetail.nomor_agenda }}
                  </span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[16px] text-[#71757b]">Ditujukan Kepada</span>
                  <span class="text-[20px] font-semibold text-[#111827]">Kepala Sekolah</span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[16px] text-[#71757b]">Status Surat</span>
                  <span class="text-[20px] font-semibold text-[#111827] capitalize">
                    {{ suratMasukStore.suratDetail.status.replace(/_/g, ' ') }}
                  </span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[16px] text-[#71757b]">Tanggal Surat</span>
                  <span class="text-[20px] font-semibold text-[#111827]">
                    {{ formatDate(suratMasukStore.suratDetail.tanggal_surat) }}
                  </span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[16px] text-[#71757b]">Tanggal Diterima</span>
                  <span class="text-[20px] font-semibold text-[#111827]">
                    {{ formatDate(suratMasukStore.suratDetail.tanggal_terima) }}
                  </span>
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-[16px] text-[#71757b]">Jenis Surat</span>
                  <span class="text-[20px] font-semibold text-[#111827]">
                    {{ suratMasukStore.suratDetail.jenis_surat || '-' }}
                  </span>
                </div>
                <div class="flex flex-col gap-1 md:col-span-2 lg:col-span-3">
                  <span class="text-[16px] text-[#71757b]">Perihal</span>
                  <span class="text-[20px] font-semibold text-[#111827]">
                    {{ suratMasukStore.suratDetail.perihal }}
                  </span>
                </div>
              </div>

              <div
                v-if="suratMasukStore.suratDetail.file_lampiran"
                class="pt-4 border-t border-[#e2e8f0]"
              >
                <VButton variant="primary" @click="openFile">
                  <template #leftIcon>
                    <FileTextIcon :size="18" />
                  </template>
                  Lihat Dokumen Fisik (PDF)
                </VButton>
              </div>
            </div>
          </VCard>

          <VCard paddingClass="p-8" class="bg-[rgba(243,243,244,0.5)] border-none shadow-none">
            <div class="flex flex-col gap-8">
              <div class="flex items-center gap-4">
                <div
                  class="w-[60px] h-[60px] rounded-[10px] bg-[#e2e8f0] flex items-center justify-center text-[#718096]"
                >
                  <Building2Icon :size="32" />
                </div>
                <h2 class="text-[24px] font-bold text-[#111827] m-0">Informasi Pengirim</h2>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
                <div class="flex flex-col gap-1">
                  <span class="text-[16px] text-[#71757b]">Nama Instansi / Pengirim</span>
                  <span class="text-[20px] font-semibold text-[#111827]">
                    {{ suratMasukStore.suratDetail.pengirim?.nama_instansi || '-' }}
                  </span>
                </div>
                <div class="flex flex-col gap-1 md:col-span-2 lg:col-span-2">
                  <span class="text-[16px] text-[#71757b]">Alamat Pengirim</span>
                  <span class="text-[20px] font-semibold text-[#111827]">
                    {{ suratMasukStore.suratDetail.pengirim?.alamat || '-' }}
                  </span>
                </div>
                <div class="flex flex-col gap-1 md:col-span-2 lg:col-span-3">
                  <span class="text-[16px] text-[#71757b]">Kontak Pengirim</span>
                  <span class="text-[20px] font-semibold text-[#111827]">
                    {{ suratMasukStore.suratDetail.pengirim?.kontak || '-' }}
                  </span>
                </div>
              </div>
            </div>
          </VCard>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
