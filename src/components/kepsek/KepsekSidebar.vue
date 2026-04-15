<template>
  <VSidebar
    :navItems="navItems"
    :bottomItems="bottomItems"
    :userName="userName"
    :userEmail="userEmail"
  />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import VSidebar from '@/components/common/VSidebar.vue'
import { ClipboardCheck, Settings, HelpCircle, LogOut } from 'lucide-vue-next'

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
    name: 'kepsek-surat-antrean',
    label: 'Verifikasi dan Persetujuan Berjenjang',
    path: '/kepsek/surat-antrean',
    icon: ClipboardCheck,
  },
]

const bottomItems = [
  { name: 'settings', label: 'Settings', icon: Settings },
  { name: 'help', label: 'Help', icon: HelpCircle },
  { name: 'logout', label: 'Log Out', icon: LogOut, action: handleLogout },
]
</script>
