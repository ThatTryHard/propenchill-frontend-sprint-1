<template>
  <div
    class="
      flex h-screen h-[100dvh] w-full overflow-hidden
      bg-[var(--app-bg)] text-[var(--app-text)]
      font-[var(--font-sans)] text-[length:var(--app-font-base)] leading-[1.5]
      transition-colors duration-200
      max-[768px]:min-h-screen max-[768px]:min-h-[100dvh]
    "
  >
    <aside class="relative z-20 h-full shrink-0">
      <slot name="sidebar" />
    </aside>

    <main
      class="
        relative h-full flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain
        scroll-smooth bg-[var(--app-bg)] text-[var(--app-text)]
        max-[768px]:w-full
        [&::-webkit-scrollbar]:w-[4px]
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:rounded-[10px]
        [&::-webkit-scrollbar-thumb]:bg-[var(--app-border)]
        [&::-webkit-scrollbar-thumb:hover]:bg-[var(--app-muted)]
      "
    >
      <slot />
    </main>
  </div>
 </template>
