<template>
  <div class="dashboard-shell flex h-screen w-full overflow-hidden font-sans">
    <div class="h-full flex-shrink-0 relative z-20 shadow-sm">
      <slot name="sidebar" />
    </div>

    <main class="flex-1 h-full overflow-y-auto overflow-x-hidden relative scroll-smooth">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.dashboard-shell {
  background: var(--app-bg);
  color: var(--app-text);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    font-size 0.2s ease;
}

:global(html[data-text-size='small']) .dashboard-shell {
  font-size: 13px;
}

:global(html[data-text-size='default']) .dashboard-shell {
  font-size: 14px;
}

:global(html[data-text-size='large']) .dashboard-shell {
  font-size: 16px;
}

main::-webkit-scrollbar {
  width: 1px;
}

main::-webkit-scrollbar-track {
  background: transparent;
}

main::-webkit-scrollbar-thumb {
  background-color: var(--app-border);
  border-radius: 10px;
}

main::-webkit-scrollbar-thumb:hover {
  background-color: var(--app-muted);
}
</style>