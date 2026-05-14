import { computed } from 'vue'
import { useSettingsPreferenceStore } from '@/stores/settingsPreference'

export const useThemeColors = () => {
  const store = useSettingsPreferenceStore()
  
  const isDark = computed(() => {
    if (store.preference) {
      return store.preference.theme === 'DARK'
    }
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })

  return computed(() => ({
    success: isDark.value ? '#8fd2a6' : '#6caf85',
    danger: isDark.value ? '#f7b3aa' : '#a0453b',
    warning: isDark.value ? '#e2c16b' : '#c8a23a',
    info: isDark.value ? '#a9c2d9' : '#86a1ba',
    accent: '#3f9760', 
    accent2: '#d1955f',
    muted: isDark.value ? '#94a3b8' : '#718096',
    border: isDark.value ? '#475569' : '#d4e8da', // using solid color for chart borders instead of rgba for better rendering
  }))
}
