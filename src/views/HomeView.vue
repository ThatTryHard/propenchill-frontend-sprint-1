<template>
  <div
    ref="landingRef"
    class="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f6fbf8_0%,#edf6f1_100%)] px-5 py-8 sm:px-8"
    :style="waveVars"
    @pointermove="handlePointerMove"
    @pointerleave="handlePointerLeave"
  >
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(23,99,61,0.16),transparent_35%),radial-gradient(circle_at_82%_78%,rgba(57,132,88,0.13),transparent_40%)]"
    />

    <div class="pointer-events-none absolute top-3 left-4 z-20 sm:left-8 sm:top-5">
      <img
        src="@/assets/Inrab_Logo.png"
        alt="Logo SMA Insan Rabbany"
        class="h-9 w-auto object-contain sm:h-10"
      />
    </div>

    <div
      class="pointer-events-none absolute inset-0 mix-blend-multiply"
      :style="{ opacity: (0.32 + waveEnergy * 0.2).toFixed(3) }"
    >
      <div class="wave-ripples" />
    </div>

    <div
      class="pointer-events-none absolute inset-0 mix-blend-multiply"
      :style="{ opacity: (0.21 + waveEnergy * 0.15).toFixed(3) }"
    >
      <div class="wave-bounce" />
    </div>

    <div
      class="pointer-events-none absolute inset-0 mix-blend-multiply"
      :style="{ opacity: (0.23 + waveEnergy * 0.12).toFixed(3) }"
    >
      <div class="flow-lines" />
    </div>

    <div
      class="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center"
    >
      <section class="flex w-full max-w-4xl flex-col items-center text-center">
        <img
          src="@/assets/SIMP_logo.png"
          alt="Logo SIMP"
          class="mx-auto h-52 w-auto object-contain sm:h-64 md:h-72"
        />

        <h2
          class="mt-4 text-balance text-3xl font-black leading-[1.14] text-[#0c4923] drop-shadow-[0_1px_0_rgba(255,255,255,0.6)] sm:text-4xl md:text-5xl"
        >
          Kelola Surat Sekolah
          <span class="text-[#2f8f58]">Lebih Cepat, Lebih Rapi</span>
        </h2>

        <p class="mt-3 max-w-3xl text-base font-medium leading-relaxed text-[#315f48] sm:text-lg">
          Platform manajemen persuratan untuk alur yang lebih terstruktur. Setiap surat masuk dan
          keluar tercatat rapi agar koordinasi tim lebih cepat, jelas, dan mudah ditelusuri.
        </p>

        <VButton
          variant="primary"
          class="mt-8 !h-[54px] !w-full !max-w-[340px] !rounded-[16px] !text-[15px]"
          @click="goToLogin"
        >
          Mulai sekarang
        </VButton>
      </section>
    </div>

    <div class="pointer-events-none absolute bottom-5 left-0 z-10 w-full text-center sm:bottom-6">
      <p class="text-[11px] font-medium tracking-[0.08em] text-[#4d6e5a] sm:text-xs">
        Propenchil Team © 2026
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import VButton from '@/components/common/VButton.vue'

const router = useRouter()
const landingRef = ref<HTMLElement | null>(null)
const pointerTarget = ref({ x: 0.5, y: 0.5 })
const pointerSmooth = ref({ x: 0.5, y: 0.5 })
const waveEnergy = ref(0.28)
const lastPointer = ref<{ x: number; y: number; t: number } | null>(null)
let animationFrame = 0

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

    // Kecepatan dalam piksel per frame (asumsi 60fps = 16.67ms per frame)
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
  animationFrame = requestAnimationFrame(animateFlow)
})

onBeforeUnmount(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame)
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

