<template>
  <aside
    class="flex flex-col h-screen w-[210px] min-w-[210px] bg-gradient-to-b from-[#f0f7f2] to-[#e8f3eb] border-r border-[#d4e8da] py-4 px-3 overflow-hidden"
  >
    <div class="flex items-center mb-5">
      <img src="@/assets/SIMP_logo.png" alt="SIMP" class="h-24 object-contain" />
    </div>

    <nav class="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        custom
        v-slot="{ navigate }"
      >
        <button
          @click="navigate"
          :class="[
            'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10.5px] font-semibold transition-all duration-200 w-full text-left',
            isNavItemActive(item)
              ? 'bg-gradient-to-r from-[#3F9760] to-[#D1955F] text-white shadow-md'
              : 'text-[#4a5568] hover:bg-[#d4e8da]/60',
          ]"
        >
          <component :is="item.icon" :size="20" :stroke-width="2" />
          <span>{{ item.label }}</span>
        </button>
      </router-link>
    </nav>

    <div class="flex flex-col mt-auto">
      <div class="flex flex-col gap-1 mb-4">
        <button
          v-for="item in bottomItems"
          :key="item.name"
          @click="handleBottomItemClick(item)"
          class="flex items-center gap-3 px-4 py-1.5 rounded-xl text-[10.5px] font-medium text-[#4a5568] hover:bg-[#d4e8da]/60 transition-all duration-200 w-full text-left"
        >
          <component :is="item.icon" :size="20" :stroke-width="2" />
          <span>{{ item.label }}</span>
        </button>
      </div>

      <!-- User Profile -->
      <div class="flex items-center gap-3 px-3 py-3 bg-[#4d8b47] rounded-2xl">
        <div class="profile-ring flex items-center justify-center w-9 h-9 rounded-full">
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-[#f0f7f2]">
            <UserRound :size="18" class="text-[#3F9760]" />
          </div>
        </div>

        <div class="flex flex-col leading-tight overflow-hidden">
          <span class="text-[10.5px] font-semibold text-white truncate">
            {{ userName || 'User' }}
          </span>
          <span class="text-[9px] text-white/85 truncate">
            {{ userEmail || '-' }}
          </span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { useRoute } from 'vue-router'
import { UserRound } from 'lucide-vue-next'

export interface NavItem {
  name: string
  label: string
  path: string
  icon: Component
  matchPaths?: string[]
  isActive?: boolean
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

const route = useRoute()

function normalizePath(path: string) {
  if (!path) return '/'
  const [withoutQuery] = path.split('?')
  const [withoutHash] = (withoutQuery || '/').split('#')
  const normalized = (withoutHash || '/').replace(/\/+$/, '')
  return normalized || '/'
}

function isPathWithinModule(currentPath: string, modulePath: string) {
  if (modulePath === '/') {
    return currentPath === '/'
  }

  return currentPath === modulePath || currentPath.startsWith(`${modulePath}/`)
}

function getMatchScore(currentPath: string, itemPath: string) {
  if (currentPath === itemPath) {
    // Exact match has highest priority.
    return 2000 + itemPath.length
  }

  if (isPathWithinModule(currentPath, itemPath)) {
    // Prefix/module match gets lower priority than exact.
    return 1000 + itemPath.length
  }

  return -1
}

function getItemPathCandidates(item: NavItem) {
  const explicitPaths = Array.isArray(item.matchPaths) ? item.matchPaths : []
  return [item.path, ...explicitPaths].map((path) => normalizePath(path))
}

function getItemBestScore(currentPath: string, item: NavItem) {
  const candidates = getItemPathCandidates(item)
  let best = -1

  for (const itemPath of candidates) {
    const score = getMatchScore(currentPath, itemPath)
    if (score > best) {
      best = score
    }
  }

  return best
}

function getHighestMatchScore(currentPath: string) {
  let highest = -1

  for (const item of props.navItems) {
    const score = getItemBestScore(currentPath, item)
    if (score > highest) {
      highest = score
    }
  }

  return highest
}

function isNavItemActive(item: NavItem) {
  if (item.isActive) return true

  const currentPath = normalizePath(route.path)
  const itemScore = getItemBestScore(currentPath, item)

  if (itemScore < 0) {
    return false
  }

  const highestScore = getHighestMatchScore(currentPath)

  // Only keep the most specific matching menu item active.
  if (itemScore < highestScore) {
    return false
  }

  return true
}

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
