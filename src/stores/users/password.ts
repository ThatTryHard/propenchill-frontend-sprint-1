import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const VITE_API_URL = import.meta.env.VITE_API_URL

export const usePasswordStore = defineStore('password', () => {
  const verifiedEmail = ref('')
  const verifiedOtp = ref('')

  // 1. Fungsi Request OTP
  const requestOTP = async (email: string) => {
    try {
      const response = await axios.post(`${VITE_API_URL}/api/profile/password/request-otp/`, {
        email,
      })
      return response.data
    } catch (error) {
      throw error // Lempar error ke Vue buat ditangkep
    }
  }

  // 2. Fungsi Verify OTP
  const verifyOTP = async (email: string, otp: string) => {
    try {
      const response = await axios.post(`${VITE_API_URL}/api/profile/password/verify-otp/`, {
        email,
        otp,
      })
      verifiedEmail.value = email
      verifiedOtp.value = otp
      return response.data
    } catch (error) {
      throw error
    }
  }

  // 3. Fungsi Set New Password
  const setNewPassword = async (email: string, otp: string, password_baru: string) => {
    try {
      const response = await axios.put(`${VITE_API_URL}/api/profile/password/set-new/`, {
        email: verifiedEmail.value,
        otp: verifiedOtp.value,
        password_baru,
      })

      verifiedEmail.value = ''
      verifiedOtp.value = ''
      return response.data
    } catch (error) {
      throw error
    }
  }

  return {
    verifiedEmail,
    verifiedOtp,
    requestOTP,
    verifyOTP,
    setNewPassword,
  }
})
