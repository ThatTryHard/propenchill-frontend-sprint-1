<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Component } from 'vue'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VCard from '@/components/common/VCard.vue'
import VAccordion from '@/components/common/VAccordion.vue'
import { useHelpStore } from '@/stores/help'
import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  Clock,
  Copy,
  FileText,
  Mail,
  Search,
  Send,
  ShieldCheck,
} from 'lucide-vue-next'

const helpStore = useHelpStore()

const searchQuery = ref('')
const selectedCategoryId = ref<string | null>(null)
const copied = ref(false)

const helpData = computed(() => helpStore.helpData)

const filteredCategories = computed(() => {
  if (!helpData.value) return []

  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return helpData.value.categories

  return helpData.value.categories.filter((category) => {
    const categoryText = `${category.title} ${category.description}`.toLowerCase()
    const itemText = category.items
      .map((item) => `${item.question} ${item.answer}`)
      .join(' ')
      .toLowerCase()

    return categoryText.includes(query) || itemText.includes(query)
  })
})

const filteredQuestions = computed(() => {
  if (!helpData.value) return []

  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return helpData.value.popular_questions

  return helpData.value.popular_questions.filter((item) => {
    return `${item.question} ${item.answer}`.toLowerCase().includes(query)
  })
})

const activeCategory = computed(() => {
  if (!helpData.value || !selectedCategoryId.value) return null
  return helpData.value.categories.find((category) => category.id === selectedCategoryId.value) || null
})

const getCategoryIcon = (iconName: string): Component => {
  const icons: Record<string, Component> = {
    'book-open': BookOpen,
    'file-text': FileText,
    'shield-check': ShieldCheck,
  }

  return icons[iconName] || CircleHelp
}

const toggleCategory = (categoryId: string) => {
  selectedCategoryId.value = selectedCategoryId.value === categoryId ? null : categoryId
}

const sendEmail = () => {
  if (!helpData.value?.support_email) return
  window.location.href = `mailto:${helpData.value.support_email}`
}

const copyEmail = async () => {
  if (!helpData.value?.support_email) return

  try {
    await navigator.clipboard.writeText(helpData.value.support_email)
    copied.value = true

    window.setTimeout(() => {
      copied.value = false
    }, 1800)
  } catch {
    copied.value = false
  }
}

onMounted(() => {
  helpStore.fetchHelpFAQ()
})
</script>

