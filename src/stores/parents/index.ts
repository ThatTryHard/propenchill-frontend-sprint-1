import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/users/auth'

const VITE_API_URL = import.meta.env.VITE_API_URL
const INDO_PHONE_REGEX = /^(\+62|62|0)8[1-9][0-9]{7,11}$/

export interface Parent {
  id: number
  nama: string
  email: string
  no_hp: string
  role: string
  tanggal_lahir: string | null
  alamat: string | null
}

export interface Pagination {
  currentPage: number
  totalPages: number
  totalData: number
  limit: number
}

function authHeaders() {
  const auth = useAuthStore()
  return { Authorization: `Bearer ${auth.accessToken}` }
}

export function validateParentForm(form: { nama: string; email: string; no_hp: string }) {
  const errors: Record<string, string> = {}

  if (!form.nama.trim()) errors.nama = 'Nama wajib diisi!'
  if (!form.email.trim()) {
    errors.email = 'Email wajib diisi!'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Format email tidak valid!'
  }
  if (!form.no_hp.trim()) {
    errors.no_hp = 'Nomor HP wajib diisi!'
  } else if (!INDO_PHONE_REGEX.test(form.no_hp)) {
    errors.no_hp =
      'Format nomor HP tidak valid. Gunakan format Indonesia (contoh: 08123456789 atau +628123456789).'
  }

  return errors
}

export const useParentStore = defineStore('parents', () => {
  const parents = ref<Parent[]>([])
  const allParents = ref<Parent[]>([])
  const isLoading = ref(false)
  const pagination = reactive<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalData: 0,
    limit: 10,
  })

  function applyPagination(page: number) {
    pagination.totalData = allParents.value.length
    pagination.totalPages = Math.max(1, Math.ceil(pagination.totalData / pagination.limit))

    const safePage = Math.min(Math.max(page, 1), pagination.totalPages)
    pagination.currentPage = safePage

    const startIndex = (safePage - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    parents.value = allParents.value.slice(startIndex, endIndex)
  }

  function setParentPage(page: number) {
    applyPagination(page)
  }

  async function fetchParents(page = 1, query = '') {
    isLoading.value = true
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())

      const queryString = params.toString()
      const endpoint = queryString
        ? `${VITE_API_URL}/api/parents/?${queryString}`
        : `${VITE_API_URL}/api/parents/`

      const res = await fetch(endpoint, {
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error('Gagal memuat data')

      const result = await res.json()
      allParents.value = Array.isArray(result.data) ? result.data : []
      applyPagination(page)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchParentById(id: string | number): Promise<Parent> {
    const numericId = Number(id)
    if (Number.isNaN(numericId)) throw new Error('ID wali murid tidak valid')

    const res = await fetch(`${VITE_API_URL}/api/parents/${numericId}/`, {
      headers: authHeaders(),
    })
    if (!res.ok) throw new Error('Gagal memuat data wali murid')

    const result = await res.json()
    const parent = result.data ?? result
    if (!parent?.id) throw new Error('Data wali murid tidak ditemukan')
    return parent as Parent
  }

  async function createParent(body: Record<string, string>) {
    const res = await fetch(`${VITE_API_URL}/api/parents/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Gagal membuat akun wali murid')
    return data
  }

  async function updateParent(id: string | number, body: Record<string, string>) {
    const res = await fetch(`${VITE_API_URL}/api/parents/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Gagal memperbarui data wali murid')
    return data
  }

  async function deleteParent(id: string | number) {
    const res = await fetch(`${VITE_API_URL}/api/parents/${id}/`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Gagal menghapus wali murid')
    return data
  }

  return {
    parents,
    isLoading,
    pagination,
    fetchParents,
    setParentPage,
    fetchParentById,
    createParent,
    updateParent,
    deleteParent,
  }
})
