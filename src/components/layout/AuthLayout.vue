<template>
  <div class="relative w-full min-h-screen overflow-hidden">
    <div
      class="absolute top-[286.79px] left-[calc(50%-683.87px)] w-[290.9px] h-[290.9px] rounded-full shrink-0 origin-top-left -rotate-[113.5deg] blur-[105.18px] bg-[linear-gradient(180deg,rgba(108,175,133,0.3)_23.08%,rgba(220,174,132,0.3))] pointer-events-none"
    />

    <div
      class="absolute top-[1163.79px] left-[calc(50%+569.13px)] w-[290.9px] h-[290.9px] rounded-full shrink-0 origin-top-left -rotate-[113.5deg] blur-[105.18px] bg-[linear-gradient(180deg,rgba(108,175,133,0.3)_23.08%,rgba(220,174,132,0.3))] pointer-events-none"
    />

    <div class="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
      <router-view />
    </div>
  </div>
</template>
