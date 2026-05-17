<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import { useProfileStore } from '@/stores/profile'

import VSidebar from '@/components/common/VSidebar.vue'
import LogoutConfirmationModal from '@/components/common/LogoutConfirmationModal.vue'
import type { NavItem, BottomNavItem } from '@/components/common/VSidebar.vue'

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

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const profileStore = useProfileStore()

const isLogoutModalOpen = ref(false)
const props = defineProps<{
  userAvatar?: string | null
}>()

const CustomDetailIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 22 18',
      fill: 'none',
      class: 'h-[1.15rem] w-[1.15rem] shrink-0 text-current',
    },
    [
      h('path', {
        d: 'M21.0002 4L12.0092 9.727C11.7041 9.90421 11.3576 9.99755 11.0047 9.99755C10.6519 9.99755 10.3054 9.90421 10.0002 9.727L1.00024 4M3.00024 1H19.0002C20.1048 1 21.0002 1.89543 21.0002 3V15C21.0002 16.1046 20.1048 17 19.0002 17H3.00024C1.89567 17 1.00024 16.1046 1.00024 15V3C1.00024 1.89543 1.89567 1 3.00024 1Z',
        stroke: 'currentColor',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    ],
  )

const userAvatar = computed(() => {
  if (props.userAvatar) return props.userAvatar
  return profileStore.profile?.avatar_url || null
})

onMounted(() => {
  if (!profileStore.profile) {
    profileStore.fetchProfile()
  }
})

const normalizedRole = computed(() => {
  return String(authStore.role || '').toUpperCase()
})

const isDepartmentRole = computed(() => {
  return ['BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK'].includes(normalizedRole.value)
})

const isRequesterRole = computed(() => {
  return ['GURU', 'WALI_MURID'].includes(normalizedRole.value)
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const openLogoutModal = () => {
  isLogoutModalOpen.value = true
}

const getDepartmentDashboardConfig = () => {
  if (normalizedRole.value === 'BIDANG_AKADEMIK') {
    return {
      label: 'Akademik',
      path: '/akademik/dashboard',
    }
  }

  if (normalizedRole.value === 'BIDANG_KESISWAAN') {
    return {
      label: 'Kesiswaan',
      path: '/kesiswaan/dashboard',
    }
  }

  return {
    label: 'Keagamaan',
    path: '/keagamaan/dashboard',
  }
}

const currentNavItems = computed<NavItem[]>(() => {
  if (normalizedRole.value === 'ADMIN') {
    return [
      {
        name: 'parents',
        label: 'Kelola Wali Murid',
        path: '/admin/parents',
        icon: Users,
        matchPaths: ['/admin/parents'],
      },
      {
        name: 'teachers',
        label: 'Kelola Akun Guru',
        path: '/admin/teachers',
        icon: UserRound,
        matchPaths: ['/admin/teachers'],
      },
      {
        name: 'students',
        label: 'Basis Data Siswa & Staf',
        path: '/admin/students',
        icon: BarChart3,
        matchPaths: ['/admin/students'],
      },
      {
        name: 'staff',
        label: 'Kelola Akun Staff',
        path: '/admin/management',
        icon: ShieldCheck,
        matchPaths: ['/admin/management'],
      },
      {
        name: 'surat-masuk-admin',
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
        matchPaths: ['/letter_templates'],
      },
      {
        name: 'template-create',
        label: 'Tambah Template',
        path: '/letter_templates/create',
        icon: PlusCircle,
        matchPaths: ['/letter_templates/create'],
      },
      {
        name: 'surat-keluar',
        label: 'Pengajuan Surat Keluar',
        path: '/surat-keluar/pengajuan',
        icon: FilePlus2,
        matchPaths: ['/surat-keluar/pengajuan'],
      },
      {
        name: 'riwayat-pengajuan',
        label: 'Riwayat Pengajuan Surat',
        path: '/surat-keluar/riwayat',
        icon: FileText,
        matchPaths: ['/surat-keluar/riwayat', '/surat-keluar/detail'],
      },
      {
        name: 'activity-logs-admin',
        label: 'Log dan Riwayat Aktivitas',
        path: '/admin/activity-logs',
        icon: ClipboardList,
        matchPaths: ['/admin/activity-logs'],
      },
    ]
  }

  if (isDepartmentRole.value) {
    const dashboardConfig = getDepartmentDashboardConfig()

    const departmentItems: NavItem[] = [
      {
        name: `dashboard-${dashboardConfig.label.toLowerCase()}`,
        label: `Dashboard Ringkasan Surat Bidang ${dashboardConfig.label}`,
        path: dashboardConfig.path,
        icon: LayoutDashboard,
        matchPaths: [dashboardConfig.path],
      },
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
        name: 'surat-masuk-department',
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
        matchPaths: ['/department-teachers/surat-masuk/create'],
      },
      {
        name: 'template-management',
        label: 'Manajemen Template',
        path: '/letter_templates',
        icon: Mail,
        matchPaths: ['/letter_templates'],
      },
    )

    return departmentItems
  }

  if (normalizedRole.value === 'KEPSEK') {
    return [
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
      {
        name: 'surat-masuk-kepsek',
        label: 'Arsip Surat Masuk',
        path: '/kepsek/surat-masuk',
        icon: Inbox,
        matchPaths: ['/kepsek/surat-masuk'],
      },
      {
        name: 'activity-logs-kepsek',
        label: 'Log dan Riwayat Aktivitas',
        path: '/kepsek/activity-logs',
        icon: ClipboardList,
        matchPaths: ['/kepsek/activity-logs'],
      },
    ]
  }

  if (isRequesterRole.value) {
    return [
      {
        name: 'create-request',
        label: 'Buat Pengajuan Surat',
        path: '/surat-keluar/pengajuan',
        icon: FilePlus2,
        matchPaths: ['/surat-keluar/pengajuan'],
      },
      {
        name: 'my-history',
        label: 'Riwayat Pengajuan',
        path: '/surat-keluar/riwayat',
        icon: FileText,
        matchPaths: ['/surat-keluar/riwayat', '/surat-keluar/detail'],
      },
    ]
  }

  return []
})

const bottomItems = computed<BottomNavItem[]>(() => {
  const items: BottomNavItem[] = [
    {
      name: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: Settings,
      matchPaths: ['/settings'],
    },
  ]

  if (normalizedRole.value === 'WALI_MURID') {
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

<template>
  <VSidebar
    :navItems="currentNavItems"
    :bottomItems="bottomItems"
    :userName="authStore.user?.nama"
    :userEmail="authStore.user?.email"
    :userAvatar="userAvatar"
    class="[&_.lucide]:h-[1.15rem] [&_.lucide]:w-[1.15rem] [&_.lucide]:shrink-0 [&_.lucide]:text-current sticky top-0 h-screen self-start"
  />

  <LogoutConfirmationModal
    :isOpen="isLogoutModalOpen"
    @update:isOpen="isLogoutModalOpen = $event"
    @confirmed="handleLogout"
  />
</template>
