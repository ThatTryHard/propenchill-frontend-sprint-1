<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import VSidebar from '@/components/common/VSidebar.vue'

import {
  Mail,
  List,
  LayoutGrid,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-vue-next'

defineProps<{
  userName?: string
  userEmail?: string
}>()

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const navItems = [
  {
    name: 'template-surat',
    label: 'Manajemen Template Surat',
    path: '/template-surat',
    icon: Mail,
  },
  {
    name: 'log-riwayat',
    label: 'Log dan Riwayat Aktivitas Persuratan',
    path: '/log-aktivitas',
    icon: List,
  },
  {
    name: 'student-management',
    label: 'Manajemen Basis Data Siswa dan Staf',
    path: '/students',
    icon: LayoutGrid,
  },
]

const bottomItems = [
  { name: 'settings', label: 'Settings', icon: Settings },
  { name: 'help', label: 'Help', icon: HelpCircle },
  { name: 'logout', label: 'Log Out', icon: LogOut, action: handleLogout },
]
</script>

<template>
  <VSidebar
    :navItems="navItems"
    :bottomItems="bottomItems"
    :userName="userName"
    :userEmail="userEmail"
  />
</template>