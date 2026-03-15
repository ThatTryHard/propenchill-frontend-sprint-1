<template>
  <VSidebar
    :navItems="navItems"
    :bottomItems="bottomItems"
    :userName="displayUserName"
    :userEmail="displayUserEmail"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/users/auth'
import VSidebar from '@/components/common/VSidebar.vue'
import {
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  ShieldCheck, 
} from 'lucide-vue-next'

const props = defineProps<{
  userName?: string
  userEmail?: string
}>()

const router = useRouter()
const authStore = useAuthStore()

const displayUserName = computed(() => props.userName || authStore.user?.nama || 'User')
const displayUserEmail = computed(() => props.userEmail || authStore.user?.email || '-')

const navItems = [
  { name: 'parents', label: 'Kelola Wali Murid', path: '/admin/parents', icon: Users },
  { 
    name: 'staff', 
    label: 'Kelola Akun Staff', 
    path: '/admin-management', 
    icon: ShieldCheck 
  },
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