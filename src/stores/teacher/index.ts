import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/users/auth'

const VITE_API_URL = import.meta.env.VITE_API_URL
// Regex untuk memastikan tepat 8 digit angka
const NIY_REGEX = /^\d{8}$/

export interface Teacher {
  id: number;
  nama: string;
  email: string;
  niy: string;
  jabatan: string;
  role: string;
  is_active: boolean;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalData: number;
  limit: number;
}

function authHeaders() {
  const auth = useAuthStore()
  return { 
    Authorization: `Bearer ${auth.accessToken}`, 
    'Content-Type': 'application/json' 
  }
}

export function validateTeacherForm(form: { nama: string; email: string; niy: string; jabatan: string }) {
  const errors: Record<string, string> = {}

  // Validasi Nama
  if (!form.nama?.trim()) {
    errors.nama = 'Nama lengkap wajib diisi.'
  }

  // Validasi Email (Format & Kehadiran)
  if (!form.email?.trim()) {
    errors.email = 'Alamat email wajib diisi.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Format alamat email tidak valid.'
  }

  // Validasi NIY (Numerik & Tepat 8 Digit)
  if (!form.niy?.trim()) {
    errors.niy = 'Nomor Induk Yayasan (NIY) wajib diisi.'
  } else if (!/^\d+$/.test(form.niy)) {
    errors.niy = 'NIY hanya boleh berisi angka.'
  } else if (form.niy.length !== 8) {
    errors.niy = 'NIY harus berjumlah tepat 8 digit.'
  }

  // Validasi Jabatan
  if (!form.jabatan) {
    errors.jabatan = 'Jabatan harus dipilih.'
  }

  return errors
}

export const useTeacherStore = defineStore('teacher', () => {
  const teachers = ref<Teacher[]>([])
  const isLoading = ref(false)
  const pagination = reactive<Pagination>({ currentPage: 1, totalPages: 1, totalData: 0, limit: 10 })

  async function fetchTeachers(page = 1, query = '', jabatan = '') {
    isLoading.value = true
    try {
      const params = new URLSearchParams({ 
        page: String(page), 
        limit: String(pagination.limit) 
      })
      
      if (query.trim()) params.set('search', query.trim())
      if (jabatan) params.set('jabatan', jabatan)

      const res = await fetch(`${VITE_API_URL}/api/guru/?${params}`, { headers: authHeaders() })
      
      if (!res.ok) {
        teachers.value = []
        return
      }

      const result = await res.json()
      teachers.value = result.data || []

      if (result.pagination) {
        pagination.currentPage = result.pagination.halaman_saat_ini || 1
        pagination.totalPages = result.pagination.total_halaman || 1
        pagination.totalData = result.pagination.total_data || 0
      }
    } catch (error) {
      console.error("Error fetching teachers:", error)
      teachers.value = [] 
    } finally { 
      isLoading.value = false 
    }
  }

  async function fetchTeacherById(id: string | number): Promise<Teacher> {
    const res = await fetch(`${VITE_API_URL}/api/guru/${id}/`, { headers: authHeaders() })
    if (!res.ok) throw new Error('Gagal memuat data guru.')
    return await res.json()
  }

  async function createTeacher(body: Record<string, string>) {
    const res = await fetch(`${VITE_API_URL}/api/guru/`, {
      method: 'POST', 
      headers: authHeaders(), 
      body: JSON.stringify(body)
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      const error: any = new Error('Gagal menyimpan data guru.')
      error.details = data 
      throw error
    }
    return data
  }

  async function updateTeacher(id: string | number, body: Record<string, string>) {
    const res = await fetch(`${VITE_API_URL}/api/guru/${id}/`, {
      method: 'PATCH', 
      headers: authHeaders(), 
      body: JSON.stringify(body)
    })
    
    const data = await res.json()
    
    if (!res.ok) {
      const error: any = new Error('Gagal memperbarui data guru.')
      error.details = data
      throw error
    }
    return data
  }

  async function deleteTeacher(id: string | number) {
    const res = await fetch(`${VITE_API_URL}/api/guru/${id}/`, { 
      method: 'DELETE', 
      headers: authHeaders() 
    })
    if (!res.ok) throw new Error('Gagal menghapus data guru.')
  }

  return { 
    teachers, 
    isLoading, 
    pagination, 
    fetchTeachers, 
    fetchTeacherById, 
    createTeacher, 
    updateTeacher, 
    deleteTeacher 
  }
})