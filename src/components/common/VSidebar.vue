<template>
  <aside
    class="simp-sidebar flex flex-col h-screen w-[210px] min-w-[210px] border-r py-4 px-3 overflow-hidden"
  >
    <div class="flex items-center mb-5">
      <img
        :src="sidebarLogo"
        :key="sidebarLogo"
        alt="SIMP"
        class="h-24 object-contain"
      />
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
            'sidebar-menu-item flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[10.5px] font-semibold transition-all duration-200 w-full text-left',
            isNavItemActive(item)
              ? 'sidebar-menu-active text-white shadow-md'
              : 'sidebar-menu-inactive',
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
          :class="[
            'sidebar-menu-item flex items-center gap-3 px-4 py-1.5 rounded-xl text-[10.5px] font-medium transition-all duration-200 w-full text-left',
            isBottomItemActive(item)
              ? 'sidebar-menu-active text-white shadow-md'
              : 'sidebar-menu-inactive',
          ]"
        >
          <component :is="item.icon" :size="20" :stroke-width="2" />
          <span>{{ item.label }}</span>
        </button>
      </div>

      <button
        type="button"
        @click="goToProfile"
        :class="[
          'sidebar-profile-card flex items-center gap-3 px-3 py-3 rounded-2xl w-full text-left transition-all duration-200',
          isProfileActive
            ? 'sidebar-menu-active text-white shadow-md'
            : 'hover:brightness-105 hover:shadow-md',
        ]"
      >
        <div class="profile-ring flex items-center justify-center w-9 h-9 rounded-full">
          <div class="profile-icon-bg flex items-center justify-center w-7 h-7 rounded-full">
            <UserRound :size="18" class="text-[var(--app-accent)]" />
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
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserRound } from 'lucide-vue-next'
import simpLogoLight from '@/assets/SIMP_logo.png'
import simpLogoDark from '@/assets/SIMP_logo_dark.png'
import { useSettingsPreferenceStore } from '@/stores/settingsPreference'

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
  path?: string
  matchPaths?: string[]
  action?: () => void
}

const props = defineProps<{
  navItems: NavItem[]
  bottomItems: BottomNavItem[]
  userName?: string
  userEmail?: string
  userAvatar?: string | null
}>()

const route = useRoute()
const router = useRouter()
const settingsPreferenceStore = useSettingsPreferenceStore()

const sidebarLogo = computed(() => {
  const savedTheme = settingsPreferenceStore.preference?.theme || localStorage.getItem('theme')

  return savedTheme === 'DARK' ? simpLogoDark : simpLogoLight
})

const isProfileActive = computed(() => normalizePath(route.path) === '/profile')

const goToProfile = () => {
  router.push('/profile')
}

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
    return 2000 + itemPath.length
  }

  if (isPathWithinModule(currentPath, itemPath)) {
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

  if (itemScore < highestScore) {
    return false
  }

  return true
}

function isBottomItemActive(item: BottomNavItem) {
  if (!item.path) return false

  const currentPath = normalizePath(route.path)
  const itemPath = normalizePath(item.path)

  if (currentPath === itemPath) return true

  if (item.matchPaths?.length) {
    return item.matchPaths.some((path) => {
      const normalizedMatchPath = normalizePath(path)
      return isPathWithinModule(currentPath, normalizedMatchPath)
    })
  }

  return false
}

const handleBottomItemClick = (item: BottomNavItem) => {
  if (item.action) {
    item.action()
    return
  }

  if (item.path) {
    router.push(item.path)
  }
}
</script>

<style scoped>
.simp-sidebar {
  background: linear-gradient(180deg, var(--app-sidebar-bg-start) 0%, var(--app-sidebar-bg-end) 100%);
  border-color: var(--app-sidebar-border);
  color: var(--app-sidebar-text);
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.sidebar-menu-inactive {
  color: var(--app-sidebar-muted);
}

.sidebar-menu-inactive:hover {
  background: var(--app-sidebar-hover);
}

.sidebar-menu-active {
  background: linear-gradient(90.74deg, var(--app-accent), var(--app-accent-2));
}

.sidebar-profile-card {
  background: var(--app-sidebar-profile-bg);
}

.profile-icon-bg {
  background: var(--app-soft-card);
}

.profile-ring {
  background: conic-gradient(
    var(--app-accent) 0deg,
    var(--app-accent) 120deg,
    var(--app-accent-2) 240deg,
    var(--app-accent) 360deg
  );
  padding: 2.5px;
}
</style>