<style scoped>
/* Wave Effects */
.wave-ripples {
  position: absolute;
  inset: -8%;
  background-image:
    radial-gradient(
      var(--wave-spread) calc(var(--wave-spread) * 0.72) at var(--mx) var(--my),
      rgba(10, 76, 44, calc(0.3 + var(--wave-energy) * 0.22)) 0%,
      rgba(10, 76, 44, calc(0.13 + var(--wave-energy) * 0.11)) 24%,
      rgba(10, 76, 44, 0) 62%
    ),
    repeating-linear-gradient(
      102deg,
      rgba(12, 90, 52, calc(0.14 + var(--wave-energy) * 0.11)) 0,
      rgba(12, 90, 52, calc(0.14 + var(--wave-energy) * 0.11)) 2px,
      rgba(20, 103, 62, 0) 2px,
      rgba(20, 103, 62, 0) 20px
    );
  background-size:
    100% 100%,
    220% 220%;
  filter: blur(18px);
  animation: ripple-drift var(--ripple-duration) ease-in-out infinite alternate;
}

/* Bounce Effects */
.wave-bounce {
  position: absolute;
  inset: -7%;
  background-image:
    radial-gradient(
      calc(var(--wave-spread) * 0.92) calc(var(--wave-spread) * 0.62) at calc(var(--mx) - 7%)
        calc(var(--my) + 3%),
      rgba(22, 103, 62, calc(0.2 + var(--wave-energy) * 0.12)) 0%,
      rgba(22, 103, 62, calc(0.1 + var(--wave-energy) * 0.07)) 28%,
      rgba(36, 121, 76, 0) 64%
    ),
    repeating-linear-gradient(
      94deg,
      rgba(16, 97, 57, calc(0.11 + var(--wave-energy) * 0.07)) 0,
      rgba(16, 97, 57, calc(0.11 + var(--wave-energy) * 0.07)) 1px,
      rgba(24, 110, 67, 0) 1px,
      rgba(24, 110, 67, 0) 22px
    );
  background-size:
    100% 100%,
    250% 250%;
  filter: blur(28px);
  animation: ripple-bounce var(--bounce-duration) ease-in-out infinite;
}

/* Flow Effects */
.flow-lines {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(
      122deg,
      rgba(10, 82, 47, calc(0.12 + var(--wave-energy) * 0.08)) 0%,
      rgba(10, 82, 47, 0) 34%
    ),
    linear-gradient(
      300deg,
      rgba(37, 120, 74, calc(0.1 + var(--wave-energy) * 0.07)) 0%,
      rgba(37, 120, 74, 0) 42%
    ),
    radial-gradient(
      120% 72% at var(--mx) var(--my),
      rgba(255, 255, 255, 0.24) 0%,
      rgba(255, 255, 255, 0) 62%
    );
  background-size: 240% 240%;
  animation: flow-wave var(--flow-duration) linear infinite;
}

@keyframes ripple-drift {
  0% {
    background-position:
      0% 50%,
      0% 38%;
    transform: translate3d(-2%, -1.2%, 0) scale(1.03);
  }
  100% {
    background-position:
      0% 50%,
      100% 62%;
    transform: translate3d(2.4%, 1.1%, 0) scale(1.07);
  }
}

@keyframes ripple-bounce {
  0% {
    background-position:
      0% 50%,
      14% 48%;
    transform: translate3d(-1.4%, 0, 0) scale(1.02);
  }
  50% {
    background-position:
      0% 50%,
      70% 53%;
    transform: translate3d(2.5%, 1.3%, 0) scale(1.08);
  }
  100% {
    background-position:
      0% 50%,
      16% 49%;
    transform: translate3d(-1.1%, -0.8%, 0) scale(1.03);
  }
}

@keyframes flow-wave {
  0% {
    transform: translate3d(-6.5%, -4%, 0) scale(1.04);
  }
  50% {
    transform: translate3d(6%, 4.5%, 0) scale(1.08);
  }
  100% {
    transform: translate3d(-6.5%, -4%, 0) scale(1.04);
  }
}
</style>
