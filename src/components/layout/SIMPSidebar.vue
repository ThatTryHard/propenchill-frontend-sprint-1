<template>
  <VSidebar
    :navItems="currentNavItems"
    :bottomItems="bottomItems"
    :userName="authStore.user?.nama"
    :userEmail="authStore.user?.email"
  />

  <LogoutConfirmationModal
    :isOpen="isLogoutModalOpen"
    @update:isOpen="isLogoutModalOpen = $event"
    @confirmed="handleLogout"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import type { NavItem } from '@/components/common/VSidebar.vue'
import VSidebar from '@/components/common/VSidebar.vue'
import LogoutConfirmationModal from '@/components/common/LogoutConfirmationModal.vue'
import {
  ClipboardCheck,
  Inbox,
  PlusCircle,
  FileText,
  Users,
  BarChart3,
  ShieldCheck,
  UserRound,
  FilePlus2,
  Settings,
  HelpCircle,
  LogOut,
  Mail,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const isLogoutModalOpen = ref(false)

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const openLogoutModal = () => {
  isLogoutModalOpen.value = true
}

// DEFINISI MENU BERDASARKAN ROLE
const currentNavItems = computed(() => {
  const role = String(authStore.role || '').toUpperCase()

  // 1. ROLE ADMIN
  if (role === 'ADMIN') {
    const adminItems: NavItem[] = [
      { name: 'parents', label: 'Kelola Wali Murid', path: '/admin/parents', icon: Users },
      { name: 'teachers', label: 'Kelola Akun Guru', path: '/admin/teachers', icon: UserRound },
      {
        name: 'students',
        label: 'Basis Data Siswa & Staf',
        path: '/admin/students',
        icon: BarChart3,
      },
      { name: 'staff', label: 'Kelola Akun Staff', path: '/admin/management', icon: ShieldCheck },
      {
        name: 'surat-masuk',
        label: 'Arsip Surat Masuk',
        path: '/admin/surat-masuk',
        icon: Inbox,
        matchPaths: ['/admin/surat-masuk'],
      },
      {
        name: 'surat-antrean-admin',
        label: 'Verifikasi Berjenjang',
        path: '/admin/surat-antrean',
        icon: ClipboardCheck,
        matchPaths: ['/admin/surat-antrean'],
      },
      {
        name: 'template-management',
        label: 'Manajemen Template',
        path: '/letter_templates',
        icon: Mail,
      },
      {
        name: 'template-create',
        label: 'Tambah Template',
        path: '/letter_templates/create',
        icon: PlusCircle,
      },
      {
        name: 'surat-keluar',
        label: 'Pengajuan Surat Keluar',
        path: '/surat-keluar/pengajuan',
        icon: FilePlus2,
      },
      {
        name: 'riwayat-pengajuan',
        label: 'Riwayat Pengajuan Surat',
        path: '/surat-keluar/riwayat',
        icon: FileText,
        matchPaths: ['/surat-keluar/detail'],
      },
    ]

    return adminItems
  }

  // 2. ROLE GURU BIDANG (AKADEMIK, KESISWAAN, AGAMA)
  if (['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'].includes(role || '')) {
    const departmentItems: NavItem[] = [
      {
        name: 'surat-antrean-department',
        label: 'Verifikasi Berjenjang',
        path: '/department-teachers/surat-antrean',
        icon: ClipboardCheck,
        matchPaths: ['/department-teachers/surat-antrean'],
      },
      {
        name: 'inbox',
        label: 'Arsip Surat Masuk',
        path: '/department-teachers/surat-masuk',
        icon: Inbox,
        matchPaths: ['/department-teachers/surat-masuk'],
      },
      {
        name: 'create-inbox',
        label: 'Catat Surat Masuk',
        path: '/department-teachers/surat-masuk/create',
        icon: PlusCircle,
      },
      {
        name: 'template-management',
        label: 'Manajemen Template',
        path: '/letter_templates',
        icon: Mail,
      },
      {
        name: 'template-create',
        label: 'Tambah Template',
        path: '/letter_templates/create',
        icon: PlusCircle,
      },
    ]

    return departmentItems
  }

  // 3. ROLE KEPSEK
  if (role === 'KEPSEK') {
    const kepsekItems: NavItem[] = [
      {
        name: 'surat-antrean-kepsek',
        label: 'Verifikasi & Persetujuan',
        path: '/kepsek/surat-antrean',
        icon: ClipboardCheck,
        matchPaths: ['/kepsek/surat-antrean'],
      },
      { name: 'inbox', label: 'Arsip Surat Masuk', path: '/kepsek/surat-masuk', icon: Inbox },
    ]

    return kepsekItems
  }

  // 4. ROLE GURU ATAU WALI MURID (Pengaju Surat)
  if (['GURU', 'WALI_MURID'].includes(role || '')) {
    const requesterItems: NavItem[] = [
      {
        name: 'create-request',
        label: 'Buat Pengajuan Surat',
        path: '/surat-keluar/pengajuan',
        icon: FilePlus2,
      },
      {
        name: 'my-history',
        label: 'Riwayat Pengajuan',
        path: '/surat-keluar/riwayat',
        icon: FileText,
        matchPaths: ['/surat-keluar/detail'],
      },
    ]

    return requesterItems
  }

  return []
})

const bottomItems = [
  { name: 'settings', label: 'Settings', icon: Settings },
  { name: 'help', label: 'Help', icon: HelpCircle },
  { name: 'logout', label: 'Log Out', icon: LogOut, action: openLogoutModal },
]
</script>
