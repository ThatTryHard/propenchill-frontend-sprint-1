<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VCard from '@/components/common/VCard.vue'
import VChip from '@/components/common/VChip.vue'
import VButton from '@/components/common/VButton.vue'
import VModal from '@/components/common/VModal.vue'
import VInputField from '@/components/common/VInputField.vue'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/users/auth'
import api from '@/plugins/axios'
import {
  BadgeCheck,
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
  Camera,
} from 'lucide-vue-next'

const router = useRouter()
const profileStore = useProfileStore()
const authStore = useAuthStore()
const profile = computed(() => profileStore.profile)

const showEditModal = ref(false)
const isSaving = ref(false)
const editForm = ref({
  nama: '',
  tanggal_lahir: '',
  email: '',
  nomor_hp: '',
  alamat: '',
})
const editError = ref('')
const avatarPreview = ref<string | null>(null)
const selectedAvatarFile = ref<File | null>(null)
const isUploadingAvatar = ref(false)
const avatarInputRef = ref<HTMLInputElement | null>(null)

const displayValue = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') return '-'
  return String(value)
}

const formattedBirthDate = computed(() => {
  const dateValue = profile.value?.tanggal_lahir
  if (!dateValue) return '-'

  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateValue))
})

const roleLabel = computed(() => profile.value?.role_label || profile.value?.role || '-')

const accountChipVariant = computed(() => {
  return profile.value?.status_akun === 'Aktif' ? 'primary' : 'secondary'
})

const verificationChipVariant = computed(() => {
  return profile.value?.is_email_verified ? 'primary' : 'secondary'
})

const completenessVariant = computed(() => {
  return profile.value?.is_profile_complete ? 'primary' : 'secondary'
})

const handleVerifyNow = () => {
  if (!profile.value?.email) return

  router.push({
    name: 'profile-verify-email',
    query: {
      email: profile.value.email,
      redirect: '/profile',
    },
  })
}

const openEditModal = () => {
  editForm.value = {
    nama: profile.value?.nama || '',
    tanggal_lahir: profile.value?.tanggal_lahir || '',
    email: profile.value?.email || '',
    nomor_hp: profile.value?.nomor_hp || '',
    alamat: profile.value?.alamat || '',
  }
  editError.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  avatarPreview.value = null
  selectedAvatarFile.value = null
  editError.value = ''
}

// Validasi email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validasi nomor HP Indonesia (hanya angka, mulai dengan 0 atau +62)
const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)[1-9][0-9]{7,11}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

const validateForm = (): boolean => {
  // Validasi Nama
  if (!editForm.value.nama.trim()) {
    editError.value = 'Nama lengkap tidak boleh kosong.'
    return false
  }
  if (editForm.value.nama.trim().length < 3) {
    editError.value = 'Nama lengkap minimal 3 karakter.'
    return false
  }

  // Validasi Email
  if (!editForm.value.email.trim()) {
    editError.value = 'Email tidak boleh kosong.'
    return false
  }
  if (!isValidEmail(editForm.value.email)) {
    editError.value = 'Format email tidak valid. Contoh: nama@email.com'
    return false
  }

  // Validasi Nomor Telepon (jika diisi)
  if (editForm.value.nomor_hp && editForm.value.nomor_hp.trim()) {
    if (!isValidPhoneNumber(editForm.value.nomor_hp)) {
      editError.value =
        'Nomor telepon tidak valid. Gunakan format Indonesia (contoh: 08123456789 atau +628123456789)'
      return false
    }
  }

  // Validasi Tanggal Lahir
  if (editForm.value.tanggal_lahir && editForm.value.tanggal_lahir.trim()) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(editForm.value.tanggal_lahir)) {
      editError.value = 'Format tanggal lahir tidak valid. Gunakan format YYYY-MM-DD'
      return false
    }
    const dateObj = new Date(editForm.value.tanggal_lahir)
    if (isNaN(dateObj.getTime())) {
      editError.value = 'Tanggal lahir tidak valid.'
      return false
    }
    // Tidak boleh lebih dari tanggal sekarang
    if (dateObj > new Date()) {
      editError.value = 'Tanggal lahir tidak boleh di masa depan.'
      return false
    }
  }

  return true
}

