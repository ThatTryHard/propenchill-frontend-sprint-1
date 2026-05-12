<template>
  <VSidebar
    :navItems="currentNavItems"
    :bottomItems="bottomItems"
    :userName="authStore.user?.nama"
    :userEmail="authStore.user?.email"
    :userAvatar="userAvatar"
  />

  <LogoutConfirmationModal
    :isOpen="isLogoutModalOpen"
    @update:isOpen="isLogoutModalOpen = $event"
    @confirmed="handleLogout"
  />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/users/auth'
import { useProfileStore } from '@/stores/profile'
import type { NavItem, BottomNavItem } from '@/components/common/VSidebar.vue'
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
  LayoutDashboard,
  ClipboardList,
} from 'lucide-vue-next'
import { computed, ref, h } from 'vue'
import { useRouter, useRoute } from 'vue-router' 

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const profileStore = useProfileStore()
const isLogoutModalOpen = ref(false)

const CustomDetailIcon = () => h('svg', {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '22',
  height: '18',
  viewBox: '0 0 22 18',
  fill: 'none'
}, [
  h('path', {
    d: 'M21.0002 4L12.0092 9.727C11.7041 9.90421 11.3576 9.99755 11.0047 9.99755C10.6519 9.99755 10.3054 9.90421 10.0002 9.727L1.00024 4M3.00024 1H19.0002C20.1048 1 21.0002 1.89543 21.0002 3V15C21.0002 16.1046 20.1048 17 19.0002 17H3.00024C1.89567 17 1.00024 16.1046 1.00024 15V3C1.00024 1.89543 1.89567 1 3.00024 1Z',
    stroke: 'currentColor', 
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round'
  })
])

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const openLogoutModal = () => {
  isLogoutModalOpen.value = true
}

// Get avatar from profile store
const userAvatar = computed(() => profileStore.profile?.avatar_url || null)

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
      {
        name: 'activity-logs-admin',
        label: 'Log dan Riwayat Aktivitas',
        path: '/admin/activity-logs',
        icon: ClipboardList,
        matchPaths: ['/admin/activity-logs'],
      },
    ]

    return adminItems
  }

  // 2. ROLE GURU BIDANG (AKADEMIK, KESISWAAN, AGAMA)
  if (['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'].includes(role)) {
    let bidangLabel = ''
    let dashboardPath = ''

    if (role === 'BIDANG_AKADEMIK') {
      bidangLabel = 'Akademik'
      dashboardPath = '/akademik/dashboard'
    } else if (role === 'BIDANG_KESISWAAN') {
      bidangLabel = 'Kesiswaan'
      dashboardPath = '/kesiswaan/dashboard'
    } else if (role === 'BIDANG_AGAMA') {
      bidangLabel = 'Keagamaan'
      dashboardPath = '/keagamaan/dashboard'
    }

    const departmentItems: NavItem[] = [
      {
        name: `dashboard-${bidangLabel.toLowerCase()}`,
        label: `Dashboard Ringkasan Surat Bidang ${bidangLabel}`,
        path: dashboardPath,
        icon: LayoutDashboard, 
        matchPaths: [dashboardPath],
      }
    ]

    if (route.path.includes('/detail/')) {
      departmentItems.push({
        name: 'letter-detail',
        label: 'Detail Informasi Surat',
        path: route.path, 
        icon: CustomDetailIcon, 
        matchPaths: [route.path], 
      })
    }

    departmentItems.push(
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
      }
    )

    return departmentItems
  }

  // 3. ROLE KEPSEK
  if (role === 'KEPSEK') {
    const kepsekItems: NavItem[] = [
      {
        name: 'dashboard-kepsek',
        label: 'Dashboard',
        path: '/kepsek/dashboard',
        icon: LayoutDashboard,
        matchPaths: ['/kepsek/dashboard'],
      },
      {
        name: 'surat-pending-kepsek',
        label: 'Surat Pending',
        path: '/kepsek/surat-pending',
        icon: FileText,
        matchPaths: ['/kepsek/surat-pending'],
      },
      {
        name: 'surat-antrean-kepsek',
        label: 'Verifikasi & Persetujuan',
        path: '/kepsek/surat-antrean',
        icon: ClipboardCheck,
        matchPaths: ['/kepsek/surat-antrean'],
      },
      { name: 'inbox', label: 'Arsip Surat Masuk', path: '/kepsek/surat-masuk', icon: Inbox },
      {
        name: 'activity-logs-kepsek',
        label: 'Log dan Riwayat Aktivitas',
        path: '/kepsek/activity-logs',
        icon: ClipboardList,
        matchPaths: ['/kepsek/activity-logs'],
      },
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

const bottomItems = computed<BottomNavItem[]>(() => {
  const role = String(authStore.role || '').toUpperCase()

  const items: BottomNavItem[] = [
    {
      name: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ]

  if (role === 'WALI_MURID') {
    items.push({
      name: 'help',
      label: 'Help',
      path: '/help',
      icon: HelpCircle,
      matchPaths: ['/help'],
    })
  }

  items.push({
    name: 'logout',
    label: 'Log Out',
    icon: LogOut,
    action: openLogoutModal,
  })

  return items
})
</script>

<style scoped>
:deep(.lucide) {
  flex-shrink: 0 !important;
  width: 24px !important;
  height: 24px !important;
}
</style>
