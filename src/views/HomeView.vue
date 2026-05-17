<template>
  <div
    ref="landingRef"
    class="
      relative isolate min-h-screen overflow-hidden
      bg-[var(--app-bg)] px-5 py-6
      font-[var(--font-sans)] text-[var(--app-text)]
      [--landing-radial-primary:rgba(23,99,61,0.16)]
      [--landing-radial-secondary:rgba(57,132,88,0.13)]
      [--landing-wave-primary-rgb:10,76,44]
      [--landing-wave-secondary-rgb:12,90,52]
      [--landing-wave-tertiary-rgb:20,103,62]
      [--landing-flow-primary-rgb:10,82,47]
      [--landing-flow-secondary-rgb:37,120,74]
      [--landing-flow-highlight:rgba(255,255,255,0.24)]
      [--landing-title-shadow:0_1px_0_rgba(255,255,255,0.6)]
      [html.dark_&]:[--landing-radial-primary:rgba(63,151,96,0.22)]
      [html.dark_&]:[--landing-radial-secondary:rgba(209,149,95,0.12)]
      [html.dark_&]:[--landing-wave-primary-rgb:63,151,96]
      [html.dark_&]:[--landing-wave-secondary-rgb:143,210,166]
      [html.dark_&]:[--landing-wave-tertiary-rgb:209,149,95]
      [html.dark_&]:[--landing-flow-primary-rgb:63,151,96]
      [html.dark_&]:[--landing-flow-secondary-rgb:209,149,95]
      [html.dark_&]:[--landing-flow-highlight:rgba(248,250,252,0.08)]
      [html.dark_&]:[--landing-title-shadow:0_1px_0_rgba(0,0,0,0.25)]
      sm:px-8 sm:py-7
    "
    :style="waveVars"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
  >
    <div
      class="
        pointer-events-none absolute inset-0
        [background:radial-gradient(circle_at_20%_18%,var(--landing-radial-primary),transparent_35%),radial-gradient(circle_at_82%_78%,var(--landing-radial-secondary),transparent_40%)]
      "
    />

    <!-- Logo sekolah kiri atas -->
    <div class="pointer-events-none absolute left-6 top-5 z-20 sm:left-10 sm:top-7">
      <img
        src="@/assets/Inrab_Logo.png"
        alt="Logo SMA Insan Rabbany"
        class="h-12 w-auto object-contain sm:h-14 md:h-16"
      />
    </div>

    <div
      class="pointer-events-none absolute inset-0 mix-blend-multiply"
      :style="{ opacity: (0.32 + waveEnergy * 0.2).toFixed(3) }"
    >
      <div
        class="
          absolute inset-[-8%]
          blur-[18px]
          animate-[landing-ripple-drift_var(--ripple-duration)_ease-in-out_infinite_alternate]
          [background-image:radial-gradient(var(--wave-spread)_calc(var(--wave-spread)_*_0.72)_at_var(--mx)_var(--my),rgba(var(--landing-wave-primary-rgb),calc(0.3_+_var(--wave-energy)_*_0.22))_0%,rgba(var(--landing-wave-primary-rgb),calc(0.13_+_var(--wave-energy)_*_0.11))_24%,rgba(var(--landing-wave-primary-rgb),0)_62%),repeating-linear-gradient(102deg,rgba(var(--landing-wave-secondary-rgb),calc(0.14_+_var(--wave-energy)_*_0.11))_0,rgba(var(--landing-wave-secondary-rgb),calc(0.14_+_var(--wave-energy)_*_0.11))_2px,rgba(var(--landing-wave-tertiary-rgb),0)_2px,rgba(var(--landing-wave-tertiary-rgb),0)_20px)]
          [background-size:100%_100%,220%_220%]
        "
      />
    </div>

    <div
      class="pointer-events-none absolute inset-0 mix-blend-multiply"
      :style="{ opacity: (0.21 + waveEnergy * 0.15).toFixed(3) }"
    >
      <div
        class="
          absolute inset-[-7%]
          blur-[28px]
          animate-[landing-ripple-bounce_var(--bounce-duration)_ease-in-out_infinite]
          [background-image:radial-gradient(calc(var(--wave-spread)_*_0.92)_calc(var(--wave-spread)_*_0.62)_at_calc(var(--mx)_-_7%)_calc(var(--my)_+_3%),rgba(var(--landing-wave-primary-rgb),calc(0.2_+_var(--wave-energy)_*_0.12))_0%,rgba(var(--landing-wave-primary-rgb),calc(0.1_+_var(--wave-energy)_*_0.07))_28%,rgba(var(--landing-flow-secondary-rgb),0)_64%),repeating-linear-gradient(94deg,rgba(var(--landing-wave-secondary-rgb),calc(0.11_+_var(--wave-energy)_*_0.07))_0,rgba(var(--landing-wave-secondary-rgb),calc(0.11_+_var(--wave-energy)_*_0.07))_1px,rgba(var(--landing-wave-tertiary-rgb),0)_1px,rgba(var(--landing-wave-tertiary-rgb),0)_22px)]
          [background-size:100%_100%,250%_250%]
        "
      />
    </div>

    <div
      class="pointer-events-none absolute inset-0 mix-blend-multiply"
      :style="{ opacity: (0.23 + waveEnergy * 0.12).toFixed(3) }"
    >
      <div
        class="
          absolute inset-0
          animate-[landing-flow-wave_var(--flow-duration)_linear_infinite]
          [background-image:linear-gradient(122deg,rgba(var(--landing-flow-primary-rgb),calc(0.12_+_var(--wave-energy)_*_0.08))_0%,rgba(var(--landing-flow-primary-rgb),0)_34%),linear-gradient(300deg,rgba(var(--landing-flow-secondary-rgb),calc(0.1_+_var(--wave-energy)_*_0.07))_0%,rgba(var(--landing-flow-secondary-rgb),0)_42%),radial-gradient(120%_72%_at_var(--mx)_var(--my),var(--landing-flow-highlight)_0%,transparent_62%)]
          [background-size:240%_240%]
        "
      />
    </div>

    <div
      class="
        relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)]
        w-full max-w-6xl items-center justify-center
      "
    >
      <section class="flex w-full max-w-3xl flex-col items-center text-center">
        <!-- Logo SIMP otomatis ganti light/dark -->
        <img
          :src="heroLogo"
          alt="Logo SIMP"
          class="mx-auto h-36 w-auto object-contain sm:h-44 md:h-52"
        />

        <h2
          class="
            mt-3 text-balance text-[length:var(--app-font-display)]
            font-black leading-[1.14] text-[var(--app-heading)]
            drop-shadow-[var(--landing-title-shadow)]
          "
        >
          Kelola Surat Sekolah
          <span class="block text-[var(--app-accent)] [html.dark_&]:text-[var(--app-success)]">
            Lebih Cepat, Lebih Rapi
          </span>
        </h2>

        <p
          class="
            mt-3 max-w-2xl text-[length:var(--app-font-base)]
            font-medium leading-relaxed text-[var(--app-subtext)]
          "
        >
          Platform manajemen persuratan untuk alur yang lebih terstruktur. Setiap surat masuk dan
          keluar tercatat rapi agar koordinasi tim lebih cepat, jelas, dan mudah ditelusuri.
        </p>

        <VButton
          variant="primary"
          class="mt-6 w-full max-w-[280px]"
          @click="goToLogin"
        >
          Mulai sekarang
        </VButton>
      </section>
    </div>

    <div class="pointer-events-none absolute bottom-5 left-0 z-10 w-full text-center sm:bottom-6">
      <p
        class="
          text-[length:var(--app-font-caption)]
          font-medium tracking-[0.08em] text-[var(--app-muted)]
        "
      >
        Propenchil Team © 2026
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import VButton from '@/components/common/VButton.vue'

