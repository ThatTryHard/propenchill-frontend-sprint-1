<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/users/auth'
import { useSuratAntreanStore } from '@/stores/surat_antrean'
import { ClipboardList, LogOut, Settings } from 'lucide-vue-next'

const authStore = useAuthStore()
const store = useSuratAntreanStore()

defineProps<{ activeItem?: string }>()

onMounted(() => {
  store.fetchAntreanList()
})

const canSeeVerification = computed(() => {
  const allowedRoles = ['ADMIN', 'KEPSEK', 'BIDANG_AGAMA', 'BIDANG_KESISWAAN', 'BIDANG_AKADEMIK']
  return allowedRoles.includes(authStore.role || '')
})
</script>

<template>
  <aside class="w-[272px] min-w-[272px] h-screen bg-[#f0f5f1] flex flex-col p-6 box-border overflow-y-auto border-r border-[#e2e8f0]">
    <div class="flex items-center gap-3 mb-8 px-1 text-left">
      <div class="w-11 h-11 bg-[#2d6a4f] rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 text-lg">SIMP</div>
      <div class="flex flex-col overflow-hidden text-left">
        <span class="text-xl font-black text-[#1b4332] leading-none text-left">SIMP</span>
        <span class="text-[10px] text-[#4a7c59] leading-tight mt-1 text-left">Sistem Informasi<br/>Manajemen Persuratan</span>
      </div>
    </div>

    <nav class="flex flex-col gap-1 flex-1">
      <RouterLink 
        v-if="canSeeVerification"
        to="/surat-antrean" 
        class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold no-underline transition-all"
        :class="activeItem === 'antrean' ? 'bg-[#1b4332] text-white shadow-md' : 'text-[#2d5a3d] hover:bg-[#d8eed9]'"
      >
        <ClipboardList class="w-5 h-5 flex-shrink-0" /> 
        <span class="leading-tight text-left">Verifikasi dan Persetujuan Berjenjang</span>
      </RouterLink>

      <template v-if="authStore.role === 'ADMIN'">
         <div class="text-[10px] font-bold text-[#4a7c59] uppercase tracking-wider mt-6 mb-2 px-4 opacity-50 text-left">Admin Tools</div>
         <RouterLink to="/admin/management" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#2d5a3d] hover:bg-[#d8eed9] no-underline transition-all">
            <Settings class="w-5 h-5 text-[#4a7c59]" /> <span>User Management</span>
         </RouterLink>
      </template>
    </nav>

    <div class="flex flex-col gap-1 mt-auto pt-4 border-t border-[#d1dbd3]">
      <button @click="authStore.logout()" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#2d5a3d] hover:bg-[#d8eed9] w-full text-left transition-all outline-none border-none bg-transparent cursor-pointer">
        <LogOut class="w-5 h-5 text-[#4a7c59]" /> <span>Log Out</span>
      </button>
      
      <div class="flex items-center gap-3 p-3 bg-gradient-to-br from-[#a0714f] to-[#c49a6c] rounded-xl text-white mt-2 shadow-sm overflow-hidden">
        <div class="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-[10px] font-bold flex-shrink-0 uppercase">
          {{ authStore.user?.nama?.substring(0, 2) || 'NA' }}
        </div>
        <div class="flex flex-col overflow-hidden text-left">
          <span class="text-xs font-bold truncate">{{ authStore.user?.nama || 'Nazwa Arifah' }}</span>
          <span class="text-[10px] opacity-80 truncate">{{ authStore.user?.email }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>