<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useAdminStore } from '@/stores/admin'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VInputField from '@/components/common/VInputField.vue'
import VButton from '@/components/common/VButton.vue'
import VDropdown from '@/components/common/VDropdown.vue'
import VCard from '@/components/common/VCard.vue'

const router = useRouter()
const adminStore = useAdminStore()

const form = ref({ nama: '', email: '', role: 'ADMIN' })

const roleOptions = [
  { label: 'ADMIN', value: 'ADMIN' },
  { label: 'KEPALA SEKOLAH', value: 'KEPSEK' },
  { label: 'BIDANG AKADEMIK', value: 'BIDANG_AKADEMIK' },
  { label: 'BIDANG AGAMA', value: 'BIDANG_AGAMA' },
  { label: 'BIDANG KESISWAAN', value: 'BIDANG_KESISWAAN' },
]

const errors = ref<Record<string, string>>({})
const isLoading = ref(false)

const handleSave = async () => {
  isLoading.value = true
  errors.value = {}

  try {
    await adminStore.addAdmin(form.value)

    router.push({
      path: '/admin/management',
      query: { success: 'Akun admin berhasil dibuat' },
    })
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'data' in err) {
      const apiError = err as { data?: Record<string, string> }

      if (apiError.data) errors.value = apiError.data
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <main
      class="
        flex h-full flex-col gap-8 bg-[var(--app-bg)] p-8
        font-[var(--font-sans)] text-[var(--app-text)]
      "
    >
      <header class="flex flex-col gap-4">
        <button
          type="button"
          class="
            flex items-center gap-2 text-[var(--app-muted)]
            transition-colors duration-200 ease-in-out
            hover:text-[var(--app-heading)]
            focus:outline-none
            focus-visible:rounded-[6px]
            focus-visible:outline
            focus-visible:outline-2
            focus-visible:outline-offset-[3px]
            focus-visible:outline-[var(--app-accent)]
          "
          @click="$router.push('/admin/management')"
        >
          <ArrowLeft :size="18" />

          <span
            class="
              text-[length:var(--app-font-sm)]
              font-medium leading-[1.4]
            "
          >
            Kembali
          </span>
        </button>

        <div>
          <h1
            class="
              m-0 text-[length:var(--app-page-title-font)]
              font-bold leading-[1.2] text-[var(--app-heading)]
            "
          >
            Tambah Staff Baru
          </h1>

          <p
            class="
              mt-1 mb-0 text-[length:var(--app-page-subtitle-font)]
              font-medium leading-[1.4] text-[var(--app-muted)]
            "
          >
            Buat akun baru untuk pengelola sistem
          </p>
        </div>
      </header>

      <VCard
        padding-class="p-8"
        class="max-w-4xl"
      >
        <div class="flex flex-col gap-6">
          <VInputField
            v-model="form.nama"
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            :state="errors.nama ? 'error' : 'default'"
            :message="errors.nama"
          />

          <VInputField
            v-model="form.email"
            label="Email"
            placeholder="nama@email.com"
            :state="errors.email ? 'error' : 'default'"
            :message="errors.email"
          />

          <div class="flex flex-col gap-2">
            <label
              class="
                text-[length:var(--app-input-label-font)]
                font-semibold leading-[1.2] text-[var(--app-text)]
              "
            >
              Role
            </label>

            <VDropdown
              v-model="form.role"
              :options="roleOptions"
              placeholder="Pilih Role"
            />
          </div>
        </div>
      </VCard>

      <div class="mt-10 flex gap-4">
        <VButton
          variant="tertiary"
          class="px-8"
          @click="$router.push('/admin/management')"
        >
          Batal
        </VButton>

        <VButton
          variant="primary"
          class="px-8"
          :loading="isLoading"
          @click="handleSave"
        >
          Simpan
        </VButton>
      </div>
    </main>
  </DashboardLayout>
</template>