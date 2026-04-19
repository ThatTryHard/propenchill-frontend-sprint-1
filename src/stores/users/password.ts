import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const VITE_API_URL = import.meta.env.VITE_API_URL

export const usePasswordStore = defineStore('password', () => {
  const verifiedEmail = ref('')
  const verifiedOtp = ref('')

  const checkPasswordStrength = (password: string) => {
    const reqMinLength = password.length >= 8
    const reqCapital = /[A-Z]/.test(password)
    const reqNumber = /[0-9]/.test(password)
    const reqSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)

    const isValid = reqMinLength && reqCapital && reqNumber && reqSymbol

    let score = 0
    if (reqMinLength) score++
    if (reqCapital) score++
    if (reqNumber) score++
    if (reqSymbol) score++

    let text = ''
    let color = ''

    if (password.length === 0) {
      text = ''
      color = ''
    } else if (score <= 2) {
      text = 'Lemah'
      color = 'text-red-500'
    } else if (score === 3) {
      text = 'Kuat'
      color = 'text-[#D1955F]'
    } else {
      text = 'Sangat Kuat'
      color = 'text-[#3f9760]'
    }

    return {
      reqMinLength,
      reqCapital,
      reqNumber,
      reqSymbol,
      isValid,
      text,
      color,
    }
  }

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
    checkPasswordStrength,
    requestOTP,
    verifyOTP,
    setNewPassword,
  }
})
