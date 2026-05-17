<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Component } from 'vue'
import DashboardLayout from '@/components/common/DashboardLayout.vue'
import SIMPSidebar from '@/components/layout/SIMPSidebar.vue'
import VCard from '@/components/common/VCard.vue'
import VAccordion from '@/components/common/VAccordion.vue'
import VButton from '@/components/common/VButton.vue'
import VInputField from '@/components/common/VInputField.vue'
import { useHelpStore } from '@/stores/help'
import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  Clock,
  Copy,
  FileText,
  Mail,
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
  if (!query) return helpData.value.faq

  return helpData.value.faq.filter((item) => {
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

const closeCategoryDetail = () => {
  selectedCategoryId.value = null
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

    <section
      class="
        min-h-full bg-[var(--app-bg)] px-7 py-7
        font-[var(--font-sans)] text-[var(--app-text)]
      "
    >
      <div class="mx-auto max-w-5xl">
        <!-- Header -->
        <div class="mb-5">
          <h1
            class="
              text-[length:var(--app-page-title-font)]
              font-bold leading-[1.2] text-[var(--app-heading)]
            "
          >
            Help Desk
          </h1>

          <p
            class="
              mt-1 text-[length:var(--app-page-subtitle-font)]
              font-medium leading-[1.4] text-[var(--app-muted)]
            "
          >
            Bagaimana kami dapat membantu Anda?
          </p>
        </div>

        <!-- Search Bar -->
        <div class="mb-5">
          <VInputField
            v-model="searchQuery"
            state="search"
            type="search"
            placeholder="Cari kata kunci bantuan di sini"
          />
        </div>

        <!-- Loading -->
        <VCard
          v-if="helpStore.loading"
          paddingClass="p-5"
        >
          <p
            class="
              text-[length:var(--app-card-desc-font)]
              leading-[1.5] text-[var(--app-muted)]
            "
          >
            Memuat data Help & FAQ...
          </p>
        </VCard>

        <!-- Error -->
        <div
          v-else-if="helpStore.error"
          class="
            rounded-2xl border border-[var(--app-danger-border)]
            bg-[var(--app-danger-bg)] p-5
            text-[length:var(--app-card-desc-font)]
            leading-[1.5] text-[var(--app-danger)] shadow-sm
          "
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
                    ? 'bg-[var(--app-accent-2-soft)] text-[var(--app-accent-2)]'
                    : 'bg-[var(--app-accent-soft)] text-[var(--app-accent)]'
                "
              >
                <component
                  :is="getCategoryIcon(category.icon)"
                  class="h-6 w-6"
                />
              </div>

              <h2
                class="
                  text-[length:var(--app-card-title-font)]
                  font-semibold leading-[1.2] text-[var(--app-heading)]
                "
              >
                {{ category.title }}
              </h2>

              <p
                class="
                  mt-2 min-h-[52px]
                  text-[length:var(--app-card-desc-font)]
                  leading-6 text-[var(--app-muted)]
                "
              >
                {{ category.description }}
              </p>

              <VButton
                variant="tertiary"
                class="mt-4 w-full justify-between rounded-full px-4 py-2"
                @click="toggleCategory(category.id)"
              >
                {{ category.button_label }}

                <template #rightIcon>
                  <ChevronRight
                    class="h-4 w-4 transition"
                    :class="{ 'rotate-90': selectedCategoryId === category.id }"
                  />
                </template>
              </VButton>
            </VCard>
          </div>

          <!-- Empty Category Search -->
          <VCard
            v-if="filteredCategories.length === 0"
            paddingClass="p-5"
            class="mt-5"
          >
            <p
              class="
                text-[length:var(--app-card-desc-font)]
                leading-[1.5] text-[var(--app-muted)]
              "
            >
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
                <h2
                  class="
                    text-[length:var(--app-section-title-font)]
                    font-bold leading-[1.2] text-[var(--app-heading)]
                  "
                >
                  {{ activeCategory.title }}
                </h2>

                <p
                  class="
                    mt-1 text-[length:var(--app-card-desc-font)]
                    leading-[1.5] text-[var(--app-muted)]
                  "
                >
                  {{ activeCategory.description }}
                </p>
              </div>

              <VButton
                variant="tertiary"
                class="rounded-full px-3 py-1"
                @click="closeCategoryDetail"
              >
                Tutup
              </VButton>
            </div>

            <div
              v-if="activeCategory.items.length"
              class="flex flex-col gap-2.5"
            >
              <VAccordion
                v-for="item in activeCategory.items"
                :key="item.question"
                :title="item.question"
                titleClass="text-[length:var(--app-font-sm)]"
                contentClass="text-[length:var(--app-font-xs)]"
              >
                <p
                  class="
                    text-[length:var(--app-font-xs)]
                    leading-6 text-[var(--app-text-inverse)]/90
                  "
                >
                  {{ item.answer }}
                </p>
              </VAccordion>
            </div>

            <p
              v-else
              class="
                text-[length:var(--app-card-desc-font)]
                leading-[1.5] text-[var(--app-muted)]
              "
            >
              Belum ada panduan pada kategori ini.
            </p>
          </VCard>

          <!-- Popular Questions -->
          <div class="mt-7">
            <h2
              class="
                mb-3 text-[length:var(--app-section-title-font)]
                font-bold leading-[1.2] text-[var(--app-heading)]
              "
            >
              FAQ
            </h2>

            <div
              v-if="filteredQuestions.length"
              class="flex flex-col gap-2.5"
            >
              <VAccordion
                v-for="item in filteredQuestions"
                :key="item.question"
                :title="item.question"
                titleClass="text-[length:var(--app-font-sm)]"
                contentClass="text-[length:var(--app-font-xs)]"
              >
                <p
                  class="
                    text-[length:var(--app-font-xs)]
                    leading-6 text-[var(--app-text-inverse)]/90
                  "
                >
                  {{ item.answer }}
                </p>
              </VAccordion>
            </div>

            <VCard
              v-else
              paddingClass="p-5"
            >
              <p
                class="
                  text-[length:var(--app-card-desc-font)]
                  leading-[1.5] text-[var(--app-muted)]
                "
              >
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
                <h2
                  class="
                    text-[length:var(--app-section-title-font)]
                    font-bold leading-[1.2] text-[var(--app-heading)]
                  "
                >
                  {{ helpData.additional_help.title }}
                </h2>

                <p
                  class="
                    mt-1.5 max-w-xl
                    text-[length:var(--app-font-xs)]
                    leading-5 text-[var(--app-muted)]
                  "
                >
                  {{ helpData.additional_help.description }}
                </p>

                <div class="mt-3 flex items-center gap-3">
                  <div
                    class="
                      flex h-9 w-9 items-center justify-center rounded-xl
                      bg-[var(--app-accent-soft)] text-[var(--app-accent)]
                    "
                  >
                    <Mail class="h-4 w-4" />
                  </div>

                  <p
                    class="
                      break-all text-[length:var(--app-card-title-font)]
                      font-semibold leading-[1.3] text-[var(--app-heading)]
                    "
                  >
                    {{ helpData.support_email }}
                  </p>
                </div>

                <div class="mt-4 flex flex-wrap gap-2.5">
                  <VButton
                    variant="primary"
                    class="rounded-xl px-3.5 py-2"
                    @click="sendEmail"
                  >
                    <template #leftIcon>
                      <Send class="h-3.5 w-3.5" />
                    </template>

                    Kirim Email
                  </VButton>

                  <VButton
                    variant="tertiary"
                    class="rounded-xl px-3.5 py-2"
                    @click="copyEmail"
                  >
                    <template #leftIcon>
                      <Copy class="h-3.5 w-3.5" />
                    </template>

                    {{ copied ? 'Email Tersalin' : 'Salin Email' }}
                  </VButton>
                </div>
              </div>

              <div
                class="
                  flex items-center gap-3 border-t border-[var(--app-card-border)]
                  pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0
                "
              >
                <div
                  class="
                    flex h-9 w-9 items-center justify-center rounded-xl
                    bg-[var(--app-accent-soft)] text-[var(--app-accent)]
                  "
                >
                  <Clock class="h-4 w-4" />
                </div>

                <div>
                  <p
                    class="
                      text-[length:var(--app-font-xs)]
                      font-semibold leading-[1.3] text-[var(--app-heading)]
                    "
                  >
                    Jam Layanan
                  </p>

                  <p
                    class="
                      mt-0.5 text-[length:var(--app-font-xs)]
                      leading-[1.4] text-[var(--app-muted)]
                    "
                  >
                    {{ helpData.additional_help.operational_days }}
                  </p>

                  <p
                    class="
                      text-[length:var(--app-font-xs)]
                      leading-[1.4] text-[var(--app-muted)]
                    "
                  >
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