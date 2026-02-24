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
  <div class=" h-screen w-screen overflow-hidden min-h-screen bg-[#15803d] flex flex-col items-center justify-center p-6 font-sans antialiased">

    <main class="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] p-10 flex flex-col items-center text-center transition-transform hover:scale-[1.01] duration-300">

      <h1 class="text-4xl font-bold text-slate-900 tracking-tight mb-6">
        PropenChill Team's
      </h1>
      <img src="@/assets/SIMP_logo.png" alt="SIMP Logo" class="" />

      <h2 class="text-xl text-slate-700 mb-2">
        Frontend Environment is ready and running!
      </h2>

      <div class="w-full bg-slate-100 rounded-2xl p-5 border border-slate-200">
        <h3 class="text-s font-bold text-slate-500 tracking-widest mb-3">
          Backend Connection Status:
        </h3>

        <div :class="[
          'inline-flex items-center gap-3 px-5 py-3 rounded-full text-sm font-bold transition-colors w-full justify-center',
          loading ? 'bg-slate-200 text-slate-600' :
          isError ? 'bg-red-100 text-red-700 border border-red-200' :
                    'bg-green-100 text-green-700 border border-green-200'
        ]">
          <span class="relative flex h-3 w-3">
            <span v-if="!loading" :class="['animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', isError ? 'bg-red-400' : 'bg-green-400']"></span>
            <span :class="['relative inline-flex rounded-full h-3 w-3', loading ? 'bg-slate-400' : isError ? 'bg-red-500' : 'bg-green-500']"></span>
          </span>

          <span class="truncate">
            {{ loading ? 'Synchronizing...' : backendStatus }}
          </span>
        </div>

        <button @click="checkBackendConnection" class="mt-4 text-s flex items-center justify-center gap-1 text-slate-400 hover:text-green-600 font-semibold mx-auto transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Status
        </button>
      </div>

    </main>

    <footer class="mt-10 text-green-200/60 text-sm font-medium tracking-[0.2em]">
      <p class="mt-8 text-green-200 text-sm font-medium">Propenchill Team &copy; 2026</p>
    </footer>

  </div>
</template>
