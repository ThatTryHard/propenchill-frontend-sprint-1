<template>
  <div class="flex h-screen w-screen overflow-hidden">
    <slot name="sidebar" />
    <main class="flex-1 overflow-auto bg-[#FAFAFA]">
      <slot />
    </main>
  </div>
</template>
