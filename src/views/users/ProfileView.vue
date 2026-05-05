<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VCard from '@/components/common/VCard.vue'
import VChip from '@/components/common/VChip.vue'
import VButton from '@/components/common/VButton.vue'
import { useProfileStore } from '@/stores/profile'
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
} from 'lucide-vue-next'

const router = useRouter()
const profileStore = useProfileStore()

const profile = computed(() => profileStore.profile)

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
    name: 'verify-email',
    query: {
      email: profile.value.email,
      redirect: '/profile',
    },
  })
}

const handleEditProfile = () => {
  // Placeholder untuk fitur edit profile jika endpoint update profile sudah tersedia.
}

onMounted(() => {
  profileStore.fetchProfile()
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <section class="min-h-full bg-[#F8FAFC] px-5 py-5">
      <div class="mx-auto max-w-4xl">
        <!-- Header -->
        <div
          class="mb-5 overflow-hidden rounded-[24px] bg-gradient-to-br from-white via-[#F8FAFC] to-[#E8F3EB] p-5 shadow-sm"
        >
          <h1 class="text-2xl font-bold text-slate-900">Profil Pengguna</h1>
          <p class="mt-1 text-[12px] text-slate-500">Kelola dan pantau informasi akun Anda.</p>

          <div
            v-if="profile"
            class="mt-4 flex flex-wrap gap-2.5"
          >
            <VChip
              :label="profile.status_akun"
              :variant="accountChipVariant"
              class="!px-3 !py-2 !text-[13px]"
            >
              <template #icon>
                <CheckCircle2 class="h-4 w-4 text-[#3F9760]" />
              </template>
            </VChip>

            <VChip
              :label="`Role: ${roleLabel}`"
              variant="tertiary"
              class="!px-3 !py-2 !text-[13px]"
            >
              <template #icon>
                <UsersRound class="h-4 w-4 text-[#3F9760]" />
              </template>
            </VChip>

            <VChip
              :label="profile.status_verifikasi"
              :variant="verificationChipVariant"
              class="!px-3 !py-2 !text-[13px]"
            >
              <template #icon>
                <ShieldCheck class="h-4 w-4 text-[#3F9760]" />
              </template>
            </VChip>
          </div>
        </div>

        <!-- Loading -->
        <VCard
          v-if="profileStore.loading"
          paddingClass="p-4"
        >
          <p class="text-[12px] text-slate-600">Memuat data profil...</p>
        </VCard>

        <!-- Error -->
        <div
          v-else-if="profileStore.error"
          class="rounded-2xl border border-red-200 bg-red-50 p-4 text-[12px] text-red-700 shadow-sm"
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
                  class="relative mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-inner ring-8 ring-white"
                >
                  <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#E8F3EB]">
                    <UserRound class="h-12 w-12 text-[#3F9760]" />
                  </div>
                </div>

                <h2 class="text-xl font-bold text-[#0C4923]">
                  {{ displayValue(profile.nama) }}
                </h2>

                <div class="mt-2">
                  <VChip
                    :label="roleLabel"
                    variant="primary"
                    class="!px-3 !py-1.5 !text-[12px]"
                  />
                </div>

                <div class="my-4 h-px w-full bg-white/70"></div>

                <div class="flex w-full flex-col gap-3 text-left">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F9FDFB] text-[#3F9760]"
                    >
                      <Mail class="h-4.5 w-4.5" />
                    </div>
                    <p class="truncate text-[12px] text-slate-600">
                      {{ displayValue(profile.email) }}
                    </p>
                  </div>

                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F9FDFB] text-[#3F9760]"
                    >
                      <Phone class="h-4.5 w-4.5" />
                    </div>
                    <p class="text-[12px] text-slate-600">
                      {{ displayValue(profile.nomor_hp) }}
                    </p>
                  </div>
                </div>

                <VButton
                  v-if="profile.show_verification_button"
                  variant="primary"
                  class="mt-5 !w-full !rounded-xl !px-4 !py-2 !text-[12px]"
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
                  class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F3EB] text-[#3F9760]"
                >
                  <ClipboardCheck class="h-4.5 w-4.5" />
                </div>
                <h2 class="text-lg font-bold text-[#0C4923]">Informasi Pribadi</h2>
              </div>

              <div class="overflow-hidden rounded-2xl border border-white/70 bg-white/50">
                <div class="profile-row">
                  <div class="profile-label">
                    <UserRound class="profile-icon" />
                    <span>Nama Lengkap</span>
                  </div>
                  <p class="profile-value">{{ displayValue(profile.nama) }}</p>
                </div>

                <div class="profile-row">
                  <div class="profile-label">
                    <Calendar class="profile-icon" />
                    <span>Tanggal Lahir</span>
                  </div>
                  <p class="profile-value">{{ formattedBirthDate }}</p>
                </div>

                <div class="profile-row">
                  <div class="profile-label">
                    <Mail class="profile-icon" />
                    <span>Email</span>
                  </div>
                  <p class="profile-value break-all">{{ displayValue(profile.email) }}</p>
                </div>

                <div class="profile-row">
                  <div class="profile-label">
                    <Phone class="profile-icon" />
                    <span>Nomor Telepon</span>
                  </div>
                  <p class="profile-value">{{ displayValue(profile.nomor_hp) }}</p>
                </div>

                <div class="profile-row">
                  <div class="profile-label">
                    <MapPin class="profile-icon" />
                    <span>Alamat</span>
                  </div>
                  <p class="profile-value">{{ displayValue(profile.alamat) }}</p>
                </div>

                <div class="profile-row">
                  <div class="profile-label">
                    <ShieldCheck class="profile-icon" />
                    <span>Role</span>
                  </div>
                  <p class="profile-value">{{ roleLabel }}</p>
                </div>

                <div class="profile-row">
                  <div class="profile-label">
                    <BadgeCheck class="profile-icon" />
                    <span>Status Verifikasi</span>
                  </div>
                  <p class="profile-value">{{ profile.status_verifikasi }}</p>
                </div>
              </div>

              <div class="mt-4 flex justify-end">
                <VButton
                  variant="primary"
                  class="!rounded-xl !px-4 !py-2 !text-[12px]"
                  disabled
                  @click="handleEditProfile"
                >
                  <template #rightIcon>
                    <Pencil class="h-3.5 w-3.5" />
                  </template>
                  Ubah Profil
                </VButton>
              </div>
            </VCard>
          </div>

          <!-- Account Summary -->
          <VCard
            paddingClass="p-4"
            class="mt-4"
          >
            <div class="mb-4 flex items-center gap-2.5">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F3EB] text-[#3F9760]"
              >
                <BriefcaseBusiness class="h-4.5 w-4.5" />
              </div>
              <h2 class="text-lg font-bold text-[#0C4923]">Ringkasan Akun</h2>
            </div>

            <div class="grid gap-3 md:grid-cols-3">
              <div class="summary-card">
                <div class="summary-icon">
                  <GraduationCap class="h-5 w-5" />
                </div>
                <div>
                  <p class="summary-title">Role Pengguna</p>
                  <p class="summary-value">{{ roleLabel }}</p>
                </div>
              </div>

              <div class="summary-card">
                <div class="summary-icon">
                  <ShieldCheck class="h-5 w-5" />
                </div>
                <div>
                  <p class="summary-title">Status Akun</p>
                  <p class="summary-value text-[#3F9760]">{{ profile.status_akun }}</p>
                </div>
              </div>

              <div class="summary-card">
                <div
                  class="summary-icon"
                  :class="completenessVariant === 'secondary' ? '!bg-[#F2E0D0] !text-[#9A5B2F]' : ''"
                >
                  <ClipboardCheck class="h-5 w-5" />
                </div>
                <div>
                  <p class="summary-title">Kelengkapan Data</p>
                  <p
                    class="summary-value"
                    :class="profile.is_profile_complete ? 'text-[#3F9760]' : 'text-[#9A5B2F]'"
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
  </DashboardLayout>
</template>

<style scoped>
.profile-row {
  display: grid;
  grid-template-columns: minmax(150px, 0.75fr) 1.25fr;
  gap: 12px;
  align-items: center;
  padding: 11px 14px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
}

.profile-row:last-child {
  border-bottom: 0;
}

.profile-label {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}

.profile-icon {
  height: 16px;
  width: 16px;
  color: #3f9760;
}

.profile-value {
  color: #111827;
  font-size: 12px;
  font-weight: 600;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.75);
  background: rgba(249, 253, 251, 0.65);
  padding: 14px;
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 0.5),
    0 1px 4px rgba(15, 23, 42, 0.06);
}

.summary-icon {
  display: flex;
  height: 46px;
  width: 46px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: #c7e1d0;
  color: #0c4923;
}

.summary-title {
  font-size: 12px;
  color: #64748b;
}

.summary-value {
  margin-top: 2px;
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

@media (max-width: 768px) {
  .profile-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}
</style>