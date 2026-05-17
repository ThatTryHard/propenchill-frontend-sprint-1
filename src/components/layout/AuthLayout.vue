<template>
  <main
    class="
      relative h-[100dvh] min-h-[100dvh] w-full overflow-hidden
      bg-[var(--app-bg)] text-[var(--app-text)]
      font-[var(--font-sans)]
    "
  >
    <div
      aria-hidden="true"
      class="
        pointer-events-none absolute h-[290px] w-[290px] rounded-full
        blur-[105px]
        [background:var(--app-public-blob,linear-gradient(180deg,rgba(108,175,133,0.3)_23.08%,rgba(220,174,132,0.3)))]
        left-[calc(50%-684px)] top-[28%] rotate-[-113.5deg]
        max-[768px]:left-[-140px] max-[768px]:top-[16%]
      "
    ></div>

    <div
      aria-hidden="true"
      class="
        pointer-events-none absolute h-[290px] w-[290px] rounded-full
        blur-[105px]
        [background:var(--app-public-blob,linear-gradient(180deg,rgba(108,175,133,0.3)_23.08%,rgba(220,174,132,0.3)))]
        bottom-[-120px] right-[calc(50%-860px)] rotate-[-113.5deg]
        max-[768px]:bottom-[-160px] max-[768px]:right-[-140px]
      "
    ></div>

    <section
      class="
        relative z-10 h-full min-h-0 w-full
      "
    >
      <router-view />
    </section>
  </main>
</template>