<template>
  <DashboardLayout>
    <template #sidebar>
      <SIMPSidebar />
    </template>

    <section class="min-h-full bg-[#F8FAFC] px-7 py-7">
      <div class="mx-auto max-w-5xl">
        <!-- Header -->
        <div class="mb-5">
          <h1 class="text-2xl font-bold text-slate-900">Help Desk</h1>
          <p class="mt-1 text-sm text-slate-500">Bagaimana kami dapat membantu Anda?</p>
        </div>

        <!-- Search Bar -->
        <div class="mb-5">
          <div class="relative">
            <Search class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari kata kunci bantuan di sini"
              class="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-[13px] text-slate-700 shadow-sm outline-none transition focus:border-[#4A8B50] focus:ring-2 focus:ring-[#4A8B50]/20"
            />
          </div>
        </div>

        <!-- Loading -->
        <VCard
          v-if="helpStore.loading"
          paddingClass="p-5"
        >
          <p class="text-[13px] text-slate-600">Memuat data Help & FAQ...</p>
        </VCard>

        <!-- Error -->
        <div
          v-else-if="helpStore.error"
          class="rounded-2xl border border-red-200 bg-red-50 p-5 text-[13px] text-red-700 shadow-sm"
        >
          {{ helpStore.error }}
        </div>

        <template v-else-if="helpData">
          <!-- Category Cards -->
          <div class="grid gap-4 md:grid-cols-3">
            <VCard
              v-for="category in filteredCategories"
              :key="category.id"
              paddingClass="p-5"
              class="min-h-[205px] transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                class="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl"
                :class="
                  category.id === 'info-surat'
                    ? 'bg-[#C98D4A]/15 text-[#C98D4A]'
                    : 'bg-[#4A8B50]/15 text-[#4A8B50]'
                "
              >
                <component
                  :is="getCategoryIcon(category.icon)"
                  class="h-6 w-6"
                />
              </div>

              <h2 class="text-base font-semibold text-slate-900">
                {{ category.title }}
              </h2>

              <p class="mt-2 min-h-[52px] text-[13px] leading-6 text-slate-600">
                {{ category.description }}
              </p>

              <button
                type="button"
                class="mt-4 flex w-full items-center justify-between rounded-full border border-slate-200 bg-[#F8FAFC] px-4 py-2 text-[13px] font-medium text-slate-700 transition hover:border-[#4A8B50] hover:text-[#4A8B50]"
                @click="toggleCategory(category.id)"
              >
                <span>{{ category.button_label }}</span>
                <ChevronRight
                  class="h-4 w-4 transition"
                  :class="{ 'rotate-90': selectedCategoryId === category.id }"
                />
              </button>
            </VCard>
          </div>

          <!-- Empty Category Search -->
          <VCard
            v-if="filteredCategories.length === 0"
            paddingClass="p-5"
            class="mt-5"
          >
            <p class="text-[13px] text-slate-600">
              Tidak ada kategori bantuan yang sesuai dengan pencarian.
            </p>
          </VCard>

          <!-- Category Detail -->
          <VCard
            v-if="activeCategory"
            paddingClass="p-5"
            class="mt-5"
          >
            <div class="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 class="text-lg font-bold text-slate-900">
                  {{ activeCategory.title }}
                </h2>
                <p class="mt-1 text-[13px] text-slate-600">
                  {{ activeCategory.description }}
                </p>
              </div>

              <button
                type="button"
                class="rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
                @click="selectedCategoryId = null"
              >
                Tutup
              </button>
            </div>

            <div
              v-if="activeCategory.items.length"
              class="flex flex-col gap-2.5"
            >
              <VAccordion
                v-for="item in activeCategory.items"
                :key="item.question"
                :title="item.question"
                titleClass="text-[13px]"
                contentClass="text-[12px]"
              >
                <p class="text-[12px] leading-6 text-[#f8fafc]/90">
                  {{ item.answer }}
                </p>
              </VAccordion>
            </div>

            <p
              v-else
              class="text-[13px] text-slate-600"
            >
              Belum ada panduan pada kategori ini.
            </p>
          </VCard>

          <!-- Popular Questions -->
          <div class="mt-7">
            <h2 class="mb-3 text-lg font-bold text-slate-900">Pertanyaan Populer</h2>

            <div
              v-if="filteredQuestions.length"
              class="flex flex-col gap-2.5"
            >
              <VAccordion
                v-for="item in filteredQuestions"
                :key="item.question"
                :title="item.question"
                titleClass="text-[13px]"
                contentClass="text-[12px]"
              >
                <p class="text-[12px] leading-6 text-[#f8fafc]/90">
                  {{ item.answer }}
                </p>
              </VAccordion>
            </div>

            <VCard
              v-else
              paddingClass="p-5"
            >
              <p class="text-[13px] text-slate-600">
                Tidak ada pertanyaan yang sesuai dengan pencarian.
              </p>
            </VCard>
          </div>

          <!-- Additional Help -->
          <VCard
            paddingClass="p-5"
            class="mt-7"
          >
            <div class="grid items-center gap-4 md:grid-cols-[1.35fr_1fr]">
              <div>
                <h2 class="text-lg font-bold text-slate-900">
                  {{ helpData.additional_help.title }}
                </h2>

                <p class="mt-1.5 max-w-xl text-[12px] leading-5 text-slate-600">
                  {{ helpData.additional_help.description }}
                </p>

                <div class="mt-3 flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4A8B50]/15 text-[#4A8B50]"
                  >
                    <Mail class="h-4 w-4" />
                  </div>

                  <p class="break-all text-base font-semibold text-slate-800">
                    {{ helpData.support_email }}
                  </p>
                </div>

                <div class="mt-4 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-xl bg-[#4A8B50] px-3.5 py-2 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#3E7744]"
                    @click="sendEmail"
                  >
                    <Send class="h-3.5 w-3.5" />
                    Kirim Email
                  </button>

                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:border-[#4A8B50] hover:text-[#4A8B50]"
                    @click="copyEmail"
                  >
                    <Copy class="h-3.5 w-3.5" />
                    {{ copied ? 'Email Tersalin' : 'Salin Email' }}
                  </button>
                </div>
              </div>

              <div
                class="flex items-center gap-3 border-t border-white/60 pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0"
              >
                <div
                  class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4A8B50]/15 text-[#4A8B50]"
                >
                  <Clock class="h-4 w-4" />
                </div>

                <div>
                  <p class="text-[12px] font-semibold text-slate-800">Jam Layanan</p>
                  <p class="mt-0.5 text-[12px] text-slate-600">
                    {{ helpData.additional_help.operational_days }}
                  </p>
                  <p class="text-[12px] text-slate-600">
                    {{ helpData.additional_help.operational_hours }}
                  </p>
                </div>
              </div>
            </div>
          </VCard>
        </template>
      </div>
    </section>
  </DashboardLayout>
</template>