<template>
  <div class="flex h-screen w-full bg-[#F9FAFB] overflow-hidden">
    <SIMPSidebar />

    <div class="flex-1 flex flex-col min-w-0">
      <DashboardNavbar />
      
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue';
</script>