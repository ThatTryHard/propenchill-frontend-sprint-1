<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import VSidebar from '@/components/common/VSidebar.vue'
import { PlusCircle, Settings, HelpCircle, LogOut, Inbox } from 'lucide-vue-next'

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
    name: 'department-teachers-surat-masuk-list',
    label: 'Arsip Surat Masuk',
    path: '/department-teachers/surat-masuk',
    icon: Inbox,
  },
  {
    name: 'department-teachers-surat-masuk-create',
    label: 'Buat Pengajuan Surat Masuk',
    path: '/department-teachers/surat-masuk/create',
    icon: PlusCircle,
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
