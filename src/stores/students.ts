import { defineStore } from 'pinia'
import axios from 'axios'

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface Student {
  student_id: number
  nis: string
  nama: string
  kelas: string
  tanggal_lahir: string
}

export interface StudentPagination {
  halaman_sekarang: number
  total_halaman: number
  total_data: number
  limit: number
}

export interface StudentPayload {
  nis: string
  nama: string
  kelas: string
  tanggal_lahir: string
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
    loading: false,
    error: '',
  }),

  actions: {
    getToken() {
      return (
        localStorage.getItem('access_token') ||
        localStorage.getItem('token') ||
        ''
      )
    },

    getAuthHeader() {
      const token = this.getToken()

      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    },

    resetState() {
      this.students = []
      this.pagination = {
        halaman_sekarang: 1,
        total_halaman: 1,
        total_data: 0,
        limit: 10,
      }
      this.loading = false
      this.error = ''
    },

    async fetchStudents(page = 1, limit = 10, q = '', kelas = '') {
      this.loading = true
      this.error = ''

      try {
        const token = this.getToken()

        console.log('TOKEN YANG DIPAKAI:', token)
        console.log('REQUEST KE:', `${VITE_API_URL}/api/siswa/`)
        console.log('PARAMS:', { page, limit, q, kelas })

        const response = await axios.get(`${VITE_API_URL}/api/siswa/`, {
          ...this.getAuthHeader(),
          params: { page, limit, q, kelas },
        })

        console.log('FETCH STUDENTS SUCCESS:', response.data)

        this.students = response.data?.data || []
        this.pagination = response.data?.pagination || {
          halaman_sekarang: 1,
          total_halaman: 1,
          total_data: 0,
          limit: 10,
        }
      } catch (error: any) {
        console.log('FETCH STUDENTS ERROR FULL:', error)
        console.log('FETCH STUDENTS ERROR RESPONSE:', error?.response)
        console.log('FETCH STUDENTS ERROR STATUS:', error?.response?.status)
        console.log('FETCH STUDENTS ERROR DATA:', error?.response?.data)

        if (error?.response?.status === 401) {
          this.error = 'Unauthorized. Silakan login ulang.'
        } else if (error?.response?.status === 403) {
          this.error = error?.response?.data?.error || 'Anda tidak punya akses ke data siswa.'
        } else if (error?.response?.status === 404) {
          this.error = 'Endpoint data siswa tidak ditemukan.'
        } else if (error?.response?.status === 500) {
          this.error = 'Terjadi error pada server backend.'
        } else {
          this.error =
            error?.response?.data?.error || 'Gagal mengambil data siswa.'
        }

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

    async createStudent(payload: StudentPayload) {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.post(
          `${VITE_API_URL}/api/siswa/create/`,
          payload,
          this.getAuthHeader()
        )

        return response.data
      } catch (error: any) {
        console.log('CREATE STUDENT ERROR:', error?.response)

        this.error =
          error?.response?.data?.error || 'Gagal menambahkan data siswa.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateStudent(id: number, payload: StudentPayload) {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.put(
          `${VITE_API_URL}/api/siswa/${id}/update/`,
          payload,
          this.getAuthHeader()
        )

        return response.data
      } catch (error: any) {
        console.log('UPDATE STUDENT ERROR:', error?.response)

        this.error =
          error?.response?.data?.error || 'Gagal memperbarui data siswa.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteStudent(id: number) {
      this.loading = true
      this.error = ''

      try {
        const response = await axios.delete(
          `${VITE_API_URL}/api/siswa/${id}/delete/`,
          this.getAuthHeader()
        )

        return response.data
      } catch (error: any) {
        console.log('DELETE STUDENT ERROR:', error?.response)

        this.error =
          error?.response?.data?.error || 'Gagal menghapus data siswa.'
        throw error
      } finally {
        this.loading = false
      }
    },

    async getStudentById(id: number) {
      const foundStudent = this.students.find(
        (student) => student.student_id === id
      )

      if (foundStudent) {
        return foundStudent
      }

      await this.fetchStudents(1, 100)

      return (
        this.students.find((student) => student.student_id === id) || null
      )
    },
  },
})