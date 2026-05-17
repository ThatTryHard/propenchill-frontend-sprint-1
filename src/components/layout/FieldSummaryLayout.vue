<template>
  <div class="flex min-h-screen w-full overflow-x-hidden bg-[#F9FAFB]">
    <aside class="sticky top-0 h-screen shrink-0 self-start">
      <SIMPSidebar />
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
</script>
