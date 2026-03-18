import { reactive } from 'vue'

export type AlertType = 'error' | 'success' | 'information' | 'warning'

const alertState = reactive({
  show: false,
  type: 'information' as AlertType,
  title: '',
  message: '',
})

let hideTimer: ReturnType<typeof setTimeout> | null = null

const clearHideTimer = () => {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

const closeAlert = () => {
  clearHideTimer()
  alertState.show = false
}

const showAlert = (type: AlertType, message: string, title = '', duration = 4000) => {
  clearHideTimer()
  alertState.type = type
  alertState.title = title
  alertState.message = message
  alertState.show = true

  if (duration > 0) {
    hideTimer = setTimeout(() => {
      alertState.show = false
      hideTimer = null
    }, duration)
  }
}

export const useGlobalAlert = () => ({
  alertState,
  showAlert,
  closeAlert,
})
