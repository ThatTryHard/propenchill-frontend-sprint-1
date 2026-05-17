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

<template>
  <aside
    class="flex h-full w-[180px] min-w-[180px] flex-col overflow-x-hidden overflow-y-auto border-r border-[var(--app-sidebar-border)] px-3 py-4 font-[var(--font-sans)] text-[var(--app-sidebar-text)] transition-[background,border-color,color] duration-200 ease-in-out [background:linear-gradient(180deg,var(--app-sidebar-bg-start)_0%,var(--app-sidebar-bg-end)_100%)] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-[var(--app-sidebar-border)] [&::-webkit-scrollbar-thumb:hover]:bg-[var(--app-sidebar-muted)]"
  >
    <div class="mb-5 flex items-center">
      <img :src="sidebarLogo" :key="sidebarLogo" alt="SIMP" class="h-[96px] object-contain" />
    </div>

    <nav class="
        flex flex-1 flex-col gap-1
        min-h-0 overflow-y-auto
        [&::-webkit-scrollbar]:w-0
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-transparent
      ">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.path"
        custom
        v-slot="{ navigate }"
      >
        <button
          type="button"
          :class="[
            'flex w-full items-center gap-[10px] rounded-[8px] px-3 py-[10px] text-left',
            'text-[length:var(--app-sidebar-font)] font-semibold leading-[1.2]',
            'transition-[background-color,color,box-shadow,filter] duration-200 ease-in-out',
            isNavItemActive(item)
              ? '[background:var(--gradient-brand)] text-[var(--app-text-inverse)] shadow-[0_4px_8px_rgba(2,20,9,0.18)] [html.dark_&]:shadow-[0_4px_10px_rgba(0,0,0,0.32)]'
              : 'text-[var(--app-sidebar-muted)] hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-text)]',
          ]"
          @click="navigate"
        >
          <component :is="item.icon" :size="20" :stroke-width="2" />

          <span class="min-w-0 flex-1 text-inherit">
            {{ item.label }}
          </span>
        </button>
      </router-link>
    </nav>

    <div class="mt-auto flex flex-col">
      <div class="mb-4 flex flex-col gap-1">
        <button
          v-for="item in bottomItems"
          :key="item.name"
          type="button"
          :class="[
            'flex w-full items-center gap-3 rounded-[12px] px-4 py-[6px] text-left',
            'text-[length:var(--app-sidebar-font)] font-medium leading-[1.2]',
            'transition-[background-color,color,box-shadow,filter] duration-200 ease-in-out',
            isBottomItemActive(item)
              ? '[background:var(--gradient-brand)] text-[var(--app-text-inverse)] shadow-[0_4px_8px_rgba(2,20,9,0.18)] [html.dark_&]:shadow-[0_4px_10px_rgba(0,0,0,0.32)]'
              : 'text-[var(--app-sidebar-muted)] hover:bg-[var(--app-sidebar-hover)] hover:text-[var(--app-sidebar-text)]',
          ]"
          @click="handleBottomItemClick(item)"
        >
          <component :is="item.icon" :size="20" :stroke-width="2" />

          <span class="min-w-0 flex-1 text-inherit">
            {{ item.label }}
          </span>
        </button>
      </div>

      <button
        type="button"
        :class="[
          'flex w-full items-center gap-3 rounded-[16px] p-3 text-left',
          'transition-[filter,box-shadow,background-color] duration-200 ease-in-out',
          isProfileActive
            ? '[background:var(--gradient-brand)] text-[var(--app-text-inverse)] shadow-[0_4px_8px_rgba(2,20,9,0.18)] [html.dark_&]:shadow-[0_4px_10px_rgba(0,0,0,0.32)]'
            : 'bg-[var(--app-sidebar-profile-bg)] hover:brightness-105 hover:shadow-[0_4px_10px_rgba(2,20,9,0.16)] [html.dark_&]:hover:shadow-[0_4px_10px_rgba(0,0,0,0.28)]',
        ]"
        @click="goToProfile"
      >
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full p-[2.5px] [background:conic-gradient(var(--app-accent)_0deg,var(--app-accent)_120deg,var(--app-accent-2)_240deg,var(--app-accent)_360deg)]"
        >
          <div
            class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[var(--app-soft-card)]"
          >
            <img
              v-if="userAvatar"
              :src="userAvatar"
              alt="Avatar"
              class="h-full w-full object-cover"
            />

            <UserRound v-else :size="18" class="text-[var(--app-accent)]" />
          </div>
        </div>

        <div class="flex min-w-0 flex-col overflow-hidden leading-[1.2]">
          <span
            class="overflow-hidden text-ellipsis whitespace-nowrap text-[length:var(--app-sidebar-profile-font)] font-semibold text-[var(--app-text-inverse)]"
          >
            {{ userName || 'User' }}
          </span>

          <span
            class="overflow-hidden text-ellipsis whitespace-nowrap text-[length:var(--app-font-caption)] font-normal text-[var(--app-text-inverse-muted)]"
          >
            {{ userEmail || '-' }}
          </span>
        </div>
      </button>
    </div>
  </aside>
</template>