const handleSaveProfile = async () => {
  editError.value = ''

  // Jalankan validasi
  if (!validateForm()) {
    return
  }

  isSaving.value = true

  try {
    const dataToSend: Record<string, string> = {}
    if (editForm.value.nama) dataToSend.nama = editForm.value.nama.trim()
    if (editForm.value.email) dataToSend.email = editForm.value.email.trim()
    if (editForm.value.alamat) dataToSend.alamat = editForm.value.alamat.trim()
    if (editForm.value.nomor_hp) dataToSend.nomor_hp = editForm.value.nomor_hp.trim()
    if (editForm.value.tanggal_lahir) dataToSend.tanggal_lahir = editForm.value.tanggal_lahir

    const response = await api.put('/api/profile/', dataToSend)

    if (response.data?.message || response.status === 200) {
      await profileStore.fetchProfile()
      closeEditModal()
    }
  } catch (error: any) {
    editError.value =
      error.response?.data?.error || error.response?.data?.message || 'Gagal menyimpan perubahan.'
  } finally {
    isSaving.value = false
  }
}

const handleEditProfile = () => {
  openEditModal()
}

const triggerAvatarUpload = () => {
  avatarInputRef.value?.click()
}

const handleAvatarFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    alert('Hanya file gambar (JPG, PNG, GIF, WEBP) yang diizinkan.')
    return
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('Ukuran file maksimal 2MB.')
    return
  }

  selectedAvatarFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handleUploadAvatar = async () => {
  if (!selectedAvatarFile.value) return

  isUploadingAvatar.value = true

  try {
    const formData = new FormData()
    formData.append('avatar', selectedAvatarFile.value)

    const response = await api.post('/api/profile/avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.data?.message || response.status === 200) {
      // 1. Ambil data profil terbaru untuk komponen halaman ini
      await profileStore.fetchProfile()

      avatarPreview.value = null
      selectedAvatarFile.value = null
    }
  } catch (error: any) {
    alert(
      error.response?.data?.error || error.response?.data?.message || 'Gagal mengunggah avatar.',
    )
  } finally {
    isUploadingAvatar.value = false
  }
}
const cancelAvatarUpload = () => {
  avatarPreview.value = null
  selectedAvatarFile.value = null
  if (avatarInputRef.value) {
    avatarInputRef.value.value = ''
  }
}

