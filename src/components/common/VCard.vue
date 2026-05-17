<script setup lang="ts">
import { computed } from 'vue'
import VButton from '@/components/common/VButton.vue'

const props = withDefaults(
  defineProps<{
    paddingClass?: string
    overflowClass?: string

    title?: string
    description?: string

    showAsset?: boolean
    assetSrc?: string
    assetAlt?: string

    primaryButtonText?: string
    secondaryButtonText?: string

    primaryDisabled?: boolean
    secondaryDisabled?: boolean
  }>(),
  {
    paddingClass: '',
    overflowClass: 'overflow-hidden',

    title: '',
    description: '',

    showAsset: true,
    assetSrc: '',
    assetAlt: 'Card asset',

    primaryButtonText: '',
    secondaryButtonText: '',

    primaryDisabled: false,
    secondaryDisabled: false,
  },
)

const emit = defineEmits<{
  (e: 'primary-click'): void
  (e: 'secondary-click'): void
}>()

const hasAsset = computed(() => props.showAsset && Boolean(props.assetSrc))
const hasPrimaryButton = computed(() => Boolean(props.primaryButtonText))
const hasSecondaryButton = computed(() => Boolean(props.secondaryButtonText))
const hasActions = computed(() => hasPrimaryButton.value || hasSecondaryButton.value)

const hasStructuredContent = computed(() => {
  return Boolean(props.title || props.description || hasAsset.value || hasActions.value)
})
</script>

<template>
  <div
    :class="[
      'relative box-border flex w-full flex-col border-[0.5px] border-transparent',
      'rounded-[28px] px-[22px] py-4 font-[var(--font-sans)] text-[var(--app-text)]',
      'backdrop-blur-[10px]',
      'shadow-[0_-2px_4px_rgba(0,0,0,0.2)_inset,0_2px_4px_rgba(255,255,255,0.4)_inset]',
      '[--v-card-bg:color-mix(in_srgb,var(--app-chip-primary)_35%,var(--app-card))]',
      '[background:linear-gradient(var(--v-card-bg),var(--v-card-bg))_padding-box,linear-gradient(90deg,rgba(255,255,255,0.05),rgba(255,255,255,0.85)_49.04%,rgba(255,255,255,0.05))_border-box]',
      'dark:[--v-card-bg:color-mix(in_srgb,var(--app-chip-primary)_28%,var(--app-card))]',
      'dark:[background:linear-gradient(var(--v-card-bg),var(--v-card-bg))_padding-box,linear-gradient(90deg,rgba(255,255,255,0.04),rgba(162,183,202,0.28)_49.04%,rgba(255,255,255,0.04))_border-box]',
      overflowClass,
      paddingClass,
    ]"
  >
    <slot>
      <div
        v-if="hasStructuredContent"
        class="flex w-full flex-col items-center justify-center gap-[10px]"
      >
        <div
          v-if="title || $slots.header"
          class="flex w-full items-start"
        >
          <slot name="header">
            <b
              class="flex-1 text-[length:var(--app-font-xl)] font-bold leading-[1.2] text-[var(--app-heading)]"
            >
              {{ title }}
            </b>
          </slot>
        </div>

        <div
          v-if="hasAsset || $slots.asset"
          class="flex items-center justify-center"
        >
          <slot name="asset">
            <img
              v-if="hasAsset"
              :src="assetSrc"
              :alt="assetAlt"
              class="h-[60px] w-[60px] object-contain"
            />
          </slot>
        </div>

        <div
          v-if="description || $slots.body"
          class="w-full"
        >
          <slot name="body">
            <p
              class="m-0 text-[length:var(--app-card-desc-font)] font-normal leading-[1.5] text-[var(--app-subtext)]"
            >
              {{ description }}
            </p>
          </slot>
        </div>

        <div
          v-if="hasActions || $slots.actions"
          class="flex w-full flex-col items-stretch gap-2"
        >
          <slot name="actions">
            <VButton
              v-if="hasPrimaryButton"
              variant="primary"
              class="w-full"
              :disabled="primaryDisabled"
              @click="emit('primary-click')"
            >
              {{ primaryButtonText }}
            </VButton>

            <VButton
              v-if="hasSecondaryButton"
              variant="secondary"
              class="w-full"
              :disabled="secondaryDisabled"
              @click="emit('secondary-click')"
            >
              {{ secondaryButtonText }}
            </VButton>
          </slot>
        </div>
      </div>
    </slot>
  </div>
</template>