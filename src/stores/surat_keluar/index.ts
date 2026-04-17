import { defineStore } from 'pinia'

export const useSuratKeluarStore = defineStore('suratKeluar', {
  state: () => ({
    listPengajuan: [],
    loading: false,
    alertState: {
      show: false,
      type: 'success',
      title: '',
      message: '',
    }
  }),
  actions: {
    triggerAlert(title: string, message: string, type: 'success' | 'error' | 'warning' | 'information' = 'success') {
      this.alertState = {
        show: true,
        title,
        message,
        type
      }
      
      if (type === 'success') {
        setTimeout(() => {
          this.alertState.show = false
        }, 5000)
      }
    },
    closeAlert() {
      this.alertState.show = false
    }
  }
})