import simPLogoLight from '@/assets/SIMP_logo.png'
import simPLogoDark from '@/assets/SIMP_logo_dark.png'

const router = useRouter()

const landingRef = ref<HTMLElement | null>(null)

const pointerTarget = ref({ x: 0.5, y: 0.5 })
const pointerSmooth = ref({ x: 0.5, y: 0.5 })
const waveEnergy = ref(0.28)
const lastPointer = ref<{ x: number; y: number; t: number } | null>(null)

const isDarkMode = ref(false)

let animationFrame = 0
let themeObserver: MutationObserver | null = null

const syncTheme = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark')
}

const heroLogo = computed(() => {
  return isDarkMode.value ? simPLogoDark : simPLogoLight
})

const goToLogin = () => {
  router.push('/login')
}

const handlePointerMove = (event: PointerEvent) => {
  if (!landingRef.value) return

  const rect = landingRef.value.getBoundingClientRect()
  const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
  const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
  const now = performance.now()

  if (lastPointer.value) {
    const dx = x - lastPointer.value.x
    const dy = y - lastPointer.value.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    const dt = Math.max(16, now - lastPointer.value.t)
    const speed = distance / (dt / 16.67)
    const impulse = Math.min(1, speed * 6.4)

    waveEnergy.value = Math.max(waveEnergy.value, 0.24 + impulse * 0.6)
  }

  lastPointer.value = { x, y, t: now }
  pointerTarget.value.x = x
  pointerTarget.value.y = y
}

const handlePointerLeave = () => {
  pointerTarget.value.x = 0.5
  pointerTarget.value.y = 0.5
  lastPointer.value = null
}

const animateFlow = () => {
  pointerSmooth.value.x += (pointerTarget.value.x - pointerSmooth.value.x) * 0.07
  pointerSmooth.value.y += (pointerTarget.value.y - pointerSmooth.value.y) * 0.07
  waveEnergy.value += (0.22 - waveEnergy.value) * 0.034

  animationFrame = requestAnimationFrame(animateFlow)
}

onMounted(() => {
  syncTheme()

  themeObserver = new MutationObserver(() => {
    syncTheme()
  })

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })

  animationFrame = requestAnimationFrame(animateFlow)
})

onBeforeUnmount(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
  if (themeObserver) themeObserver.disconnect()
})

const waveVars = computed(() => ({
  '--mx': `${(pointerSmooth.value.x * 100).toFixed(2)}%`,
  '--my': `${(pointerSmooth.value.y * 100).toFixed(2)}%`,
  '--wave-energy': waveEnergy.value.toFixed(3),
  '--wave-spread': `${(72 + waveEnergy.value * 82).toFixed(2)}%`,
  '--ripple-duration': `${(13 - waveEnergy.value * 2.8).toFixed(2)}s`,
  '--bounce-duration': `${(11 - waveEnergy.value * 2.1).toFixed(2)}s`,
  '--flow-duration': `${(15.6 - waveEnergy.value * 2.4).toFixed(2)}s`,
}))
</script>