onMounted(() => {
  profileStore.fetchProfile()
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar
        :key="profile?.avatar_url || 'profile-sidebar'"
        :userAvatar="profile?.avatar_url"
      />
    </template>

    <section
      class="min-h-full bg-[var(--app-bg)] px-5 py-5 font-[var(--font-sans)] text-[var(--app-text)]"
    >
      <div class="mx-auto max-w-4xl">
        <!-- Header -->
        <div
          class="mb-5 overflow-hidden rounded-[24px] border border-[var(--app-card-border)] bg-[var(--app-card)] p-5 shadow-sm"
        >
          <h1
            class="text-[length:var(--app-page-title-font)] font-bold leading-[1.2] text-[var(--app-heading)]"
          >
            Profil Pengguna
          </h1>

          <p class="mt-1 text-[length:var(--app-font-xs)] leading-[1.5] text-[var(--app-muted)]">
            Kelola dan pantau informasi akun Anda.
          </p>

          <div v-if="profile" class="mt-4 flex flex-wrap gap-2.5">
            <VChip :label="profile.status_akun" :variant="accountChipVariant" class="px-3 py-2">
              <template #icon>
                <CheckCircle2 class="h-4 w-4 text-[var(--app-accent)]" />
              </template>
            </VChip>

            <VChip :label="`Role: ${roleLabel}`" variant="tertiary" class="px-3 py-2">
              <template #icon>
                <UsersRound class="h-4 w-4 text-[var(--app-accent)]" />
              </template>
            </VChip>

            <VChip
              :label="profile.status_verifikasi"
              :variant="verificationChipVariant"
              class="px-3 py-2"
            >
              <template #icon>
                <ShieldCheck class="h-4 w-4 text-[var(--app-accent)]" />
              </template>
            </VChip>
          </div>
        </div>

        <!-- Loading -->
        <VCard v-if="profileStore.loading" paddingClass="p-4">
          <p class="text-[length:var(--app-font-xs)] leading-[1.5] text-[var(--app-muted)]">
            Memuat data profil...
          </p>
        </VCard>

        <!-- Error -->
        <div
          v-else-if="profileStore.error"
          class="rounded-2xl border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] p-4 text-[length:var(--app-font-xs)] leading-[1.5] text-[var(--app-danger)] shadow-sm"
        >
          {{ profileStore.error }}
        </div>

        <template v-else-if="profile">
          <!-- Main Profile Content -->
          <div class="grid gap-4 lg:grid-cols-[0.85fr_1.45fr]">
            <!-- Left Profile Card -->
            <VCard paddingClass="p-4">
              <div class="flex flex-col items-center text-center">
                <div
                  class="relative mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-[var(--app-card)] shadow-inner ring-8 ring-[var(--app-card)]"
                >
                  <div
                    v-if="avatarPreview || profile?.avatar_url"
                    class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full"
                  >
                    <img
                      :src="avatarPreview || profile?.avatar_url || undefined"
                      alt="Avatar"
                      class="h-full w-full object-cover"
                    />
                  </div>

                  <div
                    v-else
                    class="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--app-soft-card)]"
                  >
                    <UserRound class="h-12 w-12 text-[var(--app-accent)]" />
                  </div>

                  <!-- Upload overlay -->
                  <button
                    type="button"
                    class="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100"
                    title="Ubah foto profil"
                    @click="triggerAvatarUpload"
                  >
                    <Camera class="h-6 w-6 text-[var(--app-text-inverse)]" />
                  </button>
                </div>

                <input
                  ref="avatarInputRef"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  class="hidden"
                  @change="handleAvatarFileChange"
                />

                <!-- Avatar upload preview & actions -->
                <div v-if="avatarPreview" class="mt-3 flex flex-col items-center gap-2">
                  <p
                    class="text-[length:var(--app-font-caption)] leading-[1.4] text-[var(--app-muted)]"
                  >
                    Pratinjau foto baru
                  </p>

                  <div class="flex items-center gap-2">
                    <VButton
                      variant="primary"
                      size="sm"
                      :loading="isUploadingAvatar"
                      @click="handleUploadAvatar"
                    >
                      Simpan
                    </VButton>

                    <VButton variant="secondary" size="sm" @click="cancelAvatarUpload">
                      Batal
                    </VButton>
                  </div>
                </div>
                <div v-else></div>

                <h2
                  class="text-[length:var(--app-font-xl)] font-bold leading-[1.2] text-[var(--app-accent)]"
                >
                  {{ displayValue(profile.nama) }}
                </h2>

                <div class="mt-2">
                  <VChip :label="roleLabel" variant="primary" class="px-3 py-1.5" />
                </div>

                <div class="my-4 h-px w-full bg-[var(--app-card-border)]"></div>

                <div class="flex w-full flex-col gap-3 text-left">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-soft-card)] text-[var(--app-accent)]"
                    >
                      <Mail class="h-4.5 w-4.5" />
                    </div>

                    <p
                      class="truncate text-[length:var(--app-font-xs)] leading-[1.5] text-[var(--app-muted)]"
                    >
                      {{ displayValue(profile.email) }}
                    </p>
                  </div>

                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-soft-card)] text-[var(--app-accent)]"
                    >
                      <Phone class="h-4.5 w-4.5" />
                    </div>

                    <p
                      class="text-[length:var(--app-font-xs)] leading-[1.5] text-[var(--app-muted)]"
                    >
                      {{ displayValue(profile.nomor_hp) }}
                    </p>
                  </div>
                </div>

                <VButton
                  v-if="profile.show_verification_button"
                  variant="primary"
                  size="sm"
                  class="mt-5 w-full rounded-xl"
                  @click="handleVerifyNow"
                >
                  <template #leftIcon>
                    <BadgeCheck class="h-4 w-4" />
                  </template>
                  Verifikasi Sekarang
                </VButton>
              </div>
            </VCard>

            <!-- Right Information Card -->
            <VCard paddingClass="p-4">
              <div class="mb-4 flex items-center gap-2.5">
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-soft-card)] text-[var(--app-accent)]"
                >
                  <ClipboardCheck class="h-4.5 w-4.5" />
                </div>

                <h2
                  class="text-[length:var(--app-section-title-font)] font-bold leading-[1.2] text-[var(--app-accent)]"
                >
                  Informasi Pribadi
                </h2>
              </div>

              <div
                class="overflow-hidden rounded-2xl border border-[var(--app-card-border)] bg-[var(--app-card)]"
              >
                <div
                  class="grid grid-cols-[minmax(150px,0.75fr)_1.25fr] items-center gap-3 border-b border-[var(--app-card-border)] px-[14px] py-[11px] max-[768px]:grid-cols-1 max-[768px]:gap-[6px]"
                >
                  <div
                    class="flex items-center gap-[10px] text-[length:var(--app-font-xs)] font-medium leading-[1.4] text-[var(--app-muted)]"
                  >
                    <UserRound class="h-4 w-4 text-[var(--app-accent)]" />
                    <span>Nama Lengkap</span>
                  </div>

                  <p
                    class="text-[length:var(--app-font-xs)] font-semibold leading-[1.4] text-[var(--app-heading)]"
                  >
                    {{ displayValue(profile.nama) }}
                  </p>
                </div>

                <div
                  class="grid grid-cols-[minmax(150px,0.75fr)_1.25fr] items-center gap-3 border-b border-[var(--app-card-border)] px-[14px] py-[11px] max-[768px]:grid-cols-1 max-[768px]:gap-[6px]"
                >
                  <div
                    class="flex items-center gap-[10px] text-[length:var(--app-font-xs)] font-medium leading-[1.4] text-[var(--app-muted)]"
                  >
                    <Calendar class="h-4 w-4 text-[var(--app-accent)]" />
                    <span>Tanggal Lahir</span>
                  </div>

                  <p
                    class="text-[length:var(--app-font-xs)] font-semibold leading-[1.4] text-[var(--app-heading)]"
                  >
                    {{ formattedBirthDate }}
                  </p>
                </div>

                <div
                  class="grid grid-cols-[minmax(150px,0.75fr)_1.25fr] items-center gap-3 border-b border-[var(--app-card-border)] px-[14px] py-[11px] max-[768px]:grid-cols-1 max-[768px]:gap-[6px]"
                >
                  <div
                    class="flex items-center gap-[10px] text-[length:var(--app-font-xs)] font-medium leading-[1.4] text-[var(--app-muted)]"
                  >
                    <Mail class="h-4 w-4 text-[var(--app-accent)]" />
                    <span>Email</span>
                  </div>

                  <p
                    class="break-all text-[length:var(--app-font-xs)] font-semibold leading-[1.4] text-[var(--app-heading)]"
                  >
                    {{ displayValue(profile.email) }}
                  </p>
                </div>

                <div
                  class="grid grid-cols-[minmax(150px,0.75fr)_1.25fr] items-center gap-3 border-b border-[var(--app-card-border)] px-[14px] py-[11px] max-[768px]:grid-cols-1 max-[768px]:gap-[6px]"
                >
                  <div
                    class="flex items-center gap-[10px] text-[length:var(--app-font-xs)] font-medium leading-[1.4] text-[var(--app-muted)]"
                  >
                    <MapPin class="h-4 w-4 text-[var(--app-accent)]" />
                    <span>Alamat</span>
                  </div>

                  <p
                    class="text-[length:var(--app-font-xs)] font-semibold leading-[1.4] text-[var(--app-heading)]"
                  >
                    {{ displayValue(profile.alamat) }}
                  </p>
                </div>

                <div
                  class="grid grid-cols-[minmax(150px,0.75fr)_1.25fr] items-center gap-3 border-b border-[var(--app-card-border)] px-[14px] py-[11px] max-[768px]:grid-cols-1 max-[768px]:gap-[6px]"
                >
                  <div
                    class="flex items-center gap-[10px] text-[length:var(--app-font-xs)] font-medium leading-[1.4] text-[var(--app-muted)]"
                  >
                    <ShieldCheck class="h-4 w-4 text-[var(--app-accent)]" />
                    <span>Role</span>
                  </div>

                  <p
                    class="text-[length:var(--app-font-xs)] font-semibold leading-[1.4] text-[var(--app-heading)]"
                  >
                    {{ roleLabel }}
                  </p>
                </div>

                <div
                  class="grid grid-cols-[minmax(150px,0.75fr)_1.25fr] items-center gap-3 px-[14px] py-[11px] max-[768px]:grid-cols-1 max-[768px]:gap-[6px]"
                >
                  <div
                    class="flex items-center gap-[10px] text-[length:var(--app-font-xs)] font-medium leading-[1.4] text-[var(--app-muted)]"
                  >
                    <BadgeCheck class="h-4 w-4 text-[var(--app-accent)]" />
                    <span>Status Verifikasi</span>
                  </div>

                  <p
                    class="text-[length:var(--app-font-xs)] font-semibold leading-[1.4] text-[var(--app-heading)]"
                  >
                    {{ profile.status_verifikasi }}
                  </p>
                </div>
              </div>

              <div class="mt-4 flex justify-end">
                <VButton variant="primary" size="sm" class="rounded-xl" @click="handleEditProfile">
                  <template #rightIcon>
                    <Pencil class="h-3.5 w-3.5" />
                  </template>
                  Edit Profil
                </VButton>
              </div>
            </VCard>
          </div>

          <!-- Account Summary -->
          <VCard paddingClass="p-4" class="mt-4">
            <div class="mb-4 flex items-center gap-2.5">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-soft-card)] text-[var(--app-accent)]"
              >
                <BriefcaseBusiness class="h-4.5 w-4.5" />
              </div>

              <h2
                class="text-[length:var(--app-section-title-font)] font-bold leading-[1.2] text-[var(--app-accent)]"
              >
                Ringkasan Akun
              </h2>
            </div>

            <div class="grid gap-3 md:grid-cols-3">
              <div
                class="flex items-center gap-3 rounded-[18px] border border-[var(--app-card-border)] bg-[var(--app-card)] p-[14px] shadow-[0_1px_4px_rgba(15,23,42,0.06)]"
              >
                <div
                  class="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[var(--app-soft-card)] text-[var(--app-accent)]"
                >
                  <GraduationCap class="h-5 w-5" />
                </div>

                <div>
                  <p class="text-[length:var(--app-font-xs)] leading-[1.4] text-[var(--app-muted)]">
                    Role Pengguna
                  </p>

                  <p
                    class="mt-0.5 text-[length:var(--app-font-md)] font-bold leading-[1.3] text-[var(--app-heading)]"
                  >
                    {{ roleLabel }}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-3 rounded-[18px] border border-[var(--app-card-border)] bg-[var(--app-card)] p-[14px] shadow-[0_1px_4px_rgba(15,23,42,0.06)]"
              >
                <div
                  class="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[var(--app-soft-card)] text-[var(--app-accent)]"
                >
                  <ShieldCheck class="h-5 w-5" />
                </div>

                <div>
                  <p class="text-[length:var(--app-font-xs)] leading-[1.4] text-[var(--app-muted)]">
                    Status Akun
                  </p>

                  <p
                    class="mt-0.5 text-[length:var(--app-font-md)] font-bold leading-[1.3] text-[var(--app-accent)]"
                  >
                    {{ profile.status_akun }}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center gap-3 rounded-[18px] border border-[var(--app-card-border)] bg-[var(--app-card)] p-[14px] shadow-[0_1px_4px_rgba(15,23,42,0.06)]"
              >
                <div
                  :class="[
                    'flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[var(--app-soft-card)] text-[var(--app-accent)]',
                    completenessVariant === 'secondary'
                      ? 'bg-[var(--app-warning-bg)] text-[var(--app-warning)]'
                      : '',
                  ]"
                >
                  <ClipboardCheck class="h-5 w-5" />
                </div>

                <div>
                  <p class="text-[length:var(--app-font-xs)] leading-[1.4] text-[var(--app-muted)]">
                    Kelengkapan Data
                  </p>

                  <p
                    :class="[
                      'mt-0.5 text-[length:var(--app-font-md)] font-bold leading-[1.3]',
                      profile.is_profile_complete
                        ? 'text-[var(--app-accent)]'
                        : 'text-[var(--app-warning)]',
                    ]"
                  >
                    {{ profile.kelengkapan_data }}
                  </p>
                </div>
              </div>
            </div>
          </VCard>
        </template>
      </div>
    </section>

    <!-- Edit Profile Modal -->
    <VModal
      :isOpen="showEditModal"
      title="Edit Profil"
      @update:isOpen="showEditModal = $event"
      maxWidthClass="max-w-[440px]"
      :buttons="[
        { label: 'Batal', variant: 'secondary', action: closeEditModal },
        { label: 'Simpan', variant: 'primary', action: handleSaveProfile },
      ]"
    >
      <div class="mt-2 flex w-full flex-col gap-4 text-left">
        <div
          v-if="editError"
          class="rounded-lg border border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] p-3 text-[length:var(--app-font-xs)] leading-[1.5] text-[var(--app-danger)]"
        >
          {{ editError }}
        </div>

        <VInputField
          v-model="editForm.nama"
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
        />

        <VInputField v-model="editForm.tanggal_lahir" label="Tanggal Lahir" type="date" />

        <VInputField
          v-model="editForm.email"
          label="Email"
          type="email"
          placeholder="Masukkan email"
        />

        <VInputField v-model="editForm.alamat" label="Alamat" placeholder="Masukkan alamat" />

        <VInputField
          v-model="editForm.nomor_hp"
          label="Nomor Telepon"
          type="tel"
          placeholder="Masukkan nomor telepon"
        />
      </div>
    </VModal>
  </DashboardLayout>
</template>
