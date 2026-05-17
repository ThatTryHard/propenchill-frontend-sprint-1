<script setup lang="ts">
import { ref, onMounted } from 'vue'

const backendStatus = ref('Connecting to Server...')
const loading = ref(true)
const isError = ref(false)

const checkBackendConnection = async () => {
  loading.value = true

  try {
    const response = await fetch(import.meta.env.VITE_API_URL + '/api/test/')

    if (!response.ok) throw new Error('Server Error')

    const data = await response.json()
    backendStatus.value = data.pesan
    isError.value = false
  } catch (error) {
    console.error(error)
    backendStatus.value = 'Backend API is not Connected'
    isError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkBackendConnection()
})
</script>

<template>
  <div
    class="
      flex h-screen min-h-screen w-screen flex-col items-center justify-center
      overflow-hidden bg-[var(--app-bg)] p-6
      font-[var(--font-sans)] text-[var(--app-text)] antialiased
    "
  >
    <main
      class="
        flex w-full max-w-lg flex-col items-center rounded-[2.5rem]
        border border-[var(--app-border)] bg-[var(--app-card)]
        p-10 text-center text-[var(--app-text)]
        shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]
        transition-transform duration-300 hover:scale-[1.01]
      "
    >
      <h1
        class="
          mb-6 text-[length:var(--app-font-display)]
          font-bold tracking-tight text-[var(--app-heading)]
        "
      >
        PropenChill Team's
      </h1>

      <img
        src="@/assets/SIMP_logo.png"
        alt="SIMP Logo"
        class="h-auto max-w-full"
      />

      <h2
        class="
          mb-2 text-[length:var(--app-font-lg)]
          text-[var(--app-subtext)]
        "
      >
        Frontend Environment is ready and running!
      </h2>

      <div
        class="
          w-full rounded-2xl border border-[var(--app-border)]
          bg-[var(--app-soft-card)] p-5
        "
      >
        <h3
          class="
            mb-3 text-[length:var(--app-font-xs)]
            font-bold tracking-widest text-[var(--app-subtext)]
          "
        >
          Backend Connection Status:
        </h3>

        <div
          :class="[
            'inline-flex w-full items-center justify-center gap-3 rounded-full border px-5 py-3 text-[length:var(--app-font-sm)] font-bold transition-colors',
            loading
              ? 'border-[var(--app-border)] bg-[var(--app-input-muted-bg)] text-[var(--app-muted)]'
              : isError
                ? 'border-[var(--app-danger-border)] bg-[var(--app-danger-bg)] text-[var(--app-danger)]'
                : 'border-[var(--app-success-border)] bg-[var(--app-success-bg)] text-[var(--app-success-dark)]',
          ]"
        >
          <span class="relative flex h-3 w-3">
            <span
              v-if="!loading"
              :class="[
                'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
                isError ? 'bg-[var(--app-danger)]' : 'bg-[var(--app-success)]',
              ]"
            ></span>

            <span
              :class="[
                'relative inline-flex h-3 w-3 rounded-full',
                loading
                  ? 'bg-[var(--app-muted)]'
                  : isError
                    ? 'bg-[var(--app-danger)]'
                    : 'bg-[var(--app-success)]',
              ]"
            ></span>
          </span>

          <span class="truncate">
            {{ loading ? 'Synchronizing...' : backendStatus }}
          </span>
        </div>

        <button
          type="button"
          class="
            mx-auto mt-4 flex items-center justify-center gap-1
            text-[length:var(--app-font-xs)] font-semibold
            text-[var(--app-muted)] transition-colors
            hover:text-[var(--app-accent)]
          "
          @click="checkBackendConnection"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>

          Refresh Status
        </button>
      </div>
    </main>

    <footer
      class="
        mt-10 text-[length:var(--app-font-sm)]
        font-medium tracking-[0.2em] text-[var(--app-muted)]
      "
    >
      <p class="mt-8">Propenchill Team &copy; 2026</p>
    </footer>
  </div>
</template>