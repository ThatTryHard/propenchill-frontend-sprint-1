<template>
  <div class="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans">
    <div class="h-full flex-shrink-0 relative z-20 shadow-sm">
      <slot name="sidebar" />
    </div>

    <main class="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth">
      <slot />
    </main>
  </div>
</template>

<style scoped>
main::-webkit-scrollbar {
  width: 1px;
}
main::-webkit-scrollbar-track {
  background: transparent;
}
main::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
main::-webkit-scrollbar-thumb:hover {
  background-color: #94a3b8;
}
</style>
