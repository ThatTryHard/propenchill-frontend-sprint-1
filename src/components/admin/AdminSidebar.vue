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
import {
  LayoutDashboard,
  Users,
  BarChart3,
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

const navItems = [
  { name: 'parents', label: 'Kelola Wali Murid', path: '/admin/parents', icon: Users },
  { name: 'placeholder1', label: 'Lorem', path: '/admin/lorem1', icon: BarChart3 },
]

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const bottomItems = [
  { name: 'settings', label: 'Settings', icon: Settings },
  { name: 'help', label: 'Help', icon: HelpCircle },
  { name: 'logout', label: 'Log Out', icon: LogOut, action: handleLogout },
]
</script>
