import { defineStore } from 'pinia'
import axios from 'axios'

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface Student {
  id_siswa: number
  nisn: string
  nis: string
  nama: string
  email: string
  kelas: string | null
  jenis_kelamin: 'L' | 'P'
  tanggal_lahir: string | null
  no_hp?: string | null
  alamat?: string | null
}

export interface StudentPagination {
  halaman_sekarang: number
  total_halaman: number
  total_data: number
  limit: number
}

// payload create
export interface StudentPayload {
  nisn: string
  nis: string
  nama: string
  email: string
  kelas?: string | null
  jenis_kelamin: 'L' | 'P'
  tanggal_lahir?: string | null
  no_hp?: string | null
  alamat?: string | null
}

// payload update 
export interface StudentUpdatePayload {
  nisn?: string
  nis?: string
  nama: string
  email: string
  kelas?: string | null
  jenis_kelamin: 'L' | 'P'
  tanggal_lahir?: string | null
  no_hp?: string | null
  alamat?: string | null
}

// summary dashboard
export interface StudentSummary {
  total_data: number
  total_siswa: number
  total_staff: number
}

export const useStudentStore = defineStore('students', {
  state: () => ({
    students: [] as Student[],
    pagination: {
      halaman_sekarang: 1,
      total_halaman: 1,
      total_data: 0,
      limit: 10,
    } as StudentPagination,
    summary: {
      total_data: 0,
      total_siswa: 0,
      total_staff: 0,
    } as StudentSummary,
    loading: false,
    error: '',
  }),

  actions: {
    // ambil token dari localStorage
    getToken() {
      return (
        localStorage.getItem('access_token') ||
        localStorage.getItem('token') ||
        ''
      )
    },

    // header auth untuk semua request
    getAuthHeader() {
      const token = this.getToken()

      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    },

    // reset state ke default 
    resetState() {
      this.students = []
      this.pagination = {
        halaman_sekarang: 1,
        total_halaman: 1,
        total_data: 0,
        limit: 10,
      }
      this.summary = {
        total_data: 0,
        total_siswa: 0,
        total_staff: 0,
      }
      this.loading = false
      this.error = ''
    },

    // ambil list siswa, pagination, filter
    async fetchStudents(page = 1, limit = 10, q = '', kelas = '') {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.get(`${VITE_API_URL}/api/siswa/`, {
          ...this.getAuthHeader(),
          params: { page, limit, q, kelas },
        })

        this.students = response.data?.data || []
        this.pagination = response.data?.pagination || {
          halaman_sekarang: 1,
          total_halaman: 1,
          total_data: 0,
          limit: 10,
        }
      } catch (error: any) {
        // ambil error dari backend kalau ada
        this.error =
          error?.response?.data?.error || 'Gagal mengambil data siswa.'

        this.students = []
        this.pagination = {
          halaman_sekarang: 1,
          total_halaman: 1,
          total_data: 0,
          limit: 10,
        }
      } finally {
        this.loading = false
      }
    },

    // ambil summary dashboard
    async fetchSummary() {
      try {
        const response = await axios.get(
          `${VITE_API_URL}/api/siswa/summary/`,
          this.getAuthHeader()
        )

        this.summary = response.data?.data || {
          total_data: 0,
          total_siswa: 0,
          total_staff: 0,
        }
      } catch {
        // fallback kalau gagal
        this.summary = {
          total_data: 0,
          total_siswa: 0,
          total_staff: 0,
        }
      }
    },

    // create siswa (POST)
    async createStudent(payload: StudentPayload) {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.post(
          `${VITE_API_URL}/api/siswa/`,
          payload,
          this.getAuthHeader()
        )

        return response.data
      } catch (error: any) {
        this.error =
          error?.response?.data?.error || 'Gagal menambahkan data siswa.'
        throw error
      } finally {
        this.loading = false
      }
    },

    // update siswa (PUT by id)
    async updateStudent(id_siswa: number, payload: StudentUpdatePayload) {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.put(
          `${VITE_API_URL}/api/siswa/${id_siswa}/`,
          payload,
          this.getAuthHeader()
        )

        return response.data
      } catch (error: any) {
        this.error =
          error?.response?.data?.error || 'Gagal memperbarui data siswa.'
        throw error
      } finally {
        this.loading = false
      }
    },

    // soft delete siswa
    async deleteStudent(id_siswa: number) {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.delete(
          `${VITE_API_URL}/api/siswa/${id_siswa}/`,
          this.getAuthHeader()
        )

        return response.data
      } catch (error: any) {
        this.error =
          error?.response?.data?.error || 'Gagal menghapus data siswa.'
        throw error
      } finally {
        this.loading = false
      }
    },

    // ambil detail 1 siswa
    async getStudentDetail(id_siswa: number) {
      this.error = ''

      try {
        const response = await axios.get(
          `${VITE_API_URL}/api/siswa/${id_siswa}/`,
          this.getAuthHeader()
        )

        return response.data?.data || null
      } catch (error: any) {
        this.error =
          error?.response?.data?.error || 'Gagal mengambil detail siswa.'
        return null
      }
    },

    // export excel (download file)
    async exportStudents() {
      const response = await axios.get(`${VITE_API_URL}/api/siswa/export/`, {
        ...this.getAuthHeader(),
        responseType: 'blob',
      })

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'data_siswa.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },

    // import excel (upload file)
    async importStudents(file: File) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await axios.post(
          `${VITE_API_URL}/api/siswa/import/`,
          formData,
          {
            ...this.getAuthHeader(),
            headers: {
              ...this.getAuthHeader().headers,
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        return response.data
      } catch (error: any) {
        throw error
      }
    },
  },
})