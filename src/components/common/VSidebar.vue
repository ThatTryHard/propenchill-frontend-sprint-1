<template>
  <aside
    class="flex flex-col h-screen w-[260px] min-w-[260px] bg-gradient-to-b from-[#f0f7f2] to-[#e8f3eb] border-r border-[#d4e8da] py-6 px-4"
  >
    <div class="flex items-center mb-6">
      <img src="@/assets/SIMP_logo.png" alt="SIMP" class="h-24 object-contain" />
    </div>

    <nav class="flex flex-col gap-1 flex-1">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        custom
        v-slot="{ isActive, navigate }"
      >
        <button
          @click="navigate"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 w-full text-left',
            isActive
              ? 'bg-gradient-to-r from-[#3F9760] to-[#D1955F] text-white shadow-md'
              : 'text-[#4a5568] hover:bg-[#d4e8da]/60',
          ]"
        >
          <component :is="item.icon" :size="20" :stroke-width="2" />
          <span>{{ item.label }}</span>
        </button>
      </router-link>
    </nav>

    <div class="flex flex-col gap-1 mt-auto mb-4">
      <button
        v-for="item in bottomItems"
        :key="item.name"
        @click="handleBottomItemClick(item)"
        class="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-[#4a5568] hover:bg-[#d4e8da]/60 transition-all duration-200 w-full text-left"
      >
        <component :is="item.icon" :size="20" :stroke-width="2" />
        <span>{{ item.label }}</span>
      </button>
    </div>

    <!-- User Profile -->
    <div class="flex items-center gap-3 px-3 py-3 bg-[#4d8b47] rounded-2xl">
      <div class="profile-ring flex items-center justify-center w-11 h-11 rounded-full">
        <div class="flex items-center justify-center w-9 h-9 rounded-full bg-[#f0f7f2]">
          <UserRound :size="22" class="text-[#3F9760]" />
        </div>
      </div>

      <div class="flex flex-col leading-tight overflow-hidden">
        <span class="text-[13px] font-semibold text-white truncate">
          {{ userName || 'User' }}
        </span>
        <span class="text-[11px] text-white/85 truncate">
          {{ userEmail || '-' }}
        </span>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { UserRound } from 'lucide-vue-next'

export interface NavItem {
  name: string
  label: string
  path: string
  icon: Component
}

export interface BottomNavItem {
  name: string
  label: string
  icon: Component
  action?: () => void
}

const props = defineProps<{
  navItems: NavItem[]
  bottomItems: BottomNavItem[]
  userName?: string
  userEmail?: string
}>()

const handleBottomItemClick = (item: BottomNavItem) => {
  if (item.action) {
    item.action()
  }
}
</script>

<style scoped>
.profile-ring {
  background: conic-gradient(#3f9760 0deg, #3f9760 120deg, #d1955f 240deg, #3f9760 360deg);
  padding: 2.5px;
}
